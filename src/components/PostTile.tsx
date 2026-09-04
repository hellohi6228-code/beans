import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { theme } from '../theme';
import { Post } from '../types';
import { Photo, T } from './ui';

/**
 * A square in the grid. A post whose listing is switched on shows an icon in
 * the top-left corner; switched off, the icon is hidden.
 */
export function PostTile({ post, size }: { post: Post; size: number }) {
  const router = useRouter();
  const selling = !!post.listing?.active;

  return (
    <Pressable onPress={() => router.push(`/post/${post.id}`)} style={{ width: size, height: size * 1.25 }}>
      <Photo uri={post.photos[0]} style={{ width: size, height: size * 1.25 }} />

      {selling ? (
        <View
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 20,
            height: 20,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <T size={10} weight="600" color={theme.ink}>
            $
          </T>
        </View>
      ) : null}
    </Pressable>
  );
}
