import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Btn, Photo, Row, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme, track } from '../../src/theme';
import { supplierName, useLang } from '../../src/i18n';
import { availableLine, minLine, packLine, priceLines, shipsLine } from '../../src/listing';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, me, messagesOf, userById, postById, sendMessage } = useStore();
  const { lang } = useLang();
  const scroller = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');

  const thread = state.threads.find((t) => t.id === String(id));
  if (!thread || !me) return <Header back title="Not found" />;

  const otherId = thread.participants.find((p) => p !== me.id) ?? thread.participants[0];
  const other = userById(otherId);
  const messages = messagesOf(thread.id);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(thread.id, text);
    setDraft('');
    requestAnimationFrame(() => scroller.current?.scrollToEnd({ animated: true }));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        back
        title={other?.name || 'Chat'}
        subtitle={other?.supplierType ? supplierName(other.supplierType, lang) : undefined}
      />

      <ScrollView
        ref={scroller}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.md }}
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((m) => {
          // The product card, sent once when the conversation started.
          if (m.postId) {
            const post = postById(m.postId);
            if (!post) return null;
            const l = post.listing;
            return (
              <Pressable
                key={m.id}
                onPress={() => router.push(`/post/${post.id}`)}
                style={{
                  flexDirection: 'row',
                  gap: space.md,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: theme.line,
                  backgroundColor: theme.surface,
                  padding: space.md,
                }}
              >
                <Photo uri={post.photos[0]} style={{ width: 64, height: 80 }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <T size={12.5} weight="400" numberOfLines={2}>
                    {post.caption || 'Post'}
                  </T>
                  {l ? (
                    <>
                      <T size={13} weight="500" style={{ marginTop: 2 }}>
                        {priceLines(l, lang).main}
                      </T>
                      <T size={10.5} color={theme.inkSoft}>
                        {priceLines(l, lang).sub}
                      </T>
                      {[packLine(l, lang) ?? availableLine(l, lang), minLine(l, lang), shipsLine(l, lang)]
                        .filter(Boolean)
                        .map((text) => (
                          <T key={text} size={9.5} color={theme.muted} style={{ letterSpacing: track.label }}>
                            {text}
                          </T>
                        ))}
                    </>
                  ) : null}
                </View>
              </Pressable>
            );
          }

          const mineMsg = m.senderId === me.id;
          return (
            <View
              key={m.id}
              style={{
                alignSelf: mineMsg ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                backgroundColor: mineMsg ? theme.ink : theme.surface,
                borderWidth: mineMsg ? 0 : StyleSheet.hairlineWidth,
                borderColor: theme.line,
                paddingHorizontal: space.md,
                paddingVertical: 10,
              }}
            >
              <T size={13.5} weight="300" color={mineMsg ? '#fff' : theme.ink} style={{ lineHeight: 19 }}>
                {m.text}
              </T>
            </View>
          );
        })}
      </ScrollView>

      <Row
        style={{
          gap: space.md,
          paddingHorizontal: space.lg,
          paddingTop: space.md,
          paddingBottom: insets.bottom + space.md,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.line,
        }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message"
          placeholderTextColor={theme.muted}
          multiline
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 40,
            maxHeight: 100,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.ink,
            paddingVertical: 8,
            fontSize: 14,
            fontWeight: '300',
            color: theme.ink,
          }}
        />
        <Btn title="Send" onPress={send} disabled={!draft.trim()} style={{ height: 40, paddingHorizontal: space.lg }} />
      </Row>
    </KeyboardAvoidingView>
  );
}
