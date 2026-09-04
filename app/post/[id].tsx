import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Avatar, Card, Photo, Row, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { shadow, space, theme } from '../../src/theme';

const W = Dimensions.get('window').width;

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, userById, me, openThread, removePost } = useStore();

  const post = state.posts.find((p) => p.id === String(id));
  if (!post) return <Header back title="Not found" />;

  const author = userById(post.userId);
  const mine = me?.id === post.userId;
  const canAsk = post.contactable && !!me && !mine;

  return (
    <>
      <Header back title={author?.name || 'Post'} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120, gap: space.md }}
      >
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -space.lg }}
          >
            <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg }}>
              {post.photos.map((uri, i) => (
                <Photo key={i} uri={uri} style={{ width: W - space.lg * 2, height: 260 }} />
              ))}
            </View>
          </ScrollView>

          {canAsk ? (
            <Pressable
              onPress={() => router.push(`/chat/${openThread(post.userId, post.id)}`)}
              hitSlop={8}
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: 'rgba(255,255,255,0.94)',
                alignItems: 'center',
                justifyContent: 'center',
                ...shadow,
              }}
            >
              <T size={16}>💬</T>
            </Pressable>
          ) : null}
        </View>

        {post.caption ? (
          <Card style={{ gap: space.sm }}>
            <Row style={{ gap: space.md }}>
              <Avatar uri={author?.avatar} name={author?.name || '?'} size={34} />
              <T size={15} weight="700">
                {author?.name}
              </T>
            </Row>
            <Sub>{post.caption}</Sub>
          </Card>
        ) : null}

        {mine ? (
          <Card
            onPress={() => {
              removePost(post.id);
              router.back();
            }}
            style={{ padding: space.md, alignItems: 'center' }}
          >
            <T size={14} weight="600" color={theme.warn}>
              Delete post
            </T>
          </Card>
        ) : null}
      </ScrollView>
    </>
  );
}
