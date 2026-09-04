import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Empty, Photo, Rule, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme, track } from '../../src/theme';

const ago = (ts: number) => {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}M`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}H`;
  return `${Math.round(hrs / 24)}D`;
};

export default function Messages() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { me, threadsOf, messagesOf, userById, postById } = useStore();
  if (!me) return null;

  const threads = threadsOf(me.id);

  return (
    <>
      <Header title="Messages" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120 }}>
        {threads.length === 0 ? (
          <Empty title="No messages" />
        ) : (
          threads.map((t) => {
            const otherId = t.participants.find((p) => p !== me.id) ?? t.participants[0];
            const other = userById(otherId);
            const post = t.postId ? postById(t.postId) : undefined;
            const msgs = messagesOf(t.id);
            const lastText = [...msgs].reverse().find((m) => m.text)?.text;

            return (
              <View key={t.id}>
                <Rule />
                <Pressable
                  onPress={() => router.push(`/chat/${t.id}`)}
                  style={{ flexDirection: 'row', gap: space.md, paddingVertical: space.lg, alignItems: 'center' }}
                >
                  {post ? <Photo uri={post.photos[0]} style={{ width: 52, height: 65 }} /> : null}

                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <T size={10} color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
                        {other?.name || 'Beans user'}
                      </T>
                      <T size={9.5} color={theme.muted} style={{ letterSpacing: track.label }}>
                        {ago(t.lastAt)}
                      </T>
                    </View>

                    {/* The preview is the name of the product or event. */}
                    <T size={13} weight="400" numberOfLines={1}>
                      {post ? post.caption || 'Post' : 'Direct message'}
                    </T>

                    {lastText ? (
                      <T size={11} weight="300" color={theme.muted} numberOfLines={1}>
                        {lastText}
                      </T>
                    ) : null}
                  </View>
                </Pressable>
              </View>
            );
          })
        )}
        <Rule />
      </ScrollView>
    </>
  );
}
