// components/PlayerCards.tsx
import React from 'react';
import { Player } from '../types';
import { TimerMode } from '@/lib/timerModes';
import { motion } from 'framer-motion';

interface PlayerCardsProps {
  players: Player[];
  currentPlayerIndex: number;
  mode: TimerMode;
  modeConfig: unknown;
}

const PlayerCards: React.FC<PlayerCardsProps> = ({
  players,
  currentPlayerIndex,
  mode,
  modeConfig,
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

        const isCurrent = index === 0;

        return (
          <motion.div
            key={player.id}
            layout="position"
            animate={{ scale: sizeScale, opacity }}
            transition={{ duration: 0.3 }}
            className="bg-neutral-500/10 p-2 md:p-4 rounded shadow outline outline-1 outline-neutral-500/30"
            style={{
              zIndex: players.length - index,
            }}
          >
            <mode.PlayerCardContent
              player={player}
              isCurrent={isCurrent}
              config={modeConfig}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default PlayerCards;
