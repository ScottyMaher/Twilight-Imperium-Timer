import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { TimerMode } from '../types';
import { registerTimerMode } from '../registry';
import { FormattedTime } from '@/components/formatted-time';
import { FormattedPlayerName } from '@/components/formatted-player-name';
import { Player } from '@/types/index';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export interface ActionTimerConfig {
  actionTimePerTurn: number;
  startingReserveTime: number;
  startOfRoundTime: number;
}

interface ActionTimerPlayer extends Player {
  actionTimeRemaining: number;
  reserveTime: number;
}

const actionTimerMode: TimerMode<ActionTimerConfig> = {
  id: 'actionTimer',
  label: 'Action Timer',
  description: 'Each turn has a countdown. Leftover time is banked into a reserve. When the action timer runs out, the reserve is used.',
  defaultConfig: {
    actionTimePerTurn: 60,
    startingReserveTime: 900,
    startOfRoundTime: 300,
  },

  ConfigComponent: ({ config, onConfigChange }) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>
          Start of Round Time: <FormattedTime seconds={config.startOfRoundTime} format="short" />
        </Label>
        <Slider
          min={60}
          max={600}
          step={60}
          value={[config.startOfRoundTime]}
          onValueChange={([v]) => onConfigChange({ ...config, startOfRoundTime: v })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          Action Time Per Turn: <FormattedTime seconds={config.actionTimePerTurn} format="short" />
        </Label>
        <Slider
          min={15}
          max={180}
          step={15}
          value={[config.actionTimePerTurn]}
          onValueChange={([v]) => onConfigChange({ ...config, actionTimePerTurn: v })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          Starting Reserve Time: <FormattedTime seconds={config.startingReserveTime} />
        </Label>
        <Slider
          min={60}
          max={2700}
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
    reserveTime: base.startingReserveTime ?? config.startingReserveTime,
  }),

  onTick: (player: Player): Player => {
    const p = player as ActionTimerPlayer;
    if (p.actionTimeRemaining > 0) {
      return { ...p, actionTimeRemaining: p.actionTimeRemaining - 1, time: p.time + 1 };
    }
    // Action time depleted — use reserve
    if (p.reserveTime > 0) {
      return { ...p, reserveTime: p.reserveTime - 1, time: p.time + 1 };
    }
    // Both depleted — just track total time, don't go negative
    return { ...p, time: p.time + 1 };
  },

  onEndTurn: (player: Player, config: ActionTimerConfig): Player => {
    const p = player as ActionTimerPlayer;
    // Bank leftover action time into reserve, reset action timer
    const leftover = Math.max(0, p.actionTimeRemaining);
    return {
      ...p,
      reserveTime: p.reserveTime + leftover,
      actionTimeRemaining: config.actionTimePerTurn,
      time: p.time + 1,
    };
  },

  PlayerCardContent: ({ player, config }: { player: Player; config: ActionTimerConfig }) => {
    const p = player as ActionTimerPlayer;
    const actionTime = p.actionTimeRemaining ?? config.actionTimePerTurn;
    const reserve = p.reserveTime ?? config.startingReserveTime;

    const prevReserveRef = useRef(reserve);
    const animationKeyRef = useRef(0);

    if (reserve > prevReserveRef.current) {
      animationKeyRef.current += 1;
    }
    prevReserveRef.current = reserve;

    return (
      <>
        <p className="text-xl md:text-4xl font-semibold"><FormattedPlayerName name={p.name} color={p.color} /></p>
        <div className="flex justify-between text-xl md:text-4xl tabular-nums">
          <FormattedTime seconds={actionTime} format="short" />
          <motion.span
            key={animationKeyRef.current}
            initial={animationKeyRef.current > 0 ? { scale: 1.3, color: '#4ade80' } : false}
            animate={{ scale: 1, color: '#a3a3a3' }}
            transition={{ duration: 1, ease: 'backIn' }}
            className="text-lg md:text-2xl tabular-nums"
          >
            +<FormattedTime seconds={reserve} />
          </motion.span>
        </div>
      </>
    );
  },
};

registerTimerMode(actionTimerMode);
export default actionTimerMode;
