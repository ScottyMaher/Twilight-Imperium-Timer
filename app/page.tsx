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

const Home: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(() => loadPlayers());
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer state if exists
  useEffect(() => {
    const storedState = loadTimerState();
    if (storedState && storedState.isRunning) {
      setPlayers(storedState.players);
      setCurrentPlayerIndex(storedState.currentPlayerIndex);
      setIsRunning(storedState.isRunning);
      setIsPaused(storedState.isPaused);
    }
  }, []);

  // Save players to localStorage whenever they change
  useEffect(() => {
    savePlayers(players);
  }, [players]);

  // Save timer state to localStorage whenever relevant state changes
  useEffect(() => {
    if (isRunning) {
      saveTimerState({
        players,
        currentPlayerIndex,
        isRunning,
        isPaused,
      });
    }
  }, [players, currentPlayerIndex, isRunning, isPaused]);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused) {
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
  }, [isRunning, isPaused, currentPlayerIndex]);

  // Handle spacebar press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleEndTurn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPlayerIndex, isRunning, isPaused, players]);

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
    timerRef.current = setInterval(() => {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player, index) =>
          index === currentPlayerIndex
            ? { ...player, time: player.time + 1 }
            : player
        )
      );
    }, 1000);
    setCurrentPlayerIndex((prevIndex) =>
      prevIndex + 1 < players.length ? prevIndex + 1 : 0
    );
    // Ensure the timer continues for the new current player
  };

  const handlePause = () => {
    setIsPaused(true);
    clearInterval(timerRef.current as NodeJS.Timeout);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleBack = () => {
    setIsRunning(false);
    setIsPaused(false);
    clearTimerState();
  };

  return (
    <div className="flex flex-col items-center justify-start md:justify-center min-h-screen p-4 bg-neutral-900">
      {!isRunning ? (
        <PlayerInputForm
          players={players}
          setPlayers={setPlayers}
          onStart={handleStart}
        />
      ) : (
        <div className="w-full max-w-md">
          {/* <Button onClick={handleBack} className="absolute top-6 left-6">
            Back
          </Button> */}
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
    </div>
  );
};

export default Home;



// const TOTAL_PLAYERS = 6;

// export default function Home() {
//   const [players, setPlayers] = useState<Array<{ name: string; time: number }>>(
//     Array(TOTAL_PLAYERS).fill({ name: '', time: 0 })
//   );
//   const [currentPlayer, setCurrentPlayer] = useState(0);
//   const [isRunning, setIsRunning] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   // Load player names from localStorage on mount
//   useEffect(() => {
//     const storedPlayers = JSON.parse(localStorage.getItem('players') || '[]');
//     console.log(storedPlayers);
//     if (storedPlayers && storedPlayers.length === TOTAL_PLAYERS) {
//       console.log('setting players');
//       setPlayers(storedPlayers);
//     }
//   }, []);

//   // Save player names to localStorage whenever they change
//   // useEffect(() => {
//   //   localStorage.setItem('players', JSON.stringify(players));
//   // }, [players]);

//   // Timer effect
//   useEffect(() => {
//     if (isRunning && !isPaused) {
//       timerRef.current = setInterval(() => {
//         setPlayers((prevPlayers) =>
//           prevPlayers.map((player, index) =>
//             index === currentPlayer
//               ? { ...player, time: player.time + 1 }
//               : player
//           )
//         );
//       }, 1000);
//     }

//     return () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
//     };
//   }, [isRunning, isPaused, currentPlayer]);

//   const handleEndTurn = () => {
//     localStorage.setItem('players', JSON.stringify(players));
//     if (!isRunning || isPaused) return;
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//     }
//     setCurrentPlayer((prev) => (prev + 1) % TOTAL_PLAYERS);
//   };

//   // Handle spacebar press
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.code === 'Space') {
//         e.preventDefault();
//         handleEndTurn();
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [currentPlayer, isRunning, isPaused]);

//   const handleStart = () => {
//     if (players.some((player) => player.name.trim() === '')) {
//       alert('Please enter all player names.');
//       return;
//     }
//     localStorage.setItem('players', JSON.stringify(players));
//     setIsRunning(true);
//     setIsPaused(false);
//   };

//   const handlePause = () => {
//     localStorage.setItem('players', JSON.stringify(players));
//     setIsPaused(true);
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//     }
//   };

//   const handleResume = () => {
//     setIsPaused(false);
//   };

//   const handleNameChange = (index: number, name: string) => {
//     const updatedPlayers = [...players];
//     updatedPlayers[index].name = name;
//     setPlayers(updatedPlayers);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-800">
//       {!isRunning ? (
//         <PlayerInputForm
//           players={players}
//           onNameChange={handleNameChange}
//           onStart={handleStart}
//         />
//       ) : (
//         <div className="w-full max-w-2xl">
//           <TimerDisplay
//             player={players[currentPlayer]}
//           />
//           <Controls
//             onEndTurn={handleEndTurn}
//             onPause={handlePause}
//             onResume={handleResume}
//             isPaused={isPaused}
//           />
//           <div className="mt-4">
//             <h2 className="text-xl font-semibold">All Players:</h2>
//             <ul className="list-decimal list-inside">
//               {players.map((player, index) => (
//                 <li key={index} className="flex justify-between">
//                   <span>{player.name}</span>
//                   <span>{formatTime(player.time)}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }