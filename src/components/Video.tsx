import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/** A live camera stream. Web only — the browser's own <video>. */
export function Video({ stream, muted }: { stream: MediaStream | null; muted: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = stream;
    if (stream) el.play().catch(() => {});
  }, [stream]);

  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted]);

  if (Platform.OS !== 'web') return null;

  return React.createElement('video', {
    ref,
    autoPlay: true,
    playsInline: true,
    muted,
    style: { width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000', display: 'block' },
  });
}
