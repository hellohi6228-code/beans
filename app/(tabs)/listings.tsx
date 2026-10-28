import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Empty, Photo, Rule, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme, track } from '../../src/theme';
import { useLang } from '../../src/i18n';
import { availableLine, categoryLabel, priceLines } from '../../src/listing';

/** Every item this account is selling, one row each, with its on/off switch. */
export default function Listings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { me, postsOf, toggleListing } = useStore();
  const { lang } = useLang();
  if (!me) return null;

  const items = postsOf(me.id).filter((p) => p.listing);

  return (
    <>
      <Header title="Listing" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120 }}>
        {items.length === 0 ? (
          <Empty title="Nothing listed" />
        ) : (
          <>
            <View style={{ flexDirection: 'row', paddingBottom: space.sm }}>
              <View style={{ flex: 1 }}>
                <T size={9.5} color={theme.muted} style={{ letterSpacing: track.label }}>
                  ITEM
                </T>
              </View>
              <T size={9.5} color={theme.muted} style={{ letterSpacing: track.label }}>
                ON / OFF
              </T>
            </View>

            {items.map((p) => {
              const l = p.listing!;
              return (
                <View key={p.id}>
                  <Rule />
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md }}>
                    <Pressable
                      onPress={() => router.push(`/post/${p.id}`)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, flex: 1 }}
                    >
                      <Photo uri={p.photos[0]} style={{ width: 44, height: 55 }} />
                      <View style={{ flex: 1, gap: 3 }}>
                        <T size={12.5} weight="400" numberOfLines={1}>
                          {p.caption || 'Post'}
                        </T>
                        <T size={11} weight="400">
                          {priceLines(l, lang).main} · {priceLines(l, lang).sub}
                        </T>
                        <T size={9.5} color={theme.muted} style={{ letterSpacing: track.label }}>
                          {categoryLabel(l, lang)} · {availableLine(l, lang)}
                        </T>
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() => toggleListing(p.id)}
                      hitSlop={10}
                      style={{
                        width: 46,
                        height: 26,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: theme.ink,
                        backgroundColor: l.active ? theme.ink : 'transparent',
                        justifyContent: 'center',
                        paddingHorizontal: 3,
                      }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          backgroundColor: l.active ? '#fff' : theme.ink,
                          alignSelf: l.active ? 'flex-end' : 'flex-start',
                        }}
                      />
                    </Pressable>
                  </View>
                </View>
              );
            })}
            <Rule />
          </>
        )}
      </ScrollView>
    </>
  );
}
