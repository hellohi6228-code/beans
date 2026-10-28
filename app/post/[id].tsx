import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Avatar, Btn, Label, Photo, Row, Rule, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme, track } from '../../src/theme';
import {
  allergenLine,
  availableLine,
  categoryLabel,
  dutiesLine,
  minLine,
  packLine,
  priceLines,
  shipsLine,
  trustLine,
} from '../../src/listing';
import { cuisineName, supplierName, useLang } from '../../src/i18n';

const W = Dimensions.get('window').width;

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { postById, userById, messageAbout, removePost, toggleListing, addReport, reportedByMe, me } = useStore();
  const { lang } = useLang();

  const [asking, setAsking] = useState(false);

  const post = postById(String(id));
  const author = post ? userById(post.userId) : undefined;
  if (!post || !author) return <Header back title="Not found" />;

  const listing = post.listing;
  const mine = me?.id === post.userId;
  const live = !!listing?.active;
  const reported = reportedByMe(post.id);

  // A listing that is switched off cannot be messaged about.
  const canMessage = !!me && !mine && (!listing || live);

  return (
    <>
      <Header back />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {post.photos.map((uri, i) => (
            <Photo key={i} uri={uri} style={{ width: W, height: W * 1.25 }} />
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg }}>
          {post.caption ? (
            <T size={17} weight="300" style={{ letterSpacing: track.title, lineHeight: 24 }}>
              {post.caption}
            </T>
          ) : null}

          {listing ? (
            <View style={{ marginTop: space.lg }}>
              <Label>{categoryLabel(listing, lang)}</Label>

              <Row style={{ gap: space.sm, alignItems: 'baseline', marginTop: space.sm }}>
                <T size={19} weight="400">
                  {priceLines(listing, lang).main}
                </T>
                <T size={13} weight="300" color={theme.inkSoft}>
                  {priceLines(listing, lang).sub}
                </T>
              </Row>

              <View style={{ marginTop: space.md, gap: 4 }}>
                {[
                  listing.cuisines.length ? listing.cuisines.map((c) => cuisineName(c, lang)).join(' · ') : null,
                  packLine(listing, lang),
                  availableLine(listing, lang),
                  minLine(listing, lang),
                  shipsLine(listing, lang),
                  trustLine(listing, lang),
                  allergenLine(listing, lang),
                ]
                  .filter(Boolean)
                  .map((line) => (
                    <T key={line} size={11} color={theme.inkSoft} style={{ letterSpacing: 0.4 }}>
                      {line}
                    </T>
                  ))}
              </View>

              <T size={10} color={theme.muted} style={{ marginTop: space.md }}>
                {dutiesLine(lang)}
              </T>

              {mine ? (
                <Pressable
                  onPress={() => toggleListing(post.id)}
                  style={{
                    marginTop: space.lg,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: theme.ink,
                    paddingVertical: 12,
                    paddingHorizontal: space.md,
                  }}
                >
                  <T size={11} weight="500" style={{ letterSpacing: track.button }}>
                    LISTING
                  </T>
                  <T size={11} weight="600" style={{ letterSpacing: track.button }}>
                    {live ? 'ON' : 'OFF'}
                  </T>
                </Pressable>
              ) : !live ? (
                <T size={11} color={theme.warn} style={{ letterSpacing: track.label, marginTop: space.md }}>
                  NOT AVAILABLE
                </T>
              ) : null}
            </View>
          ) : null}

          <View style={{ marginTop: space.xl }}>
            <Rule />
            <Pressable
              onPress={() => router.push(`/business/${author.id}`)}
              style={{ paddingVertical: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md }}
            >
              <Avatar uri={author.avatar} name={author.name || '?'} size={36} />
              <View style={{ flex: 1 }}>
                <T size={13} weight="400">
                  {author.name || 'Beans user'}
                </T>
                {author.supplierType ? (
                  <T size={10} color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
                    {supplierName(author.supplierType, lang)}
                  </T>
                ) : null}
              </View>
              <T size={12} color={theme.muted}>
                →
              </T>
            </Pressable>
            <Rule />
          </View>

          {canMessage ? (
            <Btn
              title="Message"
              onPress={async () => {
                const threadId = await messageAbout(post);
                router.replace(`/chat/${threadId}`);
              }}
              style={{ marginTop: space.lg }}
            />
          ) : null}

          {listing && me && !mine ? (
            reported ? (
              <T size={10} color={theme.muted} style={{ letterSpacing: track.label, marginTop: space.lg, textAlign: 'center' }}>
                PRICE REPORTED
              </T>
            ) : (
              <Btn title="Report price" kind="text" onPress={() => setAsking(true)} style={{ marginTop: space.md }} />
            )
          ) : null}

          {mine ? (
            <Btn
              title="Delete post"
              kind="text"
              onPress={async () => {
                await removePost(post.id);
                router.back();
              }}
              style={{ marginTop: space.lg }}
            />
          ) : null}
        </View>
      </ScrollView>

      {/* Report is one question. */}
      <Modal visible={asking} transparent animationType="fade" onRequestClose={() => setAsking(false)}>
        <Pressable
          onPress={() => setAsking(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: space.lg }}
        >
          <View style={{ backgroundColor: theme.surface, padding: space.lg }}>
            <T size={14} weight="400" style={{ lineHeight: 21, marginBottom: space.lg }}>
              Were you asked to pay a different price than the one listed?
            </T>
            <Row style={{ gap: space.md }}>
              <Btn title="No" kind="outline" onPress={() => setAsking(false)} style={{ flex: 1 }} />
              <Btn
                title="Yes"
                onPress={async () => {
                  await addReport(post.id, post.userId);
                  setAsking(false);
                }}
                style={{ flex: 1 }}
              />
            </Row>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
