import { Player } from '@/types/index';

const PLAYERS_KEY = 'players';
const TIMER_STATE_KEY = 'timerState';
const MODE_CONFIG_KEY = 'modeConfig';

export const loadPlayers = (): Player[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PLAYERS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse players from localStorage', error);
    }
  }
  // Initialize with 6 empty players
  return Array(6)
    .fill(null)
    .map((_, index) => ({
      id: `player-${index + 1}`,
      name: '',
      time: 0,
    }));
};

export const savePlayers = (players: Player[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
};

interface TimerState {
  players: Player[];
  currentPlayerIndex: number;
  isPaused: boolean;
  modeId: string;
  modeConfig: unknown;
  gameHasStarted: boolean;
}

export const loadTimerState = (): TimerState | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(TIMER_STATE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Validate expected schema
      if (
        parsed &&
        Array.isArray(parsed.players) &&
        typeof parsed.currentPlayerIndex === 'number' &&
        typeof parsed.isPaused === 'boolean' &&
        typeof parsed.modeId === 'string'
      ) {
        return {
          ...parsed,
          gameHasStarted: parsed.gameHasStarted ?? true,
        } as TimerState;
      }
      // Schema mismatch — discard
      localStorage.removeItem(TIMER_STATE_KEY);
    } catch (error) {
      console.error('Failed to parse timer state from localStorage', error);
    }
  }
  return null;
};

export const saveTimerState = (state: TimerState) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
};

export const clearTimerState = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TIMER_STATE_KEY);
};

interface ModeConfig {
  modeId: string;
  config: unknown;
}

export const loadModeConfig = (): ModeConfig | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(MODE_CONFIG_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed.modeId === 'string') {
        return parsed as ModeConfig;
      }
    } catch (error) {
      console.error('Failed to parse mode config from localStorage', error);
    }
  }
  return null;
};

export const saveModeConfig = (modeId: string, config: unknown) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MODE_CONFIG_KEY, JSON.stringify({ modeId, config }));
};
