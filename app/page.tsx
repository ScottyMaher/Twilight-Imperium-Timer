"use client";

import { useState, useEffect, useRef } from 'react';
import Controls from '@/components/controls'
import PlayerInputForm from '@/components/player-input-form'
import PlayerCards from '@/components/PlayerCards'
import { Player } from '@/types/index';
import {
  loadPlayers,
  savePlayers,
  loadTimerState,
  saveTimerState,
  clearTimerState
} from '@/lib/localStorage';
import { motion, AnimatePresence } from 'framer-motion';

const Home: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(() => loadPlayers());
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer state if exists
  useEffect(() => {
    const loadData = () => {
      const storedPlayers = loadPlayers();
      const storedState = loadTimerState();

      if (storedState && storedState.isRunning) {
        setPlayers(storedState.players);
        setCurrentPlayerIndex(storedState.currentPlayerIndex);
        setIsRunning(storedState.isRunning);
        setIsPaused(storedState.isPaused);
      } else {
        setPlayers(storedPlayers);
      }

      setIsLoading(false); // Data is loaded
    };

    loadData();
  }, []);

  // Save players to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      savePlayers(players);
    }
  }, [players, isLoading]);

  // Save timer state to localStorage whenever relevant state changes
  useEffect(() => {
    if (!isLoading && isRunning) {
      saveTimerState({
        players,
        currentPlayerIndex,
        isRunning,
        isPaused,
      });
    }
  }, [players, currentPlayerIndex, isRunning, isPaused, isLoading]);

  // Timer effect
  useEffect(() => {
    if (!isLoading && isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setPlayers((prevPlayers) =>
          prevPlayers.map((player, index) =>
            index === currentPlayerIndex
              ? { ...player, time: player.time + 1 }
              : player
          )
        );
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, currentPlayerIndex, isLoading]);

  // Handle spacebar press
  useEffect(() => {
    if (isLoading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleEndTurn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleStart = () => {
    const filledPlayers = players.filter(
      (player) => player.name.trim() !== ''
    );
    if (filledPlayers.length === 0) {
      alert('Please enter at least one player name.');
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
    setCurrentPlayerIndex(0);
  };

  const handleEndTurn = () => {
    if (!isRunning || isPaused) return;
    if (timerRef.current) clearInterval(timerRef.current);

    // Update the current player's time one last time
    setPlayers((prevPlayers) =>
      prevPlayers.map((player, index) =>
        index === currentPlayerIndex
          ? { ...player, time: player.time + 1 }
          : player
      )
    );

    // Update the current player index
    setCurrentPlayerIndex((prevIndex) =>
      prevIndex + 1 < players.length ? prevIndex + 1 : 0
    );
  };

  const handlePause = () => {
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleBack = () => {
    setIsRunning(false);
    setIsPaused(false);
    clearTimerState();
  };

  if (isLoading) {
    // Display a loading indicator while data is loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-start md:justify-center min-h-screen p-4 bg-transparent"
      >
        {!isRunning ? (
          <PlayerInputForm
            players={players}
            setPlayers={setPlayers}
            onStart={handleStart}
          />
        ) : (
          <div className="w-full max-w-md">
            <Controls
              onEndTurn={handleEndTurn}
              onPause={handlePause}
              onResume={handleResume}
              onBack={handleBack}
              isPaused={isPaused}
            />
            <PlayerCards
              players={players}
              currentPlayerIndex={currentPlayerIndex}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Home;