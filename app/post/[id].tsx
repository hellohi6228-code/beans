import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Avatar, Btn, Card, Chip, Divider, Field, Label, Photo, Row, Segmented, Stars, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme } from '../../src/theme';
import { SUPPLIER_LABEL } from '../../src/types';
import { Unit, money, priceParts, toKg, weightParts } from '../../src/units';

const W = Dimensions.get('window').width;

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { postById, userById, ratingOf, startOrder, openThread, removePost, toggleListing, me, state } = useStore();

  const post = postById(String(id));
  const author = post ? userById(post.userId) : undefined;
  const listing = post?.listing;

  const [unit, setUnit] = useState<Unit>(state.request?.unit ?? 'kg');
  const [qty, setQty] = useState(() => {
    if (!post?.listing) return '';
    const kg = Math.min(state.request?.qtyKg ?? post.listing.lotKg, post.listing.lotKg);
    const u = state.request?.unit ?? 'kg';
    return String(Number((u === 'kg' ? kg : kg * 2.20462262).toFixed(2)));
  });

  if (!post || !author) return <Header back title="Not found" />;

  const mine = me?.id === post.userId;
  const rating = ratingOf(author.id);

  const parsed = parseFloat(qty.replace(',', '.'));
  const qtyKg = isFinite(parsed) && parsed > 0 ? toKg(parsed, unit) : 0;
  const overLot = !!listing && qtyKg > listing.lotKg + 1e-9;
  const canOrder = !!listing && listing.active && !!me && !mine && qtyKg > 0 && !overLot;

  const order = () => {
    const { threadId } = startOrder(post.id, qtyKg);
    router.replace(`/chat/${threadId}`);
  };

  return (
    <>
      <Header back title={author.name || 'Post'} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120, gap: space.md }}
      >
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

        <Card onPress={() => router.push(`/business/${author.id}`)} style={{ padding: space.md }}>
          <Row style={{ gap: space.md }}>
            <Avatar uri={author.avatar} name={author.name || '?'} />
            <View style={{ flex: 1 }}>
              <T size={15} weight="700">
                {author.name || 'Beans user'}
              </T>
              {author.supplierType ? (
                <T size={12.5} color={theme.muted}>
                  {SUPPLIER_LABEL[author.supplierType]}
                </T>
              ) : null}
              {rating.count ? <Stars value={rating.avg} /> : null}
            </View>
            <T size={18} color={theme.muted}>
              ›
            </T>
          </Row>
        </Card>

        {post.caption ? (
          <Card>
            <Sub>{post.caption}</Sub>
          </Card>
        ) : null}

        {listing ? (
          <Card style={{ gap: space.md, opacity: listing.active || mine ? 1 : 0.6 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Chip
                label={listing.shippingIncluded ? 'Shipping included' : 'Shipping not included'}
                tone={listing.shippingIncluded ? 'good' : 'warn'}
              />
              {mine ? (
                <Pressable
                  onPress={() => toggleListing(post.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 999,
                    backgroundColor: listing.active ? theme.goodSoft : theme.line,
                  }}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: listing.active ? theme.good : theme.muted,
                    }}
                  />
                  <T size={12.5} weight="700" color={listing.active ? theme.good : theme.muted}>
                    {listing.active ? 'On' : 'Off'}
                  </T>
                </Pressable>
              ) : !listing.active ? (
                <Chip label="Not available" tone="warn" />
              ) : null}
            </Row>

            <Row style={{ justifyContent: 'space-between' }}>
              <View>
                <Label>Price</Label>
                <T size={22} weight="800" color={theme.accent}>
                  {priceParts(listing.pricePerKg).perKg}
                </T>
                <T size={15} weight="600" color={theme.inkSoft}>
                  {priceParts(listing.pricePerKg).perLb}
                </T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Label>Amount</Label>
                <T size={22} weight="800">
                  {weightParts(listing.lotKg).kg}
                </T>
                <T size={15} weight="600" color={theme.inkSoft}>
                  {weightParts(listing.lotKg).lb}
                </T>
              </View>
            </Row>

            {me && !mine ? (
              <>
                <Divider />
                <Label>How much</Label>
                <Row style={{ gap: space.sm, alignItems: 'flex-end' }}>
                  <Field value={qty} onChangeText={setQty} keyboardType="decimal-pad" style={{ flex: 1 }} />
                  <View style={{ width: 120 }}>
                    <Segmented
                      value={unit}
                      onChange={setUnit}
                      options={[
                        { value: 'kg', label: 'kg' },
                        { value: 'lb', label: 'lb' },
                      ]}
                    />
                  </View>
                </Row>

                <T size={13} color={overLot ? theme.warn : theme.muted}>
                  {overLot
                    ? `Only ${weightParts(listing.lotKg).kg} / ${weightParts(listing.lotKg).lb} available.`
                    : qtyKg > 0
                      ? `${weightParts(qtyKg).kg} / ${weightParts(qtyKg).lb}`
                      : ''}
                </T>

                <Row style={{ justifyContent: 'space-between' }}>
                  <Label>Total</Label>
                  <T size={26} weight="800">
                    {money(listing.pricePerKg * qtyKg)}
                  </T>
                </Row>

                <Btn title="Order" onPress={order} disabled={!canOrder} />
              </>
            ) : null}
          </Card>
        ) : null}

        {me && !mine ? (
          <Btn
            title="Message"
            kind="soft"
            onPress={() => router.push(`/chat/${openThread(post.userId, post.id)}`)}
          />
        ) : null}

        {listing && me && !mine ? (
          <Btn title="Report price" kind="danger" onPress={() => router.push(`/report/${post.id}`)} />
        ) : null}

        {mine ? (
          <Btn
            title="Delete post"
            kind="danger"
            onPress={() => {
              removePost(post.id);
              router.back();
            }}
          />
        ) : null}
      </ScrollView>
    </>
  );
}
