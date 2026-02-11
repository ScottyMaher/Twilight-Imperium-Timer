"use client";

import { useState, useEffect, useRef } from 'react';
import Controls from '@/components/controls'
import PlayerInputForm from '@/components/player-input-form'
import PlayerCards from '@/components/PlayerCards'
import TimerConfig from '@/components/TimerConfig'
import { Player } from '@/types/index';
import { getTimerMode, getAllTimerModes } from '@/lib/timerModes';
import {
  loadPlayers,
  savePlayers,
  loadTimerState,
  saveTimerState,
  clearTimerState,
  loadModeConfig,
  saveModeConfig,
} from '@/lib/localStorage';
import { motion, AnimatePresence } from 'framer-motion';
import StarField from '@/components/StarField';
import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { Play } from 'lucide-react';

type Phase = 'configure' | 'players' | 'running';

const Home: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(() => loadPlayers());
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [phase, setPhase] = useState<Phase>('configure');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mode state — initialize from saved config or default to first mode
  const [selectedModeId, setSelectedModeId] = useState<string>(() => {
    const saved = loadModeConfig();
    return saved?.modeId ?? getAllTimerModes()[0]?.id ?? 'countUp';
  });
  const [modeConfig, setModeConfig] = useState<unknown>(() => {
    const saved = loadModeConfig();
    if (saved) {
      const mode = getTimerMode(saved.modeId);
      if (mode) return saved.config;
    }
    return getAllTimerModes()[0]?.defaultConfig ?? {};
  });

  const activeMode = getTimerMode(selectedModeId);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer state if exists
  useEffect(() => {
    const storedState = loadTimerState();

    if (storedState && storedState.isRunning) {
      const mode = getTimerMode(storedState.modeId);
      if (mode) {
        setPlayers(storedState.players);
        setCurrentPlayerIndex(storedState.currentPlayerIndex);
        setSelectedModeId(storedState.modeId);
        setModeConfig(storedState.modeConfig);
        setPhase('running');
        setIsPaused(storedState.isPaused);
        setHasStarted(true);
      }
    }

    setIsLoading(false);
  }, []);

  // Save players to localStorage whenever they change (but not while running — periodic save handles that)
  useEffect(() => {
    if (!isLoading && phase !== 'running') {
      savePlayers(players);
    }
  }, [players, isLoading, phase]);

  // Periodic save to localStorage every 60 seconds while running
  const latestStateRef = useRef({ players, currentPlayerIndex, isPaused, selectedModeId, modeConfig });
  latestStateRef.current = { players, currentPlayerIndex, isPaused, selectedModeId, modeConfig };

  useEffect(() => {
    if (!isLoading && phase === 'running') {
      const saveInterval = setInterval(() => {
        const { players, currentPlayerIndex, isPaused, selectedModeId, modeConfig } = latestStateRef.current;
        saveTimerState({
          players,
          currentPlayerIndex,
          isRunning: true,
          isPaused,
          modeId: selectedModeId,
          modeConfig,
        });
      }, 60000);
      return () => clearInterval(saveInterval);
    }
  }, [phase, isLoading]);

  // Timer effect — delegates to active mode's onTick
  useEffect(() => {
    if (!isLoading && phase === 'running' && !isPaused && activeMode) {
      timerRef.current = setInterval(() => {
        setPlayers((prevPlayers) =>
          prevPlayers.map((player, index) =>
            index === currentPlayerIndex
              ? activeMode.onTick(player, modeConfig)
              : player
          )
        );
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isPaused, currentPlayerIndex, isLoading, activeMode, modeConfig]);

  // Handle spacebar press — only while timer is actively running
  const phaseRef = useRef(phase);
  const isPausedRef = useRef(isPaused);
  const handleEndTurnRef = useRef<() => void>(() => {});
  phaseRef.current = phase;
  isPausedRef.current = isPaused;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && phaseRef.current === 'running' && !isPausedRef.current) {
        e.preventDefault();
        handleEndTurnRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleModeChange = (modeId: string, config: unknown) => {
    setSelectedModeId(modeId);
    setModeConfig(config);
    saveModeConfig(modeId, config);
  };

  const handleConfigNext = () => {
    setPhase('players');
  };

  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const handleStart = () => {
    if (!activeMode) return;

    // If already started (coming back from running), just resume
    if (hasStarted) {
      setPhase('running');
      setIsPaused(false);
      return;
    }

    const filledPlayers = players.filter(
      (player) => player.name.trim() !== ''
    );
    if (filledPlayers.length === 0) {
      alert('Please enter at least one player name.');
      return;
    }
    // Initialize players with mode-specific fields
    const initializedPlayers = filledPlayers.map((p) =>
      activeMode.initializePlayer({ ...p, time: 0 }, modeConfig)
    );
    setPlayers(initializedPlayers);
    setHasStarted(true);
    setPhase('running');
    setIsPaused(false);
    setCurrentPlayerIndex(0);
  };

  const handleEndTurn = () => {
    if (phase !== 'running' || isPaused || !activeMode) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const updatedPlayers = players.map((player, index) =>
      index === currentPlayerIndex
        ? activeMode.onEndTurn(player, modeConfig)
        : player
    );
    const nextIndex = currentPlayerIndex + 1 < players.length ? currentPlayerIndex + 1 : 0;

    setPlayers(updatedPlayers);
    setCurrentPlayerIndex(nextIndex);
    saveTimerState({
      players: updatedPlayers,
      currentPlayerIndex: nextIndex,
      isRunning: true,
      isPaused: false,
      modeId: selectedModeId,
      modeConfig,
    });
  };
  handleEndTurnRef.current = handleEndTurn;

  const handlePause = () => {
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
    saveTimerState({
      players,
      currentPlayerIndex,
      isRunning: true,
      isPaused: true,
      modeId: selectedModeId,
      modeConfig,
    });
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleBackToPlayers = () => {
    setPhase('players');
    setIsPaused(false);
  };

  const handleBackToConfigure = () => {
    setPhase('configure');
    setHasStarted(false);
    clearTimerState();
  };

  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPaused && !(e.target as HTMLElement).closest('button')) {
      handlePause();
    } else if (isPaused && !(e.target as HTMLElement).closest('button')) {
      handleResume();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
    <StarField animated={phase !== 'running'} />
    <AnimatePresence>
      <motion.div
        key="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-start md:justify-center min-h-screen p-4 bg-transparent"
        onClick={handleScreenTap}
      >
        {phase === 'configure' && (
          <TimerConfig
            selectedModeId={selectedModeId}
            modeConfig={modeConfig}
            onModeChange={handleModeChange}
            onNext={handleConfigNext}
          />
        )}
        {phase === 'players' && (
          <PlayerInputForm
            players={players}
            setPlayers={setPlayers}
            onStart={handleStart}
            onBack={handleBackToConfigure}
          />
        )}
        {phase === 'running' && activeMode && (
          <div className="w-full max-w-md">
            <Controls
              onEndTurn={handleEndTurn}
              onBack={handleBackToPlayers}
            />
            <PlayerCards
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              mode={activeMode}
              modeConfig={modeConfig}
            />
          </div>
        )}
        <Dialog open={isPaused && phase === 'running'} onOpenChange={(open) => { if (!open) handleResume(); }}>
          <DialogPortal>
            <DialogOverlay className="bg-black/40" />
            <div
              className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
              onClick={handleResume}
            >
              <Play className="h-20 w-20 text-white/80 drop-shadow-lg" fill="currentColor" strokeWidth={0} />
            </div>
          </DialogPortal>
        </Dialog>
      </motion.div>
    </AnimatePresence>
    </>
  );
};

export default Home;
