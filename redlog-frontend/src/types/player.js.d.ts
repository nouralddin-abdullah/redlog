/**
 * Minimal ambient types for the `player.js` package — covers the surface
 * we actually call (Bunny Stream supports the same protocol).
 * https://github.com/embedly/player.js
 */
declare module 'player.js' {
  export interface TimeUpdateEvent {
    seconds: number;
    duration?: number;
  }

  export class Player {
    constructor(idOrIframe: string | HTMLIFrameElement);
    on(event: 'ready' | 'play' | 'pause' | 'ended' | 'error', cb: () => void): void;
    on(event: 'timeupdate' | 'seeked', cb: (data: TimeUpdateEvent) => void): void;
    off(event: string, cb?: (...args: unknown[]) => void): void;

    play(): void;
    pause(): void;
    setCurrentTime(seconds: number): void;
    getCurrentTime(cb?: (seconds: number) => void): Promise<number>;
    getDuration(cb?: (seconds: number) => void): Promise<number>;
  }

  export const Events: {
    READY: 'ready';
    PLAY: 'play';
    PAUSE: 'pause';
    ENDED: 'ended';
    TIMEUPDATE: 'timeupdate';
    SEEKED: 'seeked';
    ERROR: 'error';
  };

  export class Receiver {
    constructor();
  }

  const playerjs: {
    Player: typeof Player;
    Events: typeof Events;
    Receiver: typeof Receiver;
  };
  export default playerjs;
}
