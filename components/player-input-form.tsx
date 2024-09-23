// components/PlayerInputForm.tsx
import React from 'react';
import { Player } from '@/types/index';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';

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
      className="w-full max-w-md space-y-4 bg-neutral-700 p-6 rounded shadow"
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
      {players.map((player) => (
        <div key={player.id} className="flex items-center space-x-2">
          <Input
            // label={`Player ${index + 1}`}
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
        </div>
      ))}
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
