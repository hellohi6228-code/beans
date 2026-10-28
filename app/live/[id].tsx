import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { ListingGrid } from '../../src/components/ListingGrid';
import { Btn, Empty, Label, Row, Sub, T } from '../../src/components/ui';
import { Video } from '../../src/components/Video';
import { supplierName, useLang } from '../../src/i18n';
import { canStream, watch } from '../../src/live';
import { isOnAir, useStore } from '../../src/store';
import { space, theme, track } from '../../src/theme';

/** Buyers: watch a seller's live, message them, and see what they sell. */
export default function WatchLive() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lang } = useLang();
  const { state, userById, postsOf, openThread, me } = useStore();

  const live = state.lives.find((l) => l.id === id);
  const seller = live ? userById(live.sellerId) : undefined;
  const onAir = !!live && isOnAir(live);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [viewers, setViewers] = useState(0);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!id || !canStream()) return;
    const w = watch(id, { stream: setStream, viewers: setViewers, ended: () => setEnded(true) });
    return () => w.stop();
  }, [id]);

  if (!live || ended || !onAir) {
    return (
      <>
        <Header back title="Live" />
        <Empty title="This live has ended" />
      </>
    );
  }

  const listings = seller ? postsOf(seller.id).filter((p) => p.listing?.active) : [];

  return (
    <>
      <Header
        back
        title={seller?.name || 'Seller'}
        subtitle={seller?.supplierType ? supplierName(seller.supplierType, lang) : undefined}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120, gap: space.lg }}>
        {!canStream() ? (
          <Sub>Live video runs in the browser for now. Open Beans in Chrome or Safari to watch.</Sub>
        ) : (
          <View style={{ aspectRatio: 3 / 4, backgroundColor: theme.ink, overflow: 'hidden' }}>
            <Video stream={stream} muted={muted} />
            {!stream ? (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                <T size={11} color="#fff" style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
                  Connecting…
                </T>
              </View>
            ) : null}
            <Row style={{ position: 'absolute', top: space.md, left: space.md, gap: 6, backgroundColor: '#e5484d', paddingVertical: 4, paddingHorizontal: 8 }}>
              <T size={10} weight="600" color="#fff" style={{ letterSpacing: track.label }}>
                LIVE · {viewers}
              </T>
            </Row>
            <Pressable
              onPress={() => setMuted((m) => !m)}
              style={{ position: 'absolute', top: space.md, right: space.md, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 4, paddingHorizontal: 8 }}
            >
              <T size={10} weight="600" color="#fff" style={{ letterSpacing: track.label }}>
                {muted ? 'SOUND ON' : 'MUTE'}
              </T>
            </Pressable>
          </View>
        )}

        {live.title ? <T size={15} weight="300">{live.title}</T> : null}

        {seller && seller.id !== me?.id ? (
          <Btn
            title="Message"
            onPress={async () => {
              const threadId = await openThread(seller.id);
              router.push(`/chat/${threadId}`);
            }}
          />
        ) : null}

        <View style={{ gap: space.md }}>
          <Label>What they sell</Label>
          <ListingGrid posts={listings} />
        </View>
      </ScrollView>
    </>
  );
}
