// components/PlayerInputForm.tsx
import React from 'react';
import { Player } from '@/types/index';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { Reorder, useDragControls } from 'framer-motion';
import { ArrowLeft, GripVertical } from 'lucide-react';

interface PlayerInputFormProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onStart: () => void;
  onBack?: () => void;
}

interface PlayerRowProps {
  player: Player;
  playersCount: number;
  onNameChange: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onDragStateChange: (isDragging: boolean) => void;
  dragConstraintsRef: React.RefObject<HTMLDivElement>;
}

const PlayerRow: React.FC<PlayerRowProps> = ({
  player,
  playersCount,
  onNameChange,
  onRemove,
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
      <Input
        className="outline outline-1 outline-neutral-100/50"
        value={player.name}
        onChange={(e) => onNameChange(player.id, e.target.value)}
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
    </Reorder.Item>
  );
};

const PlayerInputForm: React.FC<PlayerInputFormProps> = ({
  players,
  setPlayers,
  onStart,
  onBack,
}) => {
  const [isReordering, setIsReordering] = React.useState<boolean>(false);
  const previousCursorRef = React.useRef<string>('');
  const reorderContainerRef = React.useRef<HTMLDivElement>(null);

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
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
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
        className="w-full max-w-md space-y-4 bg-neutral-500/10 p-6 rounded shadow"
        onSubmit={(e) => {
          e.preventDefault();
          const filledPlayers = players.filter(
            (player) => player.name.trim() !== ''
          );
          if (filledPlayers.length === 0) {
            alert('Please enter at least one player name.');
            return;
          }
          onStart();
        }}
      >
        <h1 className="text-2xl font-bold text-center">Enter Player Names</h1>
        <div ref={reorderContainerRef}>
          <Reorder.Group axis="y" values={players} onReorder={setPlayers} className="space-y-4">
            {players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                playersCount={players.length}
                onNameChange={handleNameChange}
                onRemove={handleRemovePlayer}
                onDragStateChange={setIsReordering}
                dragConstraintsRef={reorderContainerRef}
              />
            ))}
          </Reorder.Group>
        </div>
        {players.length < 6 && (
          <Button type="button" onClick={handleAddPlayer}>
            Add Player
          </Button>
        )}
        <Button type="submit" className="w-full">
          Start
        </Button>
      </form>
    </>
  );
};

export default PlayerInputForm;
