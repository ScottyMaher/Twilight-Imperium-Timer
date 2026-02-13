export default interface Player {
  id: string; // Unique identifier for each player
  name: string;
  time: number; // Time in seconds
  startingReserveTime?: number; // Per-player override for starting reserve time
  actionTimeRemaining?: number; // Specific to Action Timer mode
  reserveTime?: number; // Specific to Action Timer mode
}
