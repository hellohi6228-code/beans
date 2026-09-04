import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../src/components/Header';
import { Card, Chip, Divider, Empty, Label, Photo, Row, Sub, T } from '../src/components/ui';
import { useStore } from '../src/store';
import { space, theme } from '../src/theme';
import { money } from '../src/units';

export default function Reports() {
  const insets = useSafeAreaInsets();
  const { me, reportsAgainst, listingById, userById } = useStore();
  if (!me) return null;

  const reports = reportsAgainst(me.id);

  return (
    <>
      <Header back title="Price reports" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.xxl, gap: space.md }}
      >
        {reports.length === 0 ? (
          <Card>
            <Empty glyph="🛡️" title="No reports" />
          </Card>
        ) : (
          reports.map((r) => {
            const listing = listingById(r.listingId);
            const reporter = userById(r.reporterId);
            const diff = r.askedTotal - r.listedTotal;
            return (
              <Card key={r.id} style={{ gap: space.sm }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Label>{new Date(r.createdAt).toLocaleDateString()}</Label>
                  <Chip
                    label={r.status === 'under_review' ? 'Under review' : r.status === 'upheld' ? 'Upheld' : 'Dismissed'}
                    tone={r.status === 'upheld' ? 'warn' : 'neutral'}
                  />
                </Row>

                <T size={15.5} weight="700">
                  {listing?.title ?? 'Listing'}
                </T>
                <T size={12.5} color={theme.muted}>
                  Reported by {reporter?.name ?? 'a buyer'}
                </T>

                <Divider />

                <Row style={{ justifyContent: 'space-between' }}>
                  <View>
                    <Label>Listed</Label>
                    <T size={16} weight="700">
                      {money(r.listedTotal)}
                    </T>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Label>Asked</Label>
                    <T size={16} weight="700" color={theme.warn}>
                      {money(r.askedTotal)}
                    </T>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Label>Difference</Label>
                    <T size={16} weight="800" color={diff > 0 ? theme.warn : theme.good}>
                      {diff > 0 ? '+' : ''}
                      {money(diff)}
                    </T>
                  </View>
                </Row>

                <Divider />

                <T size={13.5} weight="600">
                  {r.reason}
                </T>
                <Sub>{r.details}</Sub>

                {r.photos.length ? (
                  <Row style={{ gap: space.xs }}>
                    {r.photos.map((uri, i) => (
                      <Photo key={i} uri={uri} style={{ width: 72, height: 72 }} radius={10} />
                    ))}
                  </Row>
                ) : null}
              </Card>
            );
          })
        )}
      </ScrollView>
    </>
  );
}
