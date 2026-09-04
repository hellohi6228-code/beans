import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useStore } from '../store';
import { shadow } from '../theme';
import { Post } from '../types';
import { Photo, T } from './ui';

/**
 * One square in the profile grid. Posts marked as something the account sells,
 * or an event it hosts, carry a chat button in the top-left corner.
 */
export function PostTile({ post, size }: { post: Post; size: number }) {
  const router = useRouter();
  const { me, openThread } = useStore();

  const canAsk = post.contactable && !!me && me.id !== post.userId;

  return (
    <View style={{ width: size, height: size }}>
      <Pressable onPress={() => router.push(`/post/${post.id}`)}>
        <Photo uri={post.photos[0]} style={{ width: size, height: size }} radius={10} />
      </Pressable>

      {canAsk ? (
        <Pressable
          onPress={() => router.push(`/chat/${openThread(post.userId, post.id)}`)}
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
    </View>
  );
}
