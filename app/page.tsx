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
  clearPlayers,
  loadTimerState,
  saveTimerState,
  clearTimerState,
  loadModeConfig,
  saveModeConfig,
} from '@/lib/localStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import StarField from '@/components/StarField';
import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { ArrowLeft, Play, SkipForward } from 'lucide-react';
import { FormattedTime } from '@/components/formatted-time';
import { ActionTimerConfig } from '@/lib/timerModes/modes/actionTimer';
import { Button } from '@/components/ui/button';
import { playSound, stopSound, preloadSounds } from '@/lib/sounds';

type Phase = 'configure' | 'players' | 'running';
const PHASE_ORDER: Record<Phase, number> = {
  configure: 0,
  players: 1,
  running: 2,
};
const TWILIGHT_IMPERIUM_LOGO_URL = 'https://cdn.svc.asmodee.net/production-aconytebooks/uploads/image-converter/2020/04/TWI-Twilight-Imperium-logo.webp';

// Delay offsets (ms) for fine-tuning sound sync with the tick
const THREE_SECOND_COUNTDOWN_DELAY = 690;
const ACTION_TIMER_USED_DELAY = 0;

const Home: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(() => loadPlayers());
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [phase, setPhase] = useState<Phase>('configure');
  const [transitionDirection, setTransitionDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [logoLoadFailed, setLogoLoadFailed] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

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

  const [startOfRoundRemaining, setStartOfRoundRemaining] = useState<number | null>(null);

  const activeMode = getTimerMode(selectedModeId);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer state if exists
  useEffect(() => {
    const storedState = loadTimerState();

    if (storedState) {
      const mode = getTimerMode(storedState.modeId);
      if (mode) {
        setPlayers(storedState.players);
        setCurrentPlayerIndex(storedState.currentPlayerIndex);
        setSelectedModeId(storedState.modeId);
        setModeConfig(storedState.modeConfig);
        setPhase('running');
        setIsPaused(storedState.isPaused);
        setGameHasStarted(storedState.gameHasStarted);
      }
    }

    setIsLoading(false);
    preloadSounds();
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
          isPaused,
          modeId: selectedModeId,
          modeConfig,
          gameHasStarted: true,
        });
      }, 60000);
      return () => clearInterval(saveInterval);
    }
  }, [phase, isLoading]);

  // Timer effect — delegates to active mode's onTick, also handles start-of-round countdown
  useEffect(() => {
    if (!isLoading && phase === 'running' && !isPaused && activeMode) {
      timerRef.current = setInterval(() => {
        if (startOfRoundRemaining !== null && startOfRoundRemaining > 0) {
          // Compute post-tick value eagerly
          const newRemaining = startOfRoundRemaining <= 1 ? null : startOfRoundRemaining - 1;

          // Sound triggers based on post-tick value — before React is involved
          if (newRemaining === 4) {
            setTimeout(() => playSound('THREE_SECOND_COUNTDOWN'), THREE_SECOND_COUNTDOWN_DELAY);
          } else if (newRemaining === null) {
            setTimeout(() => playSound('ACTION_TIMER_USED'), ACTION_TIMER_USED_DELAY);
          }

          setStartOfRoundRemaining(newRemaining);
        } else {
          const { players, currentPlayerIndex, selectedModeId } = latestStateRef.current;
          const currentPlayer = players[currentPlayerIndex];

          // Compute tick result eagerly — onTick is pure
          const tickedPlayer = activeMode.onTick(currentPlayer, modeConfig);

          // Sound triggers based on the computed post-tick values — before React is involved
          if (selectedModeId === 'actionTimer') {
            const newActionTime = tickedPlayer.actionTimeRemaining ?? 0;
            if (newActionTime === 4) {
              setTimeout(() => playSound('THREE_SECOND_COUNTDOWN'), THREE_SECOND_COUNTDOWN_DELAY);
            }
            if (newActionTime === 0 && (currentPlayer?.actionTimeRemaining ?? 0) > 0) {
              setTimeout(() => playSound('ACTION_TIMER_USED'), ACTION_TIMER_USED_DELAY);
            }
          }

          // Set state with pre-computed result (no double onTick call)
          setPlayers((prevPlayers) =>
            prevPlayers.map((player, index) =>
              index === currentPlayerIndex ? tickedPlayer : player
            )
          );
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isPaused, currentPlayerIndex, isLoading, activeMode, modeConfig, startOfRoundRemaining]);

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
  };

  const setPhaseWithDirection = (nextPhase: Phase) => {
    const nextOrder = PHASE_ORDER[nextPhase];
    const currentOrder = PHASE_ORDER[phase];

    if (nextOrder !== currentOrder) {
      setTransitionDirection(nextOrder > currentOrder ? 1 : -1);
    }

    setPhase(nextPhase);
  };

  const handleConfigNext = () => {
    // If timer mode/settings changed (or no persisted baseline exists), reset players to edit mode.
    const storedConfig = loadModeConfig();
    const configHasChanged = JSON.stringify(storedConfig?.config ?? null) !== JSON.stringify(modeConfig);
    const shouldResetForConfigChange = !storedConfig || configHasChanged;

    saveModeConfig(selectedModeId, modeConfig);

    if (shouldResetForConfigChange) {
      setGameHasStarted(false);
      clearPlayers();
      clearTimerState();
    }

    setPhaseWithDirection('players');
  };

  const handleSkipCountdown = () => {
    setStartOfRoundRemaining(null);
  };

  const [gameHasStarted, setGameHasStarted] = useState<boolean>(false);

  const handleStart = () => {
    if (!activeMode) return;

    // If already started (coming back from running), just resume
    if (gameHasStarted) {
      setCurrentPlayerIndex(0);
      setPhaseWithDirection('running');
      if (selectedModeId === 'actionTimer') {
        const countdown = (modeConfig as ActionTimerConfig).startOfRoundTime;
        setStartOfRoundRemaining(countdown);
        setPlayers(prevPlayers =>
          prevPlayers.map(player => ({
            ...player,
            actionTimeRemaining: (modeConfig as ActionTimerConfig).actionTimePerTurn,
          }))
        );
        setIsPaused(false);
      } else {
        setIsPaused(true);
      }
      saveTimerState({
        players,
        currentPlayerIndex: 0,
        isPaused: true,
        modeId: selectedModeId,
        modeConfig,
        gameHasStarted: true,
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
    setGameHasStarted(true);
    setPhaseWithDirection('running');
    setCurrentPlayerIndex(0);
    if (selectedModeId === 'actionTimer') {
      const countdown = (modeConfig as ActionTimerConfig).startOfRoundTime;
      setStartOfRoundRemaining(countdown);
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  };

  const handleEndTurn = () => {
    if (phase !== 'running' || isPaused || !activeMode) return;
    if (timerRef.current) clearInterval(timerRef.current);
    stopSound('THREE_SECOND_COUNTDOWN');

    if (selectedModeId === 'actionTimer' && (players[currentPlayerIndex].actionTimeRemaining ?? 0) > 0) {
      playSound('END_TURN_TIME_ADDED');
    } else {
      playSound('END_TURN');
    }

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
      isPaused: false,
      modeId: selectedModeId,
      modeConfig,
      gameHasStarted: true,
    });
  };
  handleEndTurnRef.current = handleEndTurn;

  const handlePrevTurn = () => {
    if (phase !== 'running' || isPaused || !activeMode || players.length === 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    stopSound('THREE_SECOND_COUNTDOWN');
    playSound('PREV_TURN');

    const previousIndex = currentPlayerIndex - 1 >= 0 ? currentPlayerIndex - 1 : players.length - 1;
    const updatedPlayers =
      activeMode.id === 'actionTimer'
        ? players.map((player, index) =>
            index === previousIndex
              ? {
                  ...player,
                  actionTimeRemaining: 0,
                }
              : player
          )
        : players;

    setPlayers(updatedPlayers);
    setCurrentPlayerIndex(previousIndex);
    saveTimerState({
      players: updatedPlayers,
      currentPlayerIndex: previousIndex,
      isPaused: false,
      modeId: selectedModeId,
      modeConfig,
      gameHasStarted: true,
    });
  };

  const handlePause = () => {
    stopSound('THREE_SECOND_COUNTDOWN');
    playSound('PAUSE');
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
    saveTimerState({
      players,
      currentPlayerIndex,
      isPaused: true,
      modeId: selectedModeId,
      modeConfig,
      gameHasStarted: true,
    });
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleBackToPlayers = () => {
    stopSound('THREE_SECOND_COUNTDOWN');
    setPhaseWithDirection('players');
    setIsPaused(false);
  };

  const handleBackToConfigure = () => {
    setPhaseWithDirection('configure');
  };

  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'running') return;
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
          className="relative flex min-h-screen min-h-dvh flex-col items-center justify-start md:justify-center overflow-y-auto overflow-x-hidden p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-transparent"
          onClick={handleScreenTap}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={transitionDirection}>
            <motion.div
              key={phase}
              custom={transitionDirection}
              initial="enter"
              animate="center"
              exit="exit"
              variants={{
                enter: (direction: 1 | -1) => ({
                  x: shouldReduceMotion ? 0 : direction > 0 ? '18%' : '-18%',
                  opacity: shouldReduceMotion ? 0.7 : 0,
                }),
                center: {
                  x: 0,
                  opacity: 1,
                },
                exit: (direction: 1 | -1) => ({
                  x: shouldReduceMotion ? 0 : direction > 0 ? '-18%' : '18%',
                  opacity: shouldReduceMotion ? 0.7 : 0,
                }),
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.1, ease: 'linear' }
                  : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
              }
              className="relative w-full flex flex-col min-h-[calc(100dvh-2rem)] flex flex-col items-center md:justify-center"
            >
              {phase === 'configure' && (
                <>
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
                  <TimerConfig
                    selectedModeId={selectedModeId}
                    modeConfig={modeConfig}
                    onModeChange={handleModeChange}
                    onNext={handleConfigNext}
                  />
                </>
              )}
              {phase === 'players' && (
                <PlayerInputForm
                  players={players}
                  setPlayers={setPlayers}
                  onStart={handleStart}
                  gameHasStarted={gameHasStarted}
                  selectedModeId={selectedModeId}
                  modeConfig={modeConfig}
                />
              )}
              {phase === 'running' && activeMode && (
                <div className="w-full max-w-md flex flex-col mt-16 md:mt-0">
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
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {phase === 'players' && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToConfigure}
              className="absolute top-6 left-6 z-20"
            >
              <ArrowLeft />
              Back
            </Button>
          )}
          {phase === 'running' && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToPlayers}
              className="absolute top-6 left-6 z-20"
            >
              <ArrowLeft />
              Back <span className="ml-3">(end round)</span>
            </Button>
          )}
          <Dialog
            open={isPaused && phase === 'running'}
            onOpenChange={(open) => {
              if (!open) handleResume();
            }}
          >
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
          <Dialog
            open={startOfRoundRemaining !== null && startOfRoundRemaining > 0}
            onOpenChange={() => {}}
          >
            <DialogPortal>
              <DialogOverlay className="bg-black/40" />
              <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
                <span className="text-8xl md:text-9xl font-bold text-white tabular-nums drop-shadow-lg tabular-nums">
                  {startOfRoundRemaining !== null ? (
                    <FormattedTime seconds={startOfRoundRemaining} format="short" />
                  ) : (
                    ''
                  )}
                </span>
                <Button variant="ghost" onClick={handleSkipCountdown} className="mt-8 text-white/80">
                  Skip
                  <SkipForward className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </DialogPortal>
          </Dialog>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default Home;
