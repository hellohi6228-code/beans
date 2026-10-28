import React from 'react';
import { Pressable, ScrollView } from 'react-native';
import { LANGS, useLang } from '../i18n';
import { space, theme, track } from '../theme';
import { T } from './ui';

/** One line of language names, each in its own script so anyone can find theirs. */
export function LangPicker() {
  const { lang, setLang } = useLang();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -space.lg }}
      contentContainerStyle={{ gap: space.md, paddingHorizontal: space.lg, justifyContent: 'center', flexGrow: 1 }}
    >
      {LANGS.map((l) => (
        <Pressable key={l.value} onPress={() => setLang(l.value)} hitSlop={8}>
          <T
            size={10}
            weight={lang === l.value ? '500' : '300'}
            color={lang === l.value ? theme.ink : theme.muted}
            style={{ letterSpacing: track.label }}
          >
            {l.label}
          </T>
        </Pressable>
      ))}
    </ScrollView>
  );
}
