import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { space, theme } from '../theme';
import { Listing, SUPPLIER_LABEL, User } from '../types';
import { money, priceParts, weightParts } from '../units';
import { Card, Chip, Photo, Row, T } from './ui';

export function ListingCard({
  listing,
  supplier,
  qtyKg,
}: {
  listing: Listing;
  supplier?: User;
  /** When the customer asked for a specific amount, show what that costs. */
  qtyKg?: number;
}) {
  const router = useRouter();
  const price = priceParts(listing.pricePerKg);
  const lot = weightParts(listing.lotKg);
  const askKg = qtyKg && qtyKg > 0 ? Math.min(qtyKg, listing.lotKg) : undefined;

  return (
    <Card onPress={() => router.push(`/listing/${listing.id}`)} style={{ padding: space.md }}>
      <Row style={{ alignItems: 'flex-start', gap: space.md }}>
        <Photo uri={listing.photos[0]} seed={listing.id} style={{ width: 92, height: 92 }} />

        <View style={{ flex: 1, gap: 4 }}>
          <T size={15.5} weight="700" numberOfLines={2}>
            {listing.title}
          </T>

          {supplier ? (
            <T size={12.5} color={theme.muted} numberOfLines={1}>
              {supplier.name} · {SUPPLIER_LABEL[supplier.supplierType ?? 'bulk']}
            </T>
          ) : null}

          <Row style={{ gap: 6, marginTop: 2 }}>
            <T size={15} weight="700" color={theme.accent}>
              {price.perKg}
            </T>
            <T size={13} color={theme.inkSoft}>
              · {price.perLb}
            </T>
          </Row>

          <T size={12.5} color={theme.inkSoft}>
            Lot {lot.kg} / {lot.lb} · {listing.origin}
          </T>

          <Row style={{ gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <Chip
              label={listing.shippingIncluded ? 'Shipping included' : 'Shipping not included'}
              tone={listing.shippingIncluded ? 'good' : 'warn'}
            />
            {askKg ? (
              <Chip label={`${money(listing.pricePerKg * askKg)} for your ${weightParts(askKg).kg}`} tone="gold" />
            ) : null}
          </Row>
        </View>
      </Row>
    </Card>
  );
}
