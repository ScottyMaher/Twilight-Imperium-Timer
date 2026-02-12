import { Howl } from "howler";

const BUCKET_URL = "https://pub-0bf4fe005031490398af28ea3ec2180b.r2.dev";

type SoundKey =
  | "ACTION_TIMER_USED"
  | "END_TURN_TIME_ADDED"
  | "END_TURN"
  | "PAUSE"
  | "PREV_TURN"
  | "THREE_SECOND_COUNTDOWN";

const SOUNDS: Record<SoundKey, Howl> = {
  ACTION_TIMER_USED: new Howl({
    src: [`${BUCKET_URL}/action-timer-used.ogg`, `${BUCKET_URL}/action-timer-used.mp3`],
    preload: false,
  }),
  END_TURN_TIME_ADDED: new Howl({
    src: [`${BUCKET_URL}/end-turn-time-added.ogg`, `${BUCKET_URL}/end-turn-time-added.mp3`],
    preload: false,
  }),
  END_TURN: new Howl({
    src: [`${BUCKET_URL}/end-turn.ogg`, `${BUCKET_URL}/end-turn.mp3`],
    preload: false,
  }),
  PAUSE: new Howl({
    src: [`${BUCKET_URL}/pause.ogg`, `${BUCKET_URL}/pause.mp3`],
    preload: false,
  }),
  PREV_TURN: new Howl({
    src: [`${BUCKET_URL}/prev-turn.ogg`, `${BUCKET_URL}/prev-turn.mp3`],
    preload: false,
  }),
  THREE_SECOND_COUNTDOWN: new Howl({
    src: [`${BUCKET_URL}/three-second-countdown.ogg`, `${BUCKET_URL}/three-second-countdown.mp3`],
    preload: false,
  }),
};

export function playSound(key: SoundKey): void {
  SOUNDS[key].play();
}

export function stopSound(key: SoundKey): void {
  SOUNDS[key].stop();
}

export function preloadSounds(): void {
  for (const howl of Object.values(SOUNDS)) {
    howl.load();
  }
}
