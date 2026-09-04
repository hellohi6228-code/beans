import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Message, Post, Report, SupplierType, Thread, User } from './types';
import { Unit } from './units';

const KEY = 'beans.state.v5';

export type SourcingRequest = {
  qty: number;
  unit: Unit;
  qtyKg: number;
  shippingIncluded: boolean;
  address: string;
};

type Persisted = {
  users: User[];
  posts: Post[];
  threads: Thread[];
  messages: Message[];
  reports: Report[];
  meId: string | null;
  request: SourcingRequest | null;
};

const blank: Persisted = {
  users: [],
  posts: [],
  threads: [],
  messages: [],
  reports: [],
  meId: null,
  request: null,
};

const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const newUser = (): User => ({ id: uid('u'), role: 'customer', name: '', bio: '', createdAt: Date.now() });

type Ctx = {
  hydrated: boolean;
  state: Persisted;
  me: User | null;

  updateMe: (patch: Partial<User>) => void;
  becomeSupplier: (type: SupplierType) => void;

  addTestUser: () => User;
  switchUser: (id: string) => void;

  setRequest: (r: SourcingRequest | null) => void;

  userById: (id: string) => User | undefined;
  postById: (id: string) => Post | undefined;
  postsOf: (userId: string) => Post[];
  threadsOf: (userId: string) => Thread[];
  messagesOf: (threadId: string) => Message[];
  reportedByMe: (postId: string) => boolean;

  addPost: (input: Omit<Post, 'id' | 'createdAt' | 'userId'>) => Post;
  removePost: (id: string) => void;
  toggleListing: (postId: string) => void;

  /**
   * Starts the conversation about a post. The product card goes in once, here,
   * and never again.
   */
  messageAbout: (post: Post) => string;
  openThread: (otherUserId: string) => string;
  sendMessage: (threadId: string, text: string) => void;

  addReport: (postId: string, sellerId: string) => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(blank);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!alive) return;
        let next = blank;
        if (raw) {
          try {
            next = { ...blank, ...(JSON.parse(raw) as Persisted) };
          } catch {
            // Unreadable cache — start clean.
          }
        }
        if (!next.meId || !next.users.some((u) => u.id === next.meId)) {
          const account = newUser();
          next = { ...next, users: [...next.users, account], meId: account.id };
        }
        setState(next);
      })
      .finally(() => alive && setHydrated(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const me = useMemo(() => state.users.find((u) => u.id === state.meId) ?? null, [state.users, state.meId]);
  const userById = useCallback((id: string) => state.users.find((u) => u.id === id), [state.users]);
  const postById = useCallback((id: string) => state.posts.find((p) => p.id === id), [state.posts]);

  const value: Ctx = {
    hydrated,
    state,
    me,

    updateMe: (patch) =>
      setState((s) => ({ ...s, users: s.users.map((u) => (u.id === s.meId ? { ...u, ...patch } : u)) })),

    becomeSupplier: (type) =>
      setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.id === s.meId ? { ...u, role: 'supplier', supplierType: type } : u)),
      })),

    addTestUser: () => {
      const account = newUser();
      setState((s) => ({ ...s, users: [...s.users, account], meId: account.id }));
      return account;
    },

    switchUser: (id) => setState((s) => ({ ...s, meId: id })),

    setRequest: (request) => setState((s) => ({ ...s, request })),

    userById,
    postById,
    postsOf: (userId) => state.posts.filter((p) => p.userId === userId).sort((a, b) => b.createdAt - a.createdAt),
    threadsOf: (userId) =>
      state.threads.filter((t) => t.participants.includes(userId)).sort((a, b) => b.lastAt - a.lastAt),
    messagesOf: (threadId) =>
      state.messages.filter((m) => m.threadId === threadId).sort((a, b) => a.createdAt - b.createdAt),
    reportedByMe: (postId) => state.reports.some((r) => r.postId === postId && r.reporterId === state.meId),

    addPost: (input) => {
      const post: Post = { ...input, id: uid('p'), userId: state.meId ?? '', createdAt: Date.now() };
      setState((s) => ({ ...s, posts: [post, ...s.posts] }));
      return post;
    },

    removePost: (id) => setState((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== id) })),

    toggleListing: (postId) =>
      setState((s) => ({
        ...s,
        posts: s.posts.map((p) =>
          p.id === postId && p.listing ? { ...p, listing: { ...p.listing, active: !p.listing.active } } : p
        ),
      })),

    messageAbout: (post) => {
      const meId = state.meId!;
      // One conversation per product, so the card is only ever sent once.
      const existing = state.threads.find(
        (t) => t.postId === post.id && t.participants.includes(meId) && t.participants.includes(post.userId)
      );
      if (existing) return existing.id;

      const threadId = uid('th');
      const now = Date.now();
      setState((s) => ({
        ...s,
        threads: [
          { id: threadId, participants: [meId, post.userId], postId: post.id, createdAt: now, lastAt: now },
          ...s.threads,
        ],
        messages: [...s.messages, { id: uid('m'), threadId, senderId: meId, postId: post.id, createdAt: now }],
      }));
      return threadId;
    },

    openThread: (otherUserId) => {
      const meId = state.meId!;
      const existing = state.threads.find(
        (t) => !t.postId && t.participants.includes(meId) && t.participants.includes(otherUserId)
      );
      if (existing) return existing.id;

      const threadId = uid('th');
      const now = Date.now();
      setState((s) => ({
        ...s,
        threads: [{ id: threadId, participants: [meId, otherUserId], createdAt: now, lastAt: now }, ...s.threads],
      }));
      return threadId;
    },

    sendMessage: (threadId, text) => {
      const now = Date.now();
      setState((s) => ({
        ...s,
        messages: [...s.messages, { id: uid('m'), threadId, senderId: s.meId ?? '', text, createdAt: now }],
        threads: s.threads.map((t) => (t.id === threadId ? { ...t, lastAt: now } : t)),
      }));
    },

    addReport: (postId, sellerId) =>
      setState((s) => ({
        ...s,
        reports: [
          { id: uid('rep'), postId, sellerId, reporterId: s.meId ?? '', createdAt: Date.now() },
          ...s.reports,
        ],
      })),
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
