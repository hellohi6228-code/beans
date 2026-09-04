import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Btn, Card, Row, Sub, T } from '../src/components/ui';
import { useStore } from '../src/store';
import { space, theme } from '../src/theme';
import { SUPPLIER_LABEL } from '../src/types';

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, signIn } = useStore();

  const demos = state.users.slice(0, 7);

  const enter = (id: string) => {
    signIn(id);
    router.replace('/home');
  };

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: insets.top + space.xxl,
        paddingHorizontal: space.lg,
        paddingBottom: insets.bottom + space.xxl,
        gap: space.lg,
      }}
    >
      <View style={{ alignItems: 'center', gap: space.xs, marginBottom: space.md }}>
        <T size={44}>☕</T>
        <T size={40} weight="800" style={{ letterSpacing: -1.2 }}>
          Beans
        </T>
      </View>

      <Card style={{ gap: space.md }}>
        <Row style={{ gap: space.sm }}>
          <Btn
            title="I'm buying"
            onPress={() => router.push('/signup?role=customer')}
            style={{ flex: 1 }}
          />
          <Btn
            title="I'm selling"
            kind="soft"
            onPress={() => router.push('/signup?role=supplier')}
            style={{ flex: 1 }}
          />
        </Row>
      </Card>

      <View style={{ gap: space.sm }}>
        <T size={13} color={theme.muted} style={{ textAlign: 'center' }}>
          or try a sample account
        </T>

        {demos.map((u) => (
          <Card key={u.id} onPress={() => enter(u.id)} style={{ padding: space.md }}>
            <Row style={{ gap: space.md }}>
              <Avatar uri={u.avatar} name={u.name} />
              <View style={{ flex: 1 }}>
                <T size={15} weight="600">
                  {u.name}
                </T>
                <T size={12.5} color={theme.muted}>
                  @{u.handle} ·{' '}
                  {u.role === 'supplier' ? SUPPLIER_LABEL[u.supplierType ?? 'bulk'] : 'Buyer'}
                </T>
              </View>
              <T size={18} color={theme.muted}>
                ›
              </T>
            </Row>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
