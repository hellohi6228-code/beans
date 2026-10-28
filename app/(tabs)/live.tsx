import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Btn, Field, Label, Row, Sub, T } from '../../src/components/ui';
import { Video } from '../../src/components/Video';
import { broadcast, canStream, openCamera } from '../../src/live';
import { useStore } from '../../src/store';
import { space, theme, track } from '../../src/theme';
import { Live } from '../../src/types';

/** Sellers: show buyers the real goods on camera. Buyers find you on their front page. */
export default function GoLive() {
  const insets = useSafeAreaInsets();
  const { me, postsOf, startLive, heartbeatLive, endLive } = useStore();

  const [title, setTitle] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [live, setLive] = useState<Live | null>(null);
  const [viewers, setViewers] = useState(0);
  const [busy, setBusy] = useState(false);
  const session = useRef<{ stop: () => void; beat: ReturnType<typeof setInterval>; id: string; stream: MediaStream } | null>(null);

  const stop = async () => {
    const s = session.current;
    session.current = null;
    if (!s) return;
    clearInterval(s.beat);
    s.stop();
    s.stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setLive(null);
    setViewers(0);
    await endLive(s.id).catch(() => {});
  };

  // Leaving the screen ends the live.
  useEffect(() => () => void stop(), []);

  const start = async () => {
    setBusy(true);
    let cam: MediaStream | null = null;
    try {
      cam = await openCamera();
      const l = await startLive(title);
      const b = broadcast(l.id, cam, setViewers);
      const beat = setInterval(() => heartbeatLive(l.id), 20_000);
      session.current = { stop: b.stop, beat, id: l.id, stream: cam };
      setStream(cam);
      setLive(l);
    } catch (err: any) {
      cam?.getTracks().forEach((t) => t.stop());
      Alert.alert('Could not go live', err?.message ?? 'Allow the camera and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!me) return null;
  const selling = postsOf(me.id).filter((p) => p.listing?.active).length;

  return (
    <>
      <Header title="Live" subtitle={live ? `On air · ${viewers} watching` : undefined} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120, gap: space.lg }}>
        {!canStream() ? (
          <Sub>Live video runs in the browser for now. Open Beans in Chrome or Safari to go live.</Sub>
        ) : (
          <>
            <View style={{ aspectRatio: 3 / 4, backgroundColor: theme.ink, overflow: 'hidden' }}>
              {stream ? (
                <Video stream={stream} muted />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
                  <T size={11} color="#fff" style={{ letterSpacing: track.label, textTransform: 'uppercase', textAlign: 'center' }}>
                    Show buyers the real thing
                  </T>
                </View>
              )}
              {live ? (
                <Row style={{ position: 'absolute', top: space.md, left: space.md, gap: 6, backgroundColor: '#e5484d', paddingVertical: 4, paddingHorizontal: 8 }}>
                  <T size={10} weight="600" color="#fff" style={{ letterSpacing: track.label }}>
                    LIVE · {viewers}
                  </T>
                </Row>
              ) : null}
            </View>

            {live ? (
              <Btn title="End live" kind="outline" onPress={stop} />
            ) : (
              <>
                <Field label="What you're showing" value={title} onChangeText={setTitle} placeholder="This week's gochugaru harvest" />
                <Btn title="Go live" onPress={start} busy={busy} />
              </>
            )}

            <View style={{ gap: space.sm }}>
              <Label>While you're live</Label>
              <Sub>
                Buyers see you at the top of their front page and can message you from the stream. Your{' '}
                {selling} active {selling === 1 ? 'listing shows' : 'listings show'} under the video.
              </Sub>
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}
