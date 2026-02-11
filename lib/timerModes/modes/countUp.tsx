import React from 'react';
import { TimerMode } from '../types';
import { registerTimerMode } from '../registry';
import { formatTime } from '@/lib/formatTime';
import { Player } from '@/types/index';

type CountUpConfig = Record<string, never>;

const countUpMode: TimerMode<CountUpConfig> = {
  id: 'countUp',
  label: 'Count Up',
  description: 'Tracks total time spent per player. Each player\'s timer counts up during their turn.',
  defaultConfig: {},

  ConfigComponent: () => (
    <p className="text-sm text-muted-foreground">
      No additional settings. Each player&apos;s total time is tracked as their turns progress.
    </p>
  ),

  initializePlayer: (base: Player) => base,

  onTick: (player: Player) => ({ ...player, time: player.time + 1 }),

  onEndTurn: (player: Player) => ({ ...player, time: player.time + 1 }),

  PlayerCardContent: ({ player }: { player: Player }) => (
    <>
      <p className="text-xl md:text-4xl font-semibold">{player.name}</p>
      <p className="text-xl md:text-4xl tabular-nums">{formatTime(player.time)}</p>
    </>
  ),
};

registerTimerMode(countUpMode);
export default countUpMode;
