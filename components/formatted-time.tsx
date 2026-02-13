import type { FC } from 'react';
import { formatTime, formatTimeShort } from '@/lib/formatTime';

export const FormattedTime: FC<{
  seconds: number;
  format?: 'short' | 'long';
}> = ({ seconds, format = 'long' }) => {
  const formatted = format === 'short' ? formatTimeShort(seconds) : formatTime(seconds);
  return (
    <span className={seconds <= 3 ? 'text-red-500' : ''}>
      {formatted}
    </span>
  );
};
