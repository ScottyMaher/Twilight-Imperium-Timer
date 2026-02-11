// Import modes to trigger self-registration
import './modes/countUp';
import './modes/actionTimer';

// Re-export registry functions and types
export { registerTimerMode, getTimerMode, getAllTimerModes } from './registry';
export type { TimerMode } from './types';
