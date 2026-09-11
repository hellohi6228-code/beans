import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { theme } from '../theme';
import { Post } from '../types';
import { Photo } from './ui';

/**
 * A square in the grid. A post whose listing is switched on shows our mark in
 * the top-left corner; switched off, it is hidden.
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
            width: 22,
            height: 22,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            source={require('../../assets/logo-mark.png')}
            resizeMode="contain"
            style={{ width: 15, height: 15 }}
          />
        </View>
      ) : null}
    </Pressable>
  );
}
