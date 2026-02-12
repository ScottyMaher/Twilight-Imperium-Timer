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
const TWILIGHT_IMPERIUM_LOGO_URL = 'https://cdn.svc.asmodee.net/production-aconytebooks/uploads/image-converter/2020/04/TWI-Twilight-Imperium-logo.webp';

const Home: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(() => loadPlayers());
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [phase, setPhase] = useState<Phase>('configure');
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [logoLoadFailed, setLogoLoadFailed] = useState<boolean>(false);

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
      setCurrentPlayerIndex(0);
      setPhase('running');
      setIsPaused(true);
      saveTimerState({
        players,
        currentPlayerIndex: 0,
        isRunning: true,
        isPaused: true,
        modeId: selectedModeId,
        modeConfig,
      });
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
    setIsPaused(true);
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

  const handlePrevTurn = () => {
    if (phase !== 'running' || isPaused || !activeMode || players.length === 0) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const previousIndex = currentPlayerIndex - 1 >= 0 ? currentPlayerIndex - 1 : players.length - 1;
    const updatedPlayers =
      activeMode.id === 'actionTimer'
        ? players.map((player, index) =>
            index === previousIndex
              ? {
                  ...player,
                  actionTimeRemaining: 0,
                  isInReserve: true,
                }
              : player
          )
        : players;

    setPlayers(updatedPlayers);
    setCurrentPlayerIndex(previousIndex);
    saveTimerState({
      players: updatedPlayers,
      currentPlayerIndex: previousIndex,
      isRunning: true,
      isPaused: false,
      modeId: selectedModeId,
      modeConfig,
    });
  };

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
        className="relative flex flex-col items-center justify-center md:justify-center min-h-screen min-h-dvh p-4 bg-transparent"
        onClick={handleScreenTap}
      >
        {phase === 'configure' && (
          <div className="pointer-events-none absolute top-0 flex flex-col items-center text-center">
            {TWILIGHT_IMPERIUM_LOGO_URL && !logoLoadFailed ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={TWILIGHT_IMPERIUM_LOGO_URL}
                  alt="Twilight Imperium"
                  className="h-auto w-[min(92vw,42rem)]"
                  onError={() => setLogoLoadFailed(true)}
                />
                <span className="relative -top-12 text-3xl font-bold uppercase tracking-[0.2em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] md:text-4xl">
                  Timer
                </span>
              </>
            ) : (
              <h1 className="mt-20 text-4xl font-bold tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] md:text-5xl">
                Twilight Imperium Timer
              </h1>
            )}
          </div>
        )}
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
          <div className="w-full max-w-md flex flex-col">
            <div className="order-1 md:order-2">
              <PlayerCards
                players={players}
                currentPlayerIndex={currentPlayerIndex}
                mode={activeMode}
                modeConfig={modeConfig}
              />
            </div>
            <div className="order-2 md:order-1">
              <Controls
                onPrevTurn={handlePrevTurn}
                onEndTurn={handleEndTurn}
                onBack={handleBackToPlayers}
              />
            </div>
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
