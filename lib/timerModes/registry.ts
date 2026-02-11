import { TimerMode } from './types';

const modes: Map<string, TimerMode> = new Map();

export function registerTimerMode(mode: TimerMode) {
  modes.set(mode.id, mode);
}

export function getTimerMode(id: string): TimerMode | undefined {
  return modes.get(id);
}

export function getAllTimerModes(): TimerMode[] {
  return Array.from(modes.values());
}
