// components/PlayerInputForm.tsx
import React from 'react';
import { Player } from '@/types/index';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { Reorder } from 'framer-motion';

interface PlayerInputFormProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onStart: () => void;
}

const PlayerInputForm: React.FC<PlayerInputFormProps> = ({
  players,
  setPlayers,
  onStart,
}) => {
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
      <Reorder.Group axis="y" values={players} onReorder={setPlayers} className="space-y-4">
        {players.map((player) => (
          <Reorder.Item key={player.id} value={player} className="flex items-center space-x-2">
            <Input
              // label={`Player ${index + 1}`}
              className='outline outline-1 outline-neutral-100/50'
              value={player.name}
              onChange={(e) => handleNameChange(player.id, e.target.value)}
              required
            />
            {players.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemovePlayer(player.id)}
              >
                Remove
              </Button>
            )}
          </Reorder.Item>
        ))}
      </Reorder.Group>
      {players.length < 6 && (
        <Button type="button" onClick={handleAddPlayer}>
          Add Player
        </Button>
      )}
      <Button type="submit" className="w-full">
        Start
      </Button>
    </form>
  );
};

export default PlayerInputForm;
