import { useRouter } from 'expo-router';
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

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { me, postsOf } = useStore();
  const { lang } = useLang();
  if (!me) return null;

  const posts = postsOf(me.id);

  return (
    <>
      <Header title="Profile" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120 }}>
        <Rule />
        <View style={{ paddingVertical: space.lg, gap: space.lg }}>
          <Row style={{ gap: space.lg }}>
            <Avatar uri={me.avatar} name={me.name || ''} size={64} />
            <View style={{ flex: 1, gap: 4 }}>
              <T size={16} weight="400" style={{ letterSpacing: track.title }}>
                {me.name || 'Add your name'}
              </T>
              {me.supplierType ? (
                <T size={10} color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
                  {supplierName(me.supplierType, lang)}
                </T>
              ) : null}
            </View>
          </Row>

          {me.bio ? <Sub>{me.bio}</Sub> : null}

          <Btn title="Edit profile" kind="outline" onPress={() => router.push('/edit-profile')} />
        </View>

        <Rule />

        {posts.length === 0 ? (
          <Empty title="No posts yet" />
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
