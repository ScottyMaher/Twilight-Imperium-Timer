export default interface Player {
  id: string; // Unique identifier for each player
  name: string;
  time: number; // Time in seconds
  actionTimeRemaining?: number; // Specific to Action Timer mode
  reserveTime?: number; // Specific to Action Timer mode
  isInReserve?: boolean; // Specific to Action Timer mode
}
