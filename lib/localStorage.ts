import { Player } from '@/types/index';

const PLAYERS_KEY = 'players';
const TIMER_STATE_KEY = 'timerState';

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

export const loadTimerState = () => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(TIMER_STATE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse timer state from localStorage', error);
    }
  }
  return null;
};

export const saveTimerState = (state: { players: Player[], currentPlayerIndex: number, isRunning: boolean, isPaused: boolean}) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
};

export const clearTimerState = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TIMER_STATE_KEY);
};
