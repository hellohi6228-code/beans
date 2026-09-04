import { usePathname, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, Pressable, View } from 'react-native';
import { useStore } from '../store';
import { radius, shadow, space, theme } from '../theme';
import { T } from './ui';

const SIZE = 56;
const { width: W, height: H } = Dimensions.get('window');

/** Drag it anywhere, tap it for the menu. */
export function FloatingNav() {
  const router = useRouter();
  const path = usePathname();
  const { me } = useStore();
  const [open, setOpen] = useState(false);

  const pos = useRef(new Animated.ValueXY({ x: W - SIZE - 20, y: H - SIZE - 100 })).current;
  const dragged = useRef(false);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        dragged.current = false;
        pos.extractOffset();
      },
      onPanResponderMove: (_, g) => {
        dragged.current = true;
        pos.setValue({ x: g.dx, y: g.dy });
      },
      onPanResponderRelease: () => {
        pos.flattenOffset();
        // Keep it on screen.
        const x = (pos.x as any)._value;
        const y = (pos.y as any)._value;
        Animated.spring(pos, {
          toValue: {
            x: Math.min(Math.max(x, 12), W - SIZE - 12),
            y: Math.min(Math.max(y, 50), H - SIZE - 40),
          },
          useNativeDriver: false,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const items = [
    { label: 'Find beans', glyph: '🔍', href: '/home' },
    ...(me?.role === 'supplier' ? [{ label: 'My listings', glyph: '🫘', href: '/listings' }] : []),
    { label: 'Messages', glyph: '💬', href: '/messages' },
    { label: 'Profile', glyph: '👤', href: '/profile' },
  ];

  const go = (href: string) => {
    setOpen(false);
    router.navigate(href as never);
  };

  return (
    <>
      {open ? (
        <Pressable
          onPress={() => setOpen(false)}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      ) : null}

      <Animated.View
        {...pan.panHandlers}
        style={{
          position: 'absolute',
          transform: [{ translateX: pos.x }, { translateY: pos.y }],
          alignItems: 'flex-end',
        }}
      >
        {open ? (
          <View
            style={{
              position: 'absolute',
              bottom: SIZE + 10,
              right: 0,
              backgroundColor: theme.cardSolid,
              borderRadius: radius.lg,
              paddingVertical: space.xs,
              minWidth: 172,
              borderWidth: 1,
              borderColor: theme.line,
              ...shadow,
            }}
          >
            {items.map((it) => {
              const on = path === it.href;
              return (
                <Pressable
                  key={it.href}
                  onPress={() => go(it.href)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.md,
                    paddingVertical: 11,
                    paddingHorizontal: space.lg,
                  }}
                >
                  <T size={17}>{it.glyph}</T>
                  <T size={15} weight={on ? '700' : '500'} color={on ? theme.accent : theme.ink}>
                    {it.label}
                  </T>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Pressable
          onPress={() => {
            if (!dragged.current) setOpen((v) => !v);
          }}
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            backgroundColor: theme.accent,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadow,
            shadowOpacity: 0.2,
            elevation: 6,
          }}
        >
          <T size={22} color="#fff">
            {open ? '×' : '☕'}
          </T>
        </Pressable>
      </Animated.View>
    </>
  );
}
