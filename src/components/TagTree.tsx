import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { cuisineName, useLang } from '../i18n';
import { TREE, tagName } from '../tags';
import { space, theme, track } from '../theme';
import { CUISINES } from '../types';
import { Chip, T } from './ui';

/** "›", turned down when its branch is open. */
function Arrow({ open }: { open: boolean }) {
  return (
    <T size={16} weight="300" color={theme.muted} style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
      ›
    </T>
  );
}

function Box({ on }: { on: boolean }) {
  return (
    <View
      style={{
        width: 12,
        height: 12,
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: theme.ink,
        backgroundColor: on ? theme.ink : 'transparent',
      }}
    />
  );
}

/**
 * Cuisine → ingredient → item, each level folded behind a › arrow. Ticking
 * picks; the arrow only opens and closes. With `itemsOnly`, only the items
 * themselves can be picked — a seller says exactly what they sell.
 */
export function TagTree({
  selected,
  onToggle,
  itemsOnly = false,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
  itemsOnly?: boolean;
}) {
  const { lang } = useLang();
  const [open, setOpen] = useState<Set<string>>(new Set());

  const flip = (id: string) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // How many picks sit under a branch, shown beside it when it's folded.
  const under = (id: string) => [...selected].filter((s) => s === id || s.startsWith(`${id}.`)).length;

  const row = (id: string, label: string, depth: number) => {
    const count = under(id);
    const isOpen = open.has(id);
    const tickable = !itemsOnly;
    return (
      <View
        key={id}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: depth * space.lg,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.lineSoft,
        }}
      >
        <Pressable
          onPress={() => (tickable ? onToggle(id) : flip(id))}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }}
        >
          {tickable ? <Box on={selected.has(id)} /> : null}
          <T
            size={depth === 0 ? 11.5 : 11}
            weight={selected.has(id) || count ? '600' : depth === 0 ? '500' : '400'}
            style={{ letterSpacing: track.label, textTransform: 'uppercase', flexShrink: 1 }}
          >
            {label}
          </T>
          {count && !selected.has(id) ? (
            <T size={10} color={theme.muted}>
              {count}
            </T>
          ) : null}
        </Pressable>
        <Pressable onPress={() => flip(id)} hitSlop={12} style={{ paddingVertical: 12, paddingHorizontal: space.sm }}>
          <Arrow open={isOpen} />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.lineSoft }}>
      {CUISINES.map((c) => (
        <View key={c}>
          {row(c, cuisineName(c, lang), 0)}
          {open.has(c)
            ? TREE[c].groups.map((g) => (
                <View key={g.id}>
                  {row(g.id, tagName(g, lang), 1)}
                  {open.has(g.id) ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 6,
                        paddingLeft: space.lg * 2,
                        paddingBottom: space.md,
                      }}
                    >
                      {g.items.map((i) => (
                        <Chip key={i.id} label={tagName(i, lang)} selected={selected.has(i.id)} onPress={() => onToggle(i.id)} />
                      ))}
                    </View>
                  ) : null}
                </View>
              ))
            : null}
        </View>
      ))}
    </View>
  );
}
