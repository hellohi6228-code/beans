import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Avatar, Card, Chip, Photo, Row, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme } from '../../src/theme';

const W = Dimensions.get('window').width;

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, userById } = useStore();

  const post = state.posts.find((p) => p.id === String(id));
  if (!post) return <Header back title="Post not found" />;
  const author = userById(post.userId);

  return (
    <>
      <Header back title={author?.name ?? 'Post'} subtitle={new Date(post.createdAt).toLocaleDateString()} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.xxl, gap: space.md }}
      >
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.lg }}>
          <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg }}>
            {(post.photos.length ? post.photos : [undefined]).map((uri, i) => (
              <Photo
                key={i}
                uri={uri}
                seed={post.id + i}
                glyph={post.kind === 'event' ? '📅' : post.kind === 'merchandise' ? '🛍️' : '📷'}
                style={{ width: W - space.lg * 2, height: 260 }}
              />
            ))}
          </View>
        </ScrollView>

        <Card style={{ gap: space.sm }}>
          <Row style={{ gap: space.md }}>
            <Avatar uri={author?.avatar} name={author?.name ?? '?'} size={38} />
            <View style={{ flex: 1 }}>
              <T size={15} weight="700">
                {author?.name}
              </T>
              <T size={12.5} color={theme.muted}>
                @{author?.handle}
              </T>
            </View>
            <Chip
              label={post.kind === 'event' ? 'Event' : post.kind === 'merchandise' ? 'Merch' : 'Update'}
              tone={post.kind === 'event' ? 'gold' : 'neutral'}
            />
          </Row>

          <Sub>{post.caption}</Sub>
        </Card>

        <Card onPress={() => router.push(`/business/${post.userId}`)} style={{ padding: space.md }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T size={14} weight="600">
              See the whole profile
            </T>
            <T size={18} color={theme.muted}>
              ›
            </T>
          </Row>
        </Card>
      </ScrollView>
    </>
  );
}
