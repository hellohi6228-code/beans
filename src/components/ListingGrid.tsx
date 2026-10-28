import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { useLang } from '../i18n';
import { priceLines, shipsLine, whatLine } from '../listing';
import { useStore } from '../store';
import { space, theme, track } from '../theme';
import { Post } from '../types';
import { Empty, Photo, T } from './ui';

const W = Dimensions.get('window').width;
const COL = (W - space.lg * 2 - 2) / 2;

/** Two columns of listings: photo, what it is, who sells it, price, where it ships from. */
export function ListingGrid({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const { userById } = useStore();
  const { lang } = useLang();

  if (posts.length === 0) return <Empty title="Nothing yet" />;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
      {posts.map((p) => {
        const l = p.listing!;
        const seller = userById(p.userId);
        const price = priceLines(l, lang);
        return (
          <Pressable key={p.id} onPress={() => router.push(`/post/${p.id}`)} style={{ width: COL }}>
            <Photo uri={p.photos[0]} style={{ width: COL, height: COL * 1.35 }} />
            <View style={{ paddingVertical: space.md, gap: 3 }}>
              <T size={12} weight="300" numberOfLines={1}>
                {p.caption || whatLine(l, lang)}
              </T>
              <T size={9.5} color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
                {seller?.name || 'Beans user'}
              </T>
              <T size={12} weight="400" style={{ marginTop: 2 }}>
                {price.main}
              </T>
              <T size={10} color={theme.inkSoft}>
                {price.sub}
              </T>
              <T size={9.5} color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
                {shipsLine(l, lang)}
              </T>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
