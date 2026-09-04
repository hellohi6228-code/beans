import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Message, Order, Post, Report, Review, SupplierType, Thread, User } from './types';
import { Unit } from './units';

const KEY = 'beans.state.v4';

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
  orders: Order[];
  threads: Thread[];
  messages: Message[];
  reviews: Review[];
  reports: Report[];
  meId: string | null;
  request: SourcingRequest | null;
};

const blank: Persisted = {
  users: [],
  posts: [],
  orders: [],
  threads: [],
  messages: [],
  reviews: [],
  reports: [],
  meId: null,
  request: null,
};

const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const newUser = (name: string): User => ({
  id: uid('u'),
  role: 'customer',
  name,
  bio: '',
  createdAt: Date.now(),
});

type Ctx = {
  hydrated: boolean;
  state: Persisted;
  me: User | null;

  updateMe: (patch: Partial<User>) => void;
  becomeSupplier: (type: SupplierType) => void;

  /** Testing only: extra accounts on this device, and switching between them. */
  addTestUser: () => User;
  switchUser: (id: string) => void;

  setRequest: (r: SourcingRequest | null) => void;

  userById: (id: string) => User | undefined;
  postById: (id: string) => Post | undefined;
  postsOf: (userId: string) => Post[];
  reviewsOfSupplier: (supplierId: string) => Review[];
  ratingOf: (supplierId: string) => { avg: number; count: number };
  ordersOfCustomer: (customerId: string) => Order[];
  threadsOf: (userId: string) => Thread[];
  messagesOf: (threadId: string) => Message[];

  addPost: (input: Omit<Post, 'id' | 'createdAt' | 'userId'>) => Post;
  removePost: (id: string) => void;
  /** Switch a post's listing on or off without deleting the post. */
  toggleListing: (postId: string) => void;

  openThread: (otherUserId: string, aboutPostId?: string) => string;
  startOrder: (postId: string, qtyKg: number) => { threadId: string; orderId: string };
  sendMessage: (threadId: string, text: string) => void;

  addReview: (input: Omit<Review, 'id' | 'createdAt' | 'customerId'>) => void;
  addReport: (input: Omit<Report, 'id' | 'createdAt' | 'reporterId'>) => void;
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
          const account = newUser('');
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
      const account = newUser('');
      setState((s) => ({ ...s, users: [...s.users, account], meId: account.id }));
      return account;
    },

    switchUser: (id) => setState((s) => ({ ...s, meId: id })),

    setRequest: (request) => setState((s) => ({ ...s, request })),

    userById,
    postById,
    postsOf: (userId) => state.posts.filter((p) => p.userId === userId).sort((a, b) => b.createdAt - a.createdAt),
    reviewsOfSupplier: (supplierId) =>
      state.reviews.filter((r) => r.supplierId === supplierId).sort((a, b) => b.createdAt - a.createdAt),
    ratingOf: (supplierId) => {
      const rs = state.reviews.filter((r) => r.supplierId === supplierId);
      if (!rs.length) return { avg: 0, count: 0 };
      return { avg: rs.reduce((s, r) => s + r.rating, 0) / rs.length, count: rs.length };
    },
    ordersOfCustomer: (customerId) =>
      state.orders.filter((o) => o.customerId === customerId).sort((a, b) => b.createdAt - a.createdAt),
    threadsOf: (userId) =>
      state.threads.filter((t) => t.participants.includes(userId)).sort((a, b) => b.lastAt - a.lastAt),
    messagesOf: (threadId) =>
      state.messages.filter((m) => m.threadId === threadId).sort((a, b) => a.createdAt - b.createdAt),

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

    openThread: (otherUserId, aboutPostId) => {
      const meId = state.meId!;
      const existing = state.threads.find(
        (t) => t.participants.includes(meId) && t.participants.includes(otherUserId)
      );
      const threadId = existing?.id ?? uid('th');
      const now = Date.now();

      const pinned =
        aboutPostId && state.messages.some((m) => m.threadId === threadId && m.postId === aboutPostId);
      const card: Message | null =
        aboutPostId && !pinned
          ? { id: uid('m'), threadId, senderId: meId, postId: aboutPostId, system: true, createdAt: now }
          : null;

      if (!existing || card) {
        setState((s) => ({
          ...s,
          threads: existing
            ? s.threads.map((t) => (t.id === threadId ? { ...t, lastAt: now } : t))
            : [{ id: threadId, participants: [meId, otherUserId], createdAt: now, lastAt: now }, ...s.threads],
          messages: card ? [...s.messages, card] : s.messages,
        }));
      }

      return threadId;
    },

    startOrder: (postId, qtyKg) => {
      const post = state.posts.find((p) => p.id === postId)!;
      const listing = post.listing!;
      const customerId = state.meId!;
      const existing = state.threads.find(
        (t) => t.participants.includes(customerId) && t.participants.includes(post.userId)
      );
      const threadId = existing?.id ?? uid('th');
      const now = Date.now();

      const order: Order = {
        id: uid('o'),
        postId,
        customerId,
        supplierId: post.userId,
        qtyKg,
        lockedPricePerKg: listing.pricePerKg,
        lockedTotal: listing.pricePerKg * qtyKg,
        shippingIncluded: listing.shippingIncluded,
        createdAt: now,
        reviewed: false,
      };
      const card: Message = {
        id: uid('m'),
        threadId,
        senderId: customerId,
        orderId: order.id,
        system: true,
        createdAt: now,
      };

      setState((s) => ({
        ...s,
        orders: [order, ...s.orders],
        threads: existing
          ? s.threads.map((t) => (t.id === threadId ? { ...t, lastAt: now } : t))
          : [{ id: threadId, participants: [customerId, post.userId], createdAt: now, lastAt: now }, ...s.threads],
        messages: [...s.messages, card],
      }));

      return { threadId, orderId: order.id };
    },

    sendMessage: (threadId, text) => {
      const now = Date.now();
      const msg: Message = { id: uid('m'), threadId, senderId: state.meId ?? '', text, createdAt: now };
      setState((s) => ({
        ...s,
        messages: [...s.messages, msg],
        threads: s.threads.map((t) => (t.id === threadId ? { ...t, lastAt: now } : t)),
      }));
    },

    addReview: (input) => {
      const review: Review = { ...input, id: uid('r'), customerId: state.meId ?? '', createdAt: Date.now() };
      setState((s) => ({
        ...s,
        reviews: [review, ...s.reviews],
        orders: s.orders.map((o) => (o.id === input.orderId ? { ...o, reviewed: true } : o)),
      }));
    },

    addReport: (input) => {
      const report: Report = { ...input, id: uid('rep'), reporterId: state.meId ?? '', createdAt: Date.now() };
      setState((s) => ({ ...s, reports: [report, ...s.reports] }));
    },
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
