import { FC } from 'react';
import { Player } from '@/types/index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TimerMode<TConfig = any> {
  id: string;
  label: string;
  description: string;
  defaultConfig: TConfig;
  ConfigComponent: FC<{ config: TConfig; onConfigChange: (config: TConfig) => void }>;
  initializePlayer: (base: Player, config: TConfig) => Player;
  onTick: (player: Player, config: TConfig) => Player;
  onEndTurn: (player: Player, config: TConfig) => Player;
  PlayerCardContent: FC<{ player: Player; config: TConfig }>;
}
