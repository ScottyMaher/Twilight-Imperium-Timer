import type { FC } from 'react';
import type { PlayerColor } from '@/types';
import { getPlayerColorHex } from '@/lib/playerColors';

export const FormattedPlayerName: FC<{
  name: string;
  color?: PlayerColor;
}> = ({ name, color }) => {
  return (
    <span style={{ color: getPlayerColorHex(color) }}>
      {name}
    </span>
  );
};
