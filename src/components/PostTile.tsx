import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { shadow } from '../theme';
import { Post } from '../types';
import { Photo, T } from './ui';

/** A square in the grid. A post that is selling shows an icon in the corner. */
export function PostTile({ post, size }: { post: Post; size: number }) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/post/${post.id}`)} style={{ width: size, height: size }}>
      <Photo uri={post.photos[0]} style={{ width: size, height: size }} radius={10} />

      {post.listing ? (
        <View
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.92)',
            alignItems: 'center',
            justifyContent: 'center',
            ...shadow,
          }}
        >
          <T size={12}>🫘</T>
        </View>
      ) : null}
    </Pressable>
  );
}
