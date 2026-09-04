import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '../src/theme';
import { useStore } from '../src/store';

export default function Index() {
  const { hydrated, me } = useStore();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return <Redirect href={me ? '/home' : '/welcome'} />;
}
