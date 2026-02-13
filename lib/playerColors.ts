import type { PlayerColor } from '@/types';

export const PLAYER_COLORS: ReadonlyArray<{
  key: PlayerColor;
  label: string;
  hex: string;
}> = [
  { key: 'red', label: 'Red', hex: '#ef4444' },
  { key: 'orange', label: 'Orange', hex: '#f97316' },
  { key: 'yellow', label: 'Yellow', hex: '#eab308' },
  { key: 'green', label: 'Green', hex: '#22c55e' },
  { key: 'cyan', label: 'Cyan', hex: '#06b6d4' },
  { key: 'blue', label: 'Blue', hex: '#3b82f6' },
  { key: 'violet', label: 'Violet', hex: '#a855f7' },
  { key: 'pink', label: 'Pink', hex: '#ec4899' },
];

const PLAYER_COLOR_FALLBACK = '#ffffff';

export const getPlayerColorHex = (color?: PlayerColor): string => {
  if (!color) return PLAYER_COLOR_FALLBACK;
  return PLAYER_COLORS.find((entry) => entry.key === color)?.hex ?? PLAYER_COLOR_FALLBACK;
};
