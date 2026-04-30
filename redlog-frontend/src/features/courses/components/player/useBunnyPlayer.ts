import { useCallback, useEffect, useRef } from 'react';
import { Player } from 'player.js';

interface PlayerCallbacks {
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  /** Fires roughly every 250ms while the video is playing, with the current time in seconds. */
  onTimeUpdate?: (seconds: number) => void;
  onEnded?: () => void;
}

export interface UseBunnyPlayerHandle {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
}

/**
 * Wraps Bunny Stream's iframe with the official player.js client. Bunny
 * implements the player.js protocol on its hosted iframe, so we get
 * `ready/play/pause/timeupdate/ended` events and seek/play/pause control
 * for free.
 *
 * Driving this with `iframe` as state (callback ref) is what makes the
 * effect re-run when the iframe mounts inside a conditional render — a
 * plain `useRef` wouldn't trigger the re-render, so listeners would never
 * attach.
 */
export function useBunnyPlayer(
  iframe: HTMLIFrameElement | null,
  callbacks: PlayerCallbacks,
): UseBunnyPlayerHandle {
  // Keep the latest callbacks in a ref so re-renders don't tear down
  // the player.js subscriptions.
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;

  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!iframe) {
      playerRef.current = null;
      return;
    }

    const player = new Player(iframe);
    playerRef.current = player;

    player.on('ready', () => {
      cbRef.current.onReady?.();

      // Once the player reports ready, it's safe to subscribe to events.
      // (The library queues these otherwise and they may be lost.)
      player.on('play', () => cbRef.current.onPlay?.());
      player.on('pause', () => cbRef.current.onPause?.());
      player.on('ended', () => cbRef.current.onEnded?.());
      player.on('timeupdate', (data) => {
        cbRef.current.onTimeUpdate?.(data?.seconds ?? 0);
      });
    });

    return () => {
      // player.js doesn't expose a destroy method — clearing the ref is
      // enough; the next iframe will get a fresh Player instance.
      playerRef.current = null;
    };
  }, [iframe]);

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.setCurrentTime(seconds);
  }, []);
  const play = useCallback(() => playerRef.current?.play(), []);
  const pause = useCallback(() => playerRef.current?.pause(), []);

  return { seekTo, play, pause };
}
