import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Avatar, Card, Empty, Row, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme } from '../../src/theme';

const ago = (ts: number) => {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
};

export default function Messages() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { me, threadsOf, messagesOf, userById } = useStore();
  if (!me) return null;

  const threads = threadsOf(me.id);

  return (
    <>
      <Header title="Messages" subtitle="Orders, posts, and everything else" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120, gap: space.sm }}
      >
        {threads.length === 0 ? (
          <Card>
            <Empty
              glyph="💬"
              title="No conversations yet"
              body={
                me.role === 'customer'
                  ? 'Find beans, tap Order, and the chat opens here.'
                  : 'When a buyer orders one of your listings, the chat lands here.'
              }
            />
          </Card>
        ) : (
          threads.map((t) => {
            const otherId = t.participants.find((p) => p !== me.id) ?? t.participants[0];
            const other = userById(otherId);
            const msgs = messagesOf(t.id);
            const last = msgs[msgs.length - 1];
            return (
              <Card key={t.id} onPress={() => router.push(`/chat/${t.id}`)} style={{ padding: space.md }}>
                <Row style={{ gap: space.md }}>
                  <Avatar uri={other?.avatar} name={other?.name ?? '?'} />
                  <View style={{ flex: 1 }}>
                    <Row style={{ justifyContent: 'space-between' }}>
                      <T size={15} weight="600" numberOfLines={1}>
                        {other?.name ?? 'Beans user'}
                      </T>
                      <T size={12} color={theme.muted}>
                        {ago(t.lastAt)}
                      </T>
                    </Row>
                    <T size={13} color={theme.muted} numberOfLines={1}>
                      {last?.orderId
                        ? 'Order enquiry'
                        : last?.postId
                          ? 'Asked about a post'
                          : (last?.text ?? 'Say hello')}
                    </T>
                  </View>
                </Row>
              </Card>
            );
          })
        )}
      </ScrollView>
    </>
  );
}
