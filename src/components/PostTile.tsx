import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useStore } from '../store';
import { shadow, space, theme } from '../theme';
import { Post } from '../types';
import { Photo, T } from './ui';

const glyphFor = (kind: Post['kind']) =>
  kind === 'event' ? '📅' : kind === 'merchandise' ? '🛍️' : '📷';

/**
 * One square in the profile grid. Posts marked as something the account sells,
 * or an event it hosts, carry a chat button in the top-left corner that opens a
 * DM about that post.
 */
export function PostTile({ post, size }: { post: Post; size: number }) {
  const router = useRouter();
  const { me, openThread } = useStore();

  const canAsk = post.contactable && !!me && me.id !== post.userId;

  const ask = () => {
    const threadId = openThread(post.userId, post.id);
    router.push(`/chat/${threadId}`);
  };

  return (
    <View style={{ width: size, height: size }}>
      <Pressable onPress={() => router.push(`/post/${post.id}`)}>
        <Photo
          uri={post.photos[0]}
          seed={post.id}
          glyph={glyphFor(post.kind)}
          style={{ width: size, height: size }}
          radius={10}
        />
      </Pressable>

      {canAsk ? (
        <Pressable
          onPress={ask}
          hitSlop={8}
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: 'rgba(255,255,255,0.92)',
            alignItems: 'center',
            justifyContent: 'center',
            ...shadow,
          }}
        >
          <T size={13}>💬</T>
        </Pressable>
      ) : null}

      {post.contactable ? (
        <View
          style={{
            position: 'absolute',
            bottom: 6,
            right: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          <T size={9.5} weight="700" color={post.kind === 'event' ? theme.gold : theme.accent}>
            {post.kind === 'event' ? 'EVENT' : 'FOR SALE'}
          </T>
        </View>
      ) : null}
    </View>
  );
}

export const tileSize = (screenWidth: number) => (screenWidth - space.lg * 2 - space.xs * 2) / 3;
