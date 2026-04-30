import { forwardRef, useImperativeHandle, useState } from 'react';
import { Lock } from 'lucide-react';
import { ViewportPlaceholder } from './ViewportPlaceholder';
import { useBunnyPlayer, type UseBunnyPlayerHandle } from './useBunnyPlayer';

interface BunnyPlayerProps {
  /** Bunny Stream embed URL — issued per request by the backend so we don't
   *  expose permanent video URLs:
   *  https://iframe.mediadelivery.net/embed/{libraryId}/{guid}?token=...&expires=...
   */
  embedUrl: string | null;
  loading?: boolean;
  /** Optional thumbnail shown while loading or before iframe attaches —
   *  gives users immediate visual feedback instead of an empty black box. */
  posterUrl?: string;
  title?: string;
  /** Identity rendered as a moving watermark inside Bunny's iframe.
   *  Survives fullscreen (including iOS Safari) because the actual <div>
   *  lives inside the iframe — see the Custom HTML head we paste into
   *  the Bunny library Player settings. */
  watermarkText?: string;
  /** Called frequently (~4Hz) with the current playback time in seconds. */
  onTimeUpdate?: (seconds: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export type BunnyPlayerHandle = UseBunnyPlayerHandle;

export const BunnyPlayer = forwardRef<BunnyPlayerHandle, BunnyPlayerProps>(
  function BunnyPlayer(
    {
      embedUrl,
      loading,
      posterUrl,
      title,
      watermarkText,
      onTimeUpdate,
      onPlay,
      onPause,
      onEnded,
    },
    ref,
  ) {
    // Hold the iframe element in state (callback ref). The hook depends on
    // this — when the iframe mounts inside a conditional render, the
    // setState here triggers a re-render and the hook's effect attaches
    // its listeners. Plain `useRef` wouldn't trigger that.
    const [iframeEl, setIframeEl] = useState<HTMLIFrameElement | null>(null);

    const handle = useBunnyPlayer(iframeEl, {
      onTimeUpdate,
      onPlay,
      onPause,
      onEnded,
    });
    useImperativeHandle(
      ref,
      () => ({
        seekTo: handle.seekTo,
        play: handle.play,
        pause: handle.pause,
      }),
      [handle.seekTo, handle.play, handle.pause],
    );

    if (loading) {
      return posterUrl ? (
        <PosterLoading src={posterUrl} title={title} />
      ) : (
        <ViewportPlaceholder loading title="جاري تحميل الفيديو…" />
      );
    }

    if (!embedUrl) {
      return (
        <ViewportPlaceholder
          icon={<Lock />}
          title="الفيديو غير متاح حالياً"
          body="حدث خطأ أثناء تحميل رابط التشغيل. حاول التحديث."
        />
      );
    }

    // Append `#u=…` so the JS we inject via Bunny's Custom HTML head can read
    // it and render the watermark. URL fragments stay client-side — Bunny's
    // server never sees the user identifier.
    const src = watermarkText
      ? `${embedUrl}#u=${encodeURIComponent(watermarkText)}`
      : embedUrl;

    return (
      <iframe
        ref={setIframeEl}
        title={title ?? 'Lesson video'}
        src={src}
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        className="absolute inset-0 size-full border-0"
      />
    );
  },
);

function PosterLoading({ src, title }: { src: string; title?: string }) {
  return (
    <div className="absolute inset-0">
      <img
        src={src}
        alt={title ?? ''}
        className="size-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <span className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white/85" />
      </div>
    </div>
  );
}
