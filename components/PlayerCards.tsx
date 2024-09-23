// components/PlayerCards.tsx
import React from 'react';
import { Player } from '../types';
import { formatTime } from '@/lib/formatTime';
import { motion } from 'framer-motion';

interface PlayerCardsProps {
  players: Player[];
  currentPlayerIndex: number;
}

const PlayerCards: React.FC<PlayerCardsProps> = ({
  players,
  currentPlayerIndex,
}) => {
  // Compute the visual order of the players
  const visualOrder = players.map(
    (_, i) => players[(currentPlayerIndex + i) % players.length]
  );

  return (
    <div className="flex flex-col px-4">
      {visualOrder.map((player, index) => {
        // Determine scale and opacity based on position
        let sizeScale = 1.0;
        let opacity = 1.0;

        if (index === 0) {
          sizeScale = 1.1; // Largest
          opacity = 1.0;
        } else if (index === 1) {
          sizeScale = 1.05; // Second largest
          opacity = 0.9;
        } else {
          sizeScale = 1; // Rest
          opacity = 0.8;
        }

        return (
          <motion.div
            key={player.id}
            layout
            animate={{ scale: sizeScale, opacity }}
            transition={{ duration: 0.2 }}
            className="bg-neutral-800 p-2 md:p-4 rounded shadow"
            style={{
              zIndex: players.length - index,
            }}
          >
            {/* <h3 className="text-lg font-semibold">
              {index === 0 ? 'Current Player' : `Next Player ${index}`}
            </h3> */}
            <p className="text-xl md:text-4xl font-semibold">{player.name}</p>
            <p className="text-xl md:text-4xl">{formatTime(player.time)}</p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PlayerCards;