import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BADGES, Badge, BadgeCtx, isEarned } from './badges';
import { Listing, Message, Order, Post, Report, Review, SupplierType, Thread, User } from './types';
import { Unit } from './units';

const KEY = 'beans.state.v3';

/** What the front page asks: how much, and is shipping included. */
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
  listings: Listing[];
  orders: Order[];
  threads: Thread[];
  messages: Message[];
  reviews: Review[];
  reports: Report[];
  /** The account on this device. Created on first launch, never signed out of. */
  meId: string | null;
  request: SourcingRequest | null;
};

const empty: Persisted = {
  users: [],
  posts: [],
  listings: [],
  orders: [],
  threads: [],
  messages: [],
  reviews: [],
  reports: [],
  meId: null,
  request: null,
};

const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

type Ctx = {
  hydrated: boolean;
  state: Persisted;
  me: User | null;

  updateMe: (patch: Partial<User>) => void;
  /** Flips the account to a supplier so it can list beans. */
  becomeSupplier: (type: SupplierType) => void;

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

  addListing: (input: Omit<Listing, 'id' | 'createdAt' | 'supplierId' | 'active'>) => Listing;
  removeListing: (id: string) => void;
  addPost: (input: Omit<Post, 'id' | 'createdAt' | 'userId'>) => Post;
  removePost: (id: string) => void;

  openThread: (otherUserId: string, aboutPostId?: string) => string;
  startOrder: (listingId: string, qtyKg: number) => { threadId: string; orderId: string };
  sendMessage: (threadId: string, text: string) => void;
  setOrderStatus: (orderId: string, status: Order['status']) => void;

  addReview: (input: Omit<Review, 'id' | 'createdAt' | 'customerId'>) => void;
  addReport: (input: Omit<Report, 'id' | 'createdAt' | 'reporterId' | 'status'>) => void;

  badgesFor: (userId: string) => { badge: Badge; earned: boolean; have: number; need: number }[];
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!alive) return;
        let next = empty;
        if (raw) {
          try {
            next = { ...empty, ...(JSON.parse(raw) as Persisted) };
          } catch {
            // Unreadable cache — start clean.
          }
        }
        // The device's account. There is no sign up: first launch creates it.
        if (!next.meId || !next.users.some((u) => u.id === next.meId)) {
          const account: User = { id: uid('u'), role: 'customer', name: '', bio: '', createdAt: Date.now() };
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
  const listingById = useCallback((id: string) => state.listings.find((l) => l.id === id), [state.listings]);

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

    setRequest: (request) => setState((s) => ({ ...s, request })),

    userById,
    listingById,
    listingsOf: (supplierId) =>
      state.listings
        .filter((l) => l.supplierId === supplierId && l.active)
        .sort((a, b) => b.createdAt - a.createdAt),
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

    addListing: (input) => {
      const listing: Listing = {
        ...input,
        id: uid('l'),
        supplierId: state.meId ?? '',
        createdAt: Date.now(),
        active: true,
      };
      setState((s) => ({ ...s, listings: [listing, ...s.listings] }));
      return listing;
    },

    removeListing: (id) =>
      setState((s) => ({ ...s, listings: s.listings.map((l) => (l.id === id ? { ...l, active: false } : l)) })),

    addPost: (input) => {
      const post: Post = { ...input, id: uid('p'), userId: state.meId ?? '', createdAt: Date.now() };
      setState((s) => ({ ...s, posts: [post, ...s.posts] }));
      return post;
    },

    removePost: (id) => setState((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== id) })),

    openThread: (otherUserId, aboutPostId) => {
      const meId = state.meId!;
      const existing = state.threads.find(
        (t) => t.participants.includes(meId) && t.participants.includes(otherUserId)
      );
      const threadId = existing?.id ?? uid('th');
      const now = Date.now();

      const alreadyPinned =
        aboutPostId && state.messages.some((m) => m.threadId === threadId && m.postId === aboutPostId);
      const card: Message | null =
        aboutPostId && !alreadyPinned
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

    startOrder: (listingId, qtyKg) => {
      const listing = state.listings.find((l) => l.id === listingId)!;
      const customerId = state.meId!;
      const existing = state.threads.find(
        (t) => t.participants.includes(customerId) && t.participants.includes(listing.supplierId)
      );
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
          : [
              { id: threadId, participants: [customerId, listing.supplierId], createdAt: now, lastAt: now },
              ...s.threads,
            ],
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

    setOrderStatus: (orderId, status) =>
      setState((s) => ({ ...s, orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)) })),

    addReview: (input) => {
      const review: Review = { ...input, id: uid('r'), customerId: state.meId ?? '', createdAt: Date.now() };
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
        reporterId: state.meId ?? '',
        status: 'under_review',
        createdAt: Date.now(),
      };
      setState((s) => ({ ...s, reports: [report, ...s.reports] }));
    },

    badgesFor: (userId) => {
      const ctx: BadgeCtx = {
        orders: state.orders.filter((o) => o.customerId === userId),
        reviews: state.reviews.filter((r) => r.customerId === userId),
        supplierOf: (id) => state.users.find((u) => u.id === id),
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
