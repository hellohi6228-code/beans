import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { PostTile } from '../../src/components/PostTile';
import { Avatar, Btn, Empty, Row, Rule, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme, track } from '../../src/theme';
import { supplierName, useLang } from '../../src/i18n';

const W = Dimensions.get('window').width;
const TILE = (W - space.lg * 2 - 4) / 3;

export default function BusinessProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userById, postsOf, openThread, me } = useStore();
  const { lang } = useLang();

  const user = userById(String(id));
  if (!user) return <Header back title="Not found" />;

  const posts = postsOf(user.id);
  const mine = me?.id === user.id;

  return (
    <>
      <Header back title={user.name || 'Profile'} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120 }}>
        <Rule />
        <View style={{ paddingVertical: space.lg, gap: space.lg }}>
          <Row style={{ gap: space.lg }}>
            <Avatar uri={user.avatar} name={user.name || ''} size={64} />
            <View style={{ flex: 1, gap: 4 }}>
              <T size={16} weight="400" style={{ letterSpacing: track.title }}>
                {user.name || 'Beans user'}
              </T>
              {user.supplierType ? (
                <T size={10} color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
                  {supplierName(user.supplierType, lang)}
                </T>
              ) : null}
            </View>
          </Row>

          {user.bio ? <Sub>{user.bio}</Sub> : null}

          {!mine && me ? (
            <Btn
              title="Message"
              kind="outline"
              onPress={async () => {
                const threadId = await openThread(user.id);
                router.push(`/chat/${threadId}`);
              }}
            />
          ) : null}
        </View>

        <Rule />

        {posts.length === 0 ? (
          <Empty title="No posts" />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, paddingTop: space.md }}>
            {posts.map((p) => (
              <PostTile key={p.id} post={p} size={TILE} />
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}
