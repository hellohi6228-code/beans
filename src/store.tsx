import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BADGES, Badge, BadgeCtx, isEarned } from './badges';
import {
  seedListings,
  seedMessages,
  seedOrders,
  seedPosts,
  seedReviews,
  seedThreads,
  seedUsers,
} from './seed';
import { Listing, Message, Order, Post, Report, Review, Role, Thread, User } from './types';
import { Unit } from './units';

const KEY = 'beans.state.v1';

/** What the customer types on the front page: how much, and where it is going. */
export type SourcingRequest = {
  qty: number;
  unit: Unit;
  qtyKg: number;
  shippingIncluded: boolean;
  address: string;
};

type DB = {
  users: User[];
  posts: Post[];
  listings: Listing[];
  orders: Order[];
  threads: Thread[];
  messages: Message[];
  reviews: Review[];
  reports: Report[];
};

type Persisted = DB & {
  sessionUserId: string | null;
  request: SourcingRequest | null;
};

const initial: Persisted = {
  users: seedUsers,
  posts: seedPosts,
  listings: seedListings,
  orders: seedOrders,
  threads: seedThreads,
  messages: seedMessages,
  reviews: seedReviews,
  reports: [],
  sessionUserId: null,
  request: null,
};

const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

type Ctx = {
  hydrated: boolean;
  state: Persisted;
  me: User | null;

  signIn: (userId: string) => void;
  signOut: () => void;
  createAccount: (input: Omit<User, 'id' | 'joinedAt'>) => User;
  updateMe: (patch: Partial<User>) => void;

  setRequest: (r: SourcingRequest | null) => void;

  userById: (id: string) => User | undefined;
  listingById: (id: string) => Listing | undefined;
  listingsOf: (supplierId: string) => Listing[];
  postsOf: (userId: string) => Post[];
  reviewsOfSupplier: (supplierId: string) => Review[];
  ratingOf: (supplierId: string) => { avg: number; count: number };
  ordersOfCustomer: (customerId: string) => Order[];
  threadsOf: (userId: string) => Thread[];
  messagesOf: (threadId: string) => Message[];
  reportsAgainst: (supplierId: string) => Report[];

  addListing: (input: Omit<Listing, 'id' | 'createdAt' | 'supplierId' | 'active'>) => Listing;
  removeListing: (id: string) => void;
  addPost: (input: Omit<Post, 'id' | 'createdAt' | 'userId'>) => Post;

  /** Opens (or reuses) the chat with the supplier and pins an order card into it. */
  startOrder: (listingId: string, qtyKg: number) => { threadId: string; orderId: string };
  sendMessage: (threadId: string, text: string) => void;
  setOrderStatus: (orderId: string, status: Order['status']) => void;

  addReview: (input: Omit<Review, 'id' | 'createdAt' | 'customerId'>) => void;
  addReport: (input: Omit<Report, 'id' | 'createdAt' | 'reporterId' | 'status'>) => void;

  badgesFor: (customerId: string) => { badge: Badge; earned: boolean; have: number; need: number }[];
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Persisted;
            setState({ ...initial, ...parsed });
          } catch {
            // Corrupt cache — fall back to the seeded state.
          }
        }
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

  const me = useMemo(
    () => state.users.find((u) => u.id === state.sessionUserId) ?? null,
    [state.users, state.sessionUserId]
  );

  const userById = useCallback((id: string) => state.users.find((u) => u.id === id), [state.users]);
  const listingById = useCallback((id: string) => state.listings.find((l) => l.id === id), [state.listings]);

  const value: Ctx = {
    hydrated,
    state,
    me,

    signIn: (userId) => setState((s) => ({ ...s, sessionUserId: userId })),
    signOut: () => setState((s) => ({ ...s, sessionUserId: null, request: null })),

    createAccount: (input) => {
      const user: User = { ...input, id: uid('u'), joinedAt: Date.now() };
      setState((s) => ({ ...s, users: [...s.users, user], sessionUserId: user.id }));
      return user;
    },

    updateMe: (patch) =>
      setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.id === s.sessionUserId ? { ...u, ...patch } : u)),
      })),

    setRequest: (request) => setState((s) => ({ ...s, request })),

    userById,
    listingById,
    listingsOf: (supplierId) =>
      state.listings.filter((l) => l.supplierId === supplierId && l.active).sort((a, b) => b.createdAt - a.createdAt),
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
      state.threads
        .filter((t) => t.customerId === userId || t.supplierId === userId)
        .sort((a, b) => b.lastAt - a.lastAt),
    messagesOf: (threadId) =>
      state.messages.filter((m) => m.threadId === threadId).sort((a, b) => a.createdAt - b.createdAt),
    reportsAgainst: (supplierId) => state.reports.filter((r) => r.supplierId === supplierId),

    addListing: (input) => {
      const listing: Listing = {
        ...input,
        id: uid('l'),
        supplierId: state.sessionUserId ?? '',
        createdAt: Date.now(),
        active: true,
      };
      setState((s) => ({ ...s, listings: [listing, ...s.listings] }));
      return listing;
    },

    removeListing: (id) =>
      setState((s) => ({ ...s, listings: s.listings.map((l) => (l.id === id ? { ...l, active: false } : l)) })),

    addPost: (input) => {
      const post: Post = { ...input, id: uid('p'), userId: state.sessionUserId ?? '', createdAt: Date.now() };
      setState((s) => ({ ...s, posts: [post, ...s.posts] }));
      return post;
    },

    startOrder: (listingId, qtyKg) => {
      const listing = state.listings.find((l) => l.id === listingId)!;
      const customerId = state.sessionUserId!;
      const existing = state.threads.find((t) => t.customerId === customerId && t.supplierId === listing.supplierId);
      const threadId = existing?.id ?? uid('th');
      const now = Date.now();
      const order: Order = {
        id: uid('o'),
        listingId,
        customerId,
        supplierId: listing.supplierId,
        qtyKg,
        lockedPricePerKg: listing.pricePerKg,
        lockedTotal: listing.pricePerKg * qtyKg,
        shippingIncluded: listing.shippingIncluded,
        status: 'inquiry',
        createdAt: now,
        reviewed: false,
      };
      const card: Message = { id: uid('m'), threadId, senderId: customerId, orderId: order.id, system: true, createdAt: now };

      setState((s) => ({
        ...s,
        orders: [order, ...s.orders],
        threads: existing
          ? s.threads.map((t) => (t.id === threadId ? { ...t, lastAt: now } : t))
          : [{ id: threadId, customerId, supplierId: listing.supplierId, createdAt: now, lastAt: now }, ...s.threads],
        messages: [...s.messages, card],
      }));

      return { threadId, orderId: order.id };
    },

    sendMessage: (threadId, text) => {
      const now = Date.now();
      const msg: Message = { id: uid('m'), threadId, senderId: state.sessionUserId ?? '', text, createdAt: now };
      setState((s) => ({
        ...s,
        messages: [...s.messages, msg],
        threads: s.threads.map((t) => (t.id === threadId ? { ...t, lastAt: now } : t)),
      }));
    },

    setOrderStatus: (orderId, status) =>
      setState((s) => ({ ...s, orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)) })),

    addReview: (input) => {
      const review: Review = { ...input, id: uid('r'), customerId: state.sessionUserId ?? '', createdAt: Date.now() };
      setState((s) => ({
        ...s,
        reviews: [review, ...s.reviews],
        orders: s.orders.map((o) => (o.id === input.orderId ? { ...o, reviewed: true, status: 'completed' } : o)),
      }));
    },

    addReport: (input) => {
      const report: Report = {
        ...input,
        id: uid('rep'),
        reporterId: state.sessionUserId ?? '',
        status: 'under_review',
        createdAt: Date.now(),
      };
      setState((s) => ({ ...s, reports: [report, ...s.reports] }));
    },

    badgesFor: (customerId) => {
      const ctx: BadgeCtx = {
        orders: state.orders.filter((o) => o.customerId === customerId),
        reviews: state.reviews.filter((r) => r.customerId === customerId),
        supplierOf: (id) => state.users.find((u) => u.id === id),
        originOf: (listingId) => state.listings.find((l) => l.id === listingId)?.origin,
      };
      return BADGES.map((badge) => {
        const { have, need } = badge.progress(ctx);
        return { badge, earned: isEarned(badge, ctx), have, need };
      });
    },
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

export type { Role };
