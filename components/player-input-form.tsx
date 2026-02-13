// components/PlayerInputForm.tsx
import React from 'react';
import { Player, PlayerColor } from '@/types/index';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { Reorder, useDragControls } from 'framer-motion';
import { ArrowLeft, GripVertical } from 'lucide-react';
import { FormattedTime } from '@/components/formatted-time';
import { ActionTimerConfig } from '@/lib/timerModes/modes/actionTimer';
import { PLAYER_COLORS, getPlayerColorHex } from '@/lib/playerColors';
import { FormattedPlayerName } from '@/components/formatted-player-name';

interface PlayerInputFormProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onStart: () => void;
  onBack?: () => void;
  gameHasStarted: boolean;
  selectedModeId: string;
  modeConfig: unknown;
}

interface EditPlayerRowProps {
  player: Player;
  playersCount: number;
  onNameChange: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onDragStateChange: (isDragging: boolean) => void;
  dragConstraintsRef: React.RefObject<HTMLDivElement>;
  selectedModeId: string;
  defaultReserveTime: number;
  onReserveTimeChange: (id: string, value: number | undefined) => void;
  onColorChange: (id: string, color: PlayerColor) => void;
  selectedColors: Set<PlayerColor>;
}

const EditPlayerRow: React.FC<EditPlayerRowProps> = ({
  player,
  playersCount,
  onNameChange,
  onRemove,
  onDragStateChange,
  dragConstraintsRef,
  selectedModeId,
  defaultReserveTime,
  onReserveTimeChange,
  onColorChange,
  selectedColors,
}) => {
  const dragControls = useDragControls();
  const reserveValue = player.startingReserveTime ?? defaultReserveTime;

  return (
    <Reorder.Item
      key={player.id}
      value={player}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={dragConstraintsRef}
      onDragStart={() => onDragStateChange(true)}
      onDragEnd={() => onDragStateChange(false)}
      className="space-y-2"
    >
      <div className="flex items-center space-x-2">
        <button
          type="button"
          aria-label={`Drag ${player.name || 'player'} row`}
          onPointerDown={(e) => {
            e.preventDefault();
            dragControls.start(e);
          }}
          onPointerUp={() => onDragStateChange(false)}
          className="rounded touch-none select-none text-neutral-100/70 cursor-grab active:cursor-grabbing hover:text-white"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <Input
          className="outline outline-1 outline-neutral-100/50"
          value={player.name}
          onChange={(e) => onNameChange(player.id, e.target.value)}
          onFocus={(e) => {
            const target = e.target;
            setTimeout(() => {
              target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }}
          required
        />
        {playersCount > 1 && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onRemove(player.id)}
          >
            Remove
          </Button>
        )}
      </div>
      <div className="space-y-2 pl-7">
        <div className="space-y-1">
          <Label className="text-sm text-neutral-300">Player Color</Label>
          <div className="flex flex-wrap gap-2">
            {PLAYER_COLORS.map((entry) => {
              const isSelected = player.color === entry.key;
              const isTakenByOther = selectedColors.has(entry.key) && !isSelected;
              return (
                <button
                  key={entry.key}
                  type="button"
                  aria-label={`${player.name || 'Player'} color ${entry.label}`}
                  aria-pressed={isSelected}
                  disabled={isTakenByOther}
                  onClick={() => onColorChange(player.id, entry.key)}
                  className={`h-7 w-7 rounded-full border-2 transition ${
                    isSelected
                      ? 'border-white ring-2 ring-white/50'
                      : 'border-white/20 hover:border-white/60'
                  } ${isTakenByOther ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
                  style={{ backgroundColor: getPlayerColorHex(entry.key) }}
                />
              );
            })}
          </div>
        </div>
        {selectedModeId === 'actionTimer' && (
          <div className="space-y-1">
            <Label className="text-sm text-neutral-300">
              Starting Reserve: <FormattedTime seconds={reserveValue} />
            </Label>
            <Slider
              min={60}
              max={2700}
              step={60}
              value={[reserveValue]}
              onValueChange={([v]) =>
                onReserveTimeChange(player.id, v === defaultReserveTime ? undefined : v)
              }
            />
          </div>
        )}
      </div>
    </Reorder.Item>
  );
};

interface OrderPlayerRowProps {
  player: Player;
  onDragStateChange: (isDragging: boolean) => void;
  dragConstraintsRef: React.RefObject<HTMLDivElement>;
}

const OrderPlayerRow: React.FC<OrderPlayerRowProps> = ({
  player,
  onDragStateChange,
  dragConstraintsRef,
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={player.id}
      value={player}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={dragConstraintsRef}
      onDragStart={() => onDragStateChange(true)}
      onDragEnd={() => onDragStateChange(false)}
      className="flex items-center space-x-2"
    >
      <button
        type="button"
        aria-label={`Drag ${player.name || 'player'} row`}
        onPointerDown={(e) => {
          e.preventDefault();
          dragControls.start(e);
        }}
        onPointerUp={() => onDragStateChange(false)}
        className="rounded touch-none select-none text-neutral-100/70 cursor-grab active:cursor-grabbing hover:text-white"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="flex-1 text-lg px-3">
        <FormattedPlayerName name={player.name} color={player.color} />
      </span>
      {player.reserveTime != null && (
        <span className="text-neutral-100/70 text-sm tabular-nums">
          <FormattedTime seconds={player.reserveTime} />
        </span>
      )}
    </Reorder.Item>
  );
};

const PlayerInputForm: React.FC<PlayerInputFormProps> = ({
  players,
  setPlayers,
  onStart,
  onBack,
  gameHasStarted,
  selectedModeId,
  modeConfig,
}) => {
  const defaultReserveTime = selectedModeId === 'actionTimer'
    ? (modeConfig as ActionTimerConfig).startingReserveTime
    : 0;
  const [isReordering, setIsReordering] = React.useState<boolean>(false);
  const previousCursorRef = React.useRef<string>('');
  const reorderContainerRef = React.useRef<HTMLDivElement>(null);
  const selectedColors = React.useMemo(
    () => new Set(players.map((player) => player.color).filter(Boolean) as PlayerColor[]),
    [players]
  );

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isReordering) {
      previousCursorRef.current = document.body.style.cursor;
      document.body.style.cursor = 'grabbing';
      return;
    }

    document.body.style.cursor = previousCursorRef.current;

    return () => {
      document.body.style.cursor = previousCursorRef.current;
    };
  }, [isReordering]);

  const handleNameChange = (id: string, name: string) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id ? { ...player, name } : player
      )
    );
  };

  const handleAddPlayer = () => {
    if (players.length >= 6) return;
    const newPlayer: Player = {
      id: uuidv4(),
      name: '',
      time: 0,
      color: undefined,
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  };

  const handleReserveTimeChange = (id: string, value: number | undefined) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id ? { ...player, startingReserveTime: value } : player
      )
    );
  };

  const handleColorChange = (id: string, color: PlayerColor) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id ? { ...player, color } : player
      )
    );
  };

  return (
    <>
      {onBack && (
        <Button type="button" variant="ghost" onClick={onBack} className="absolute top-6 left-6">
          <ArrowLeft />
          Back
        </Button>
      )}

      <form
        className="w-full max-w-md flex flex-col gap-8 bg-neutral-500/10 mt-12 md:mt-0 pl-2 pr-4 py-4 rounded shadow"
        onSubmit={(e) => {
          e.preventDefault();
          const filledPlayers = players.filter(
            (player) => player.name.trim() !== ''
          );
          if (filledPlayers.length === 0) {
            alert('Please enter at least one player name.');
            return;
          }

          if (filledPlayers.some((player) => !player.color)) {
            alert('Please select a color for each player.');
            return;
          }

          const filledPlayerColors = filledPlayers.map((player) => player.color as PlayerColor);
          if (new Set(filledPlayerColors).size !== filledPlayerColors.length) {
            alert('Each player must have a unique color.');
            return;
          }

          onStart();
        }}
      >
        <h1 className="text-2xl font-bold text-center">
          {gameHasStarted ? 'Initiative Order' : 'Enter Player Names'}
        </h1>
        <div ref={reorderContainerRef}>
          <Reorder.Group
            axis="y"
            values={players}
            onReorder={setPlayers}
            className="flex flex-col gap-8"
          >
            {gameHasStarted ? (
              players.map((player) => (
                <OrderPlayerRow
                  key={player.id}
                  player={player}
                  onDragStateChange={setIsReordering}
                  dragConstraintsRef={reorderContainerRef}
                />
              ))
            ) : (
              players.map((player) => (
                <EditPlayerRow
                  key={player.id}
                  player={player}
                  playersCount={players.length}
                  onNameChange={handleNameChange}
                  onRemove={handleRemovePlayer}
                  onDragStateChange={setIsReordering}
                  dragConstraintsRef={reorderContainerRef}
                  selectedModeId={selectedModeId}
                  defaultReserveTime={defaultReserveTime}
                  onReserveTimeChange={handleReserveTimeChange}
                  onColorChange={handleColorChange}
                  selectedColors={selectedColors}
                />
              ))
            )}
          </Reorder.Group>
        </div>
        {!gameHasStarted && players.length < 6 && (
          <Button type="button" className="w-fit" onClick={handleAddPlayer}>
            Add Player
          </Button>
        )}
        <Button type="submit" className="w-full">
          Start Round
        </Button>
      </form>
    </>
  );
};

export default PlayerInputForm;
