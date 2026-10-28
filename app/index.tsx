import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { T } from '../src/components/ui';
import { useStore } from '../src/store';
import { space, theme } from '../src/theme';

export default function Index() {
  const { hydrated, authError, onboarded, me } = useStore();

  if (authError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
        <T size={13} weight="400" style={{ lineHeight: 20, textAlign: 'center' }}>
          {authError}
        </T>
      </View>
    );
  }

  if (!hydrated || onboarded === undefined) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.ink} />
      </View>
    );
  }

  return <Redirect href={!onboarded ? '/onboarding' : me?.role === 'supplier' ? '/live' : '/home'} />;
}
