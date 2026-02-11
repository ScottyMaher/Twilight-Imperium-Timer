import React from 'react';
import { TimerMode } from '../types';
import { registerTimerMode } from '../registry';
import { formatTime } from '@/lib/formatTime';
import { Player } from '@/types/index';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export interface ActionTimerConfig {
  actionTimePerTurn: number;
  startingReserveTime: number;
}

interface ActionTimerPlayer extends Player {
  actionTimeRemaining: number;
  reserveTime: number;
  isInReserve: boolean;
}

const actionTimerMode: TimerMode<ActionTimerConfig> = {
  id: 'actionTimer',
  label: 'Action Timer',
  description: 'Each turn has a countdown. Leftover time is banked into a reserve. When the action timer runs out, the reserve is used.',
  defaultConfig: {
    actionTimePerTurn: 60,
    startingReserveTime: 900,
  },

  ConfigComponent: ({ config, onConfigChange }) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Action Time Per Turn: {formatTime(config.actionTimePerTurn)}</Label>
        <Slider
          min={15}
          max={300}
          step={15}
          value={[config.actionTimePerTurn]}
          onValueChange={([v]) => onConfigChange({ ...config, actionTimePerTurn: v })}
        />
      </div>
      <div className="space-y-2">
        <Label>Starting Reserve Time: {formatTime(config.startingReserveTime)}</Label>
        <Slider
          min={60}
          max={3600}
          step={60}
          value={[config.startingReserveTime]}
          onValueChange={([v]) => onConfigChange({ ...config, startingReserveTime: v })}
        />
      </div>
    </div>
  ),

  initializePlayer: (base: Player, config: ActionTimerConfig): Player => ({
    ...base,
    actionTimeRemaining: config.actionTimePerTurn,
    reserveTime: config.startingReserveTime,
    isInReserve: false,
  }),

  onTick: (player: Player): Player => {
    const p = player as ActionTimerPlayer;
    if (p.actionTimeRemaining > 0) {
      return { ...p, actionTimeRemaining: p.actionTimeRemaining - 1, time: p.time + 1 };
    }
    // Action time depleted — use reserve
    if (p.reserveTime > 0) {
      return { ...p, isInReserve: true, reserveTime: p.reserveTime - 1, time: p.time + 1 };
    }
    // Both depleted — just track total time, don't go negative
    return { ...p, isInReserve: true, time: p.time + 1 };
  },

  onEndTurn: (player: Player, config: ActionTimerConfig): Player => {
    const p = player as ActionTimerPlayer;
    // Bank leftover action time into reserve, reset action timer
    const leftover = Math.max(0, p.actionTimeRemaining);
    return {
      ...p,
      reserveTime: p.reserveTime + leftover,
      actionTimeRemaining: config.actionTimePerTurn,
      isInReserve: false,
      time: p.time + 1,
    };
  },

  PlayerCardContent: ({ player, isCurrent, config }: { player: Player; isCurrent: boolean; config: ActionTimerConfig }) => {
    const p = player as ActionTimerPlayer;
    const actionTime = p.actionTimeRemaining ?? config.actionTimePerTurn;
    const reserve = p.reserveTime ?? config.startingReserveTime;
    const inReserve = p.isInReserve ?? false;

    return (
      <div className={isCurrent && inReserve ? 'text-red-400' : ''}>
        <p className="text-xl md:text-4xl font-semibold">{p.name}</p>
        <div className="flex justify-between text-xl md:text-4xl tabular-nums">
          <span>{formatTime(actionTime)}</span>
          <span className="text-muted-foreground text-lg md:text-2xl">
            +{formatTime(reserve)}
          </span>
        </div>
      </div>
    );
  },
};

registerTimerMode(actionTimerMode);
export default actionTimerMode;
