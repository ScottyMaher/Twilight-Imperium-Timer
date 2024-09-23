// components/TimerDisplay.tsx
import React from 'react';
import { Player } from '../types';
import { formatTime } from '@/lib/formatTime';

interface TimerDisplayProps {
  player: Player;
  playerIndex: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  player,
  playerIndex,
}) => {
  const { name, time } = player;

  return (
    <div className="bg-white p-6 rounded shadow mb-4">
      <h2 className="text-xl font-semibold">
        Player {playerIndex}: {name}
      </h2>
      <p className="text-3xl mt-2">{formatTime(time)}</p>
    </div>
  );
};

export default TimerDisplay;
