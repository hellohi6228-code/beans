import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RealtimeChannel } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ensureSession, supabase } from './lib/supabase';
import { Live, Message, Origin, Post, Report, SupplierType, Thread, User } from './types';

type Cache = {
  users: User[];
  posts: Post[];
  threads: Thread[];
  messages: Message[];
  reports: Report[];
  lives: Live[];
};

const emptyCache: Cache = { users: [], posts: [], threads: [], messages: [], reports: [], lives: [] };

const liveFromRow = (r: any): Live => ({
  id: r.id,
  sellerId: r.seller_id,
  title: r.title ?? '',
  startedAt: new Date(r.started_at).getTime(),
  lastSeen: new Date(r.last_seen).getTime(),
  endedAt: r.ended_at ? new Date(r.ended_at).getTime() : undefined,
});

/** On air: not ended, and the seller's page checked in within the last minute. */
export const isOnAir = (l: Live, now = Date.now()) => !l.endedAt && now - l.lastSeen < 60_000;

/** Locally remembered anonymous identities, so the demo bar can flip between
 * real backend accounts on one device without losing any of them. */
const DEMO_KEY = 'beans.demoAccounts.v1';
type DemoAccount = { id: string; accessToken: string; refreshToken: string };

const loadDemoAccounts = async (): Promise<DemoAccount[]> => {
  try {
    const raw = await AsyncStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as DemoAccount[]) : [];
  } catch {
    return [];
  }
};

const saveDemoAccounts = (list: DemoAccount[]) => AsyncStorage.setItem(DEMO_KEY, JSON.stringify(list)).catch(() => {});

const upsert = <T extends { id: string }>(list: T[], row: T): T[] => {
  const i = list.findIndex((x) => x.id === row.id);
  if (i === -1) return [row, ...list];
  const next = list.slice();
  next[i] = row;
  return next;
};
const removeById = <T extends { id: string }>(list: T[], id: string) => list.filter((x) => x.id !== id);

/* ------------------------------------------------------------ row mapping */
// PostgREST -> the domain shapes the rest of the app already speaks.

const userFromRow = (r: any): User => ({
  id: r.id,
  role: r.role,
  name: r.name ?? '',
  bio: r.bio ?? '',
  supplierType: r.supplier_type ?? undefined,
  shipsFrom: r.ships_from ?? undefined,
  avatar: r.avatar_url ?? undefined,
  createdAt: new Date(r.created_at).getTime(),
});

const postFromRow = (r: any): Post => ({
  id: r.id,
  userId: r.user_id,
  photos: r.photos ?? [],
  caption: r.caption ?? '',
  // listing_active is null on a plain post and true/false on a listing.
  // Older listings predate the food fields, so each falls back to how every
  // listing used to be: by weight, from US stock. Newer ones carry ingredient
  // tags instead of a category.
  listing:
    r.listing_active != null
      ? {
          category: r.category ?? undefined,
          ingredients: r.ingredients ?? [],
          sellBy: r.sell_by ?? 'weight',
          pricePerKg: Number(r.price_per_kg),
          lotKg: Number(r.lot_kg),
          enteredUnit: r.entered_unit,
          pricePerCase: r.price_per_case != null ? Number(r.price_per_case) : undefined,
          unitsPerCase: r.units_per_case ?? undefined,
          unitKg: r.unit_kg != null ? Number(r.unit_kg) : undefined,
          casesAvailable: r.cases_available ?? undefined,
          minOrder: Number(r.min_order ?? 0),
          cuisines: r.cuisines ?? [],
          shipsFrom: r.ships_from ?? 'us',
          leadDays: r.lead_days ?? undefined,
          fdaRegistered: !!r.fda_registered,
          englishLabel: !!r.english_label,
          allergens: r.allergens ?? [],
          active: !!r.listing_active,
        }
      : undefined,
  createdAt: new Date(r.created_at).getTime(),
});

const threadFromRow = (r: any): Thread => ({
  id: r.id,
  participants: r.participants,
  postId: r.post_id ?? undefined,
  createdAt: new Date(r.created_at).getTime(),
  lastAt: new Date(r.last_at).getTime(),
});

const messageFromRow = (r: any): Message => ({
  id: r.id,
  threadId: r.thread_id,
  senderId: r.sender_id,
  text: r.text ?? undefined,
  postId: r.post_id ?? undefined,
  createdAt: new Date(r.created_at).getTime(),
});

const reportFromRow = (r: any): Report => ({
  id: r.id,
  postId: r.post_id,
  reporterId: r.reporter_id,
  sellerId: r.seller_id,
  createdAt: new Date(r.created_at).getTime(),
});

type Ctx = {
  hydrated: boolean;
  /** Set when the backend rejected sign-in — almost always because anonymous
   * sign-ins are switched off for this Supabase project. */
  authError: string | null;
  state: Cache;
  me: User | null;

  updateMe: (patch: Partial<User>) => Promise<void>;
  /** Your own shipping address (buyers). Undefined while loading, null if none. */
  myAddress: string | null | undefined;
  /** Whether this account has been through onboarding. Undefined while loading. */
  onboarded: boolean | undefined;
  /** Onboarding: a buyer gives a shipping address; a seller what kind and where from. */
  onboard: (
    input:
      | { role: 'customer'; address: string }
      | { role: 'supplier'; supplierType: SupplierType; shipsFrom: 'us' | Origin }
  ) => Promise<void>;
  saveAddress: (address: string) => Promise<void>;

  /** Sellers on camera right now. */
  livesNow: Live[];
  startLive: (title: string) => Promise<Live>;
  /** Called every few seconds while on air, so a closed tab drops off. */
  heartbeatLive: (id: string) => Promise<void>;
  endLive: (id: string) => Promise<void>;

  /** Testing only: other real backend identities remembered on this device. */
  demoAccounts: string[];
  addTestUser: () => Promise<void>;
  switchUser: (id: string) => Promise<void>;


  userById: (id: string) => User | undefined;
  postById: (id: string) => Post | undefined;
  postsOf: (userId: string) => Post[];
  threadsOf: (userId: string) => Thread[];
  messagesOf: (threadId: string) => Message[];
  reportedByMe: (postId: string) => boolean;

  addPost: (input: Omit<Post, 'id' | 'createdAt' | 'userId'>) => Promise<Post>;
  removePost: (id: string) => Promise<void>;
  toggleListing: (postId: string) => Promise<void>;

  messageAbout: (post: Post) => Promise<string>;
  openThread: (otherUserId: string) => Promise<string>;
  sendMessage: (threadId: string, text: string) => Promise<void>;

  addReport: (postId: string, sellerId: string) => Promise<void>;

  /** Not persisted — just enough state to walk a brand-new supplier through
   * the menu once, right after they choose what they sell. */
  tutorial: boolean;
  startTutorial: () => void;
  endTutorial: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [meId, setMeId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [cache, setCache] = useState<Cache>(emptyCache);
  const [demoAccounts, setDemoAccounts] = useState<string[]>([]);
  const [tutorial, setTutorial] = useState(false);
  const [myAddress, setMyAddress] = useState<string | null | undefined>(undefined);

  // Establish (or restore) a session, then track whoever is signed in from
  // here on — switching a demo identity fires the same listener.
  useEffect(() => {
    let alive = true;

    ensureSession()
      .then((session) => alive && setMeId(session.user.id))
      .catch((err) => {
        if (!alive) return;
        const msg =
          err?.message?.includes('anonymous') || err?.code === 'anonymous_provider_disabled'
            ? 'Anonymous sign-ins are off for this Supabase project. Turn them on under Authentication → Sign In / Providers → Anonymous, then reload.'
            : !err?.message || /fetch|network/i.test(err.message)
              ? 'Could not reach the backend.'
              : err.message;
        setAuthError(msg);
        setHydrated(true);
      });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!alive) return;
      setMeId(session?.user.id ?? null);

      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
        // Keep this identity's tokens fresh in the remembered list, so
        // switching back to it later still works after its access token
        // (and, thanks to rotation, its refresh token) has moved on.
        const list = await loadDemoAccounts();
        const next = upsert(list, {
          id: session.user.id,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        });
        setDemoAccounts(next.map((a) => a.id));
        saveDemoAccounts(next);
      }
    });

    loadDemoAccounts().then((list) => alive && setDemoAccounts(list.map((a) => a.id)));

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Whenever the signed-in identity changes, load everything that identity
  // can see and keep it live.
  const channelsRef = useRef<RealtimeChannel[]>([]);
  useEffect(() => {
    if (!meId) return;
    let alive = true;

    channelsRef.current.forEach((c) => supabase.removeChannel(c));
    channelsRef.current = [];
    setCache(emptyCache);
    setMyAddress(undefined);

    (async () => {
      const [
        { data: users },
        { data: posts },
        { data: threadRows },
        { data: reportRows },
        { data: addressRow },
        { data: liveRows },
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('posts').select('*'),
        supabase.from('threads').select('*').contains('participants', [meId]),
        supabase.from('reports').select('*').eq('reporter_id', meId),
        supabase.from('addresses').select('address').eq('user_id', meId).maybeSingle(),
        supabase.from('lives').select('*').is('ended_at', null),
      ]);
      if (!alive) return;
      setMyAddress(addressRow?.address ?? null);

      const threads = (threadRows ?? []).map(threadFromRow);
      const threadIds = threads.map((t) => t.id);
      const { data: messageRows } = threadIds.length
        ? await supabase.from('messages').select('*').in('thread_id', threadIds)
        : { data: [] as any[] };
      if (!alive) return;

      setCache({
        users: (users ?? []).map(userFromRow),
        posts: (posts ?? []).map(postFromRow),
        threads,
        messages: (messageRows ?? []).map(messageFromRow),
        reports: (reportRows ?? []).map(reportFromRow),
        lives: (liveRows ?? []).map(liveFromRow),
      });
      setHydrated(true);
    })();

    const onPosts = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        setCache((c) => ({
          ...c,
          posts:
            payload.eventType === 'DELETE'
              ? removeById(c.posts, (payload.old as any).id)
              : upsert(c.posts, postFromRow(payload.new)),
        }));
      })
      .subscribe();

    const onProfiles = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        setCache((c) => ({
          ...c,
          users:
            payload.eventType === 'DELETE'
              ? removeById(c.users, (payload.old as any).id)
              : upsert(c.users, userFromRow(payload.new)),
        }));
      })
      .subscribe();

    // RLS applies to realtime the same as it does to a normal query, so this
    // only ever delivers threads and messages this identity is part of.
    const onThreads = supabase
      .channel('public:threads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threads' }, (payload) => {
        setCache((c) => ({
          ...c,
          threads:
            payload.eventType === 'DELETE'
              ? removeById(c.threads, (payload.old as any).id)
              : upsert(c.threads, threadFromRow(payload.new)),
        }));
      })
      .subscribe();

    const onMessages = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        setCache((c) => ({
          ...c,
          messages:
            payload.eventType === 'DELETE'
              ? removeById(c.messages, (payload.old as any).id)
              : upsert(c.messages, messageFromRow(payload.new)),
        }));
      })
      .subscribe();

    const onLives = supabase
      .channel('public:lives')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lives' }, (payload) => {
        setCache((c) => ({
          ...c,
          lives:
            payload.eventType === 'DELETE'
              ? removeById(c.lives, (payload.old as any).id)
              : upsert(c.lives, liveFromRow(payload.new)),
        }));
      })
      .subscribe();

    channelsRef.current = [onPosts, onProfiles, onThreads, onMessages, onLives];

    return () => {
      alive = false;
      channelsRef.current.forEach((c) => supabase.removeChannel(c));
      channelsRef.current = [];
    };
  }, [meId]);

  const me = useMemo(() => cache.users.find((u) => u.id === meId) ?? null, [cache.users, meId]);

  // A buyer is onboarded once they have a shipping address; a seller once
  // they have said what kind of seller and where their goods ship from.
  const onboarded =
    !hydrated || !me || myAddress === undefined
      ? undefined
      : me.role === 'supplier'
        ? !!me.supplierType && !!me.shipsFrom
        : !!myAddress;

  // Re-checks who is still on air as heartbeats age out.
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);
  const userById = useCallback((id: string) => cache.users.find((u) => u.id === id), [cache.users]);
  const postById = useCallback((id: string) => cache.posts.find((p) => p.id === id), [cache.posts]);

  // Pulls one thread and its messages straight from the backend so a chat
  // opened this instant has its data even a moment ahead of realtime.
  const pullThread = async (threadId: string) => {
    const [{ data: t }, { data: msgs }] = await Promise.all([
      supabase.from('threads').select('*').eq('id', threadId).single(),
      supabase.from('messages').select('*').eq('thread_id', threadId),
    ]);
    if (t) setCache((c) => ({ ...c, threads: upsert(c.threads, threadFromRow(t)) }));
    if (msgs) setCache((c) => ({ ...c, messages: msgs.reduce((acc, m) => upsert(acc, messageFromRow(m)), c.messages) }));
  };

  const value: Ctx = {
    hydrated,
    authError,
    state: cache,
    me,
    demoAccounts,

    updateMe: async (patch) => {
      if (!meId) return;
      const row: Record<string, unknown> = {};
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.bio !== undefined) row.bio = patch.bio;
      if ('avatar' in patch) row.avatar_url = patch.avatar ?? null;
      if (patch.role !== undefined) row.role = patch.role;
      if ('supplierType' in patch) row.supplier_type = patch.supplierType ?? null;
      if ('shipsFrom' in patch) row.ships_from = patch.shipsFrom ?? null;

      const { data, error } = await supabase.from('profiles').update(row).eq('id', meId).select().single();
      if (error) throw error;
      setCache((c) => ({ ...c, users: upsert(c.users, userFromRow(data)) }));
    },

    myAddress,
    onboarded,

    saveAddress: async (address) => {
      if (!meId) return;
      const clean = address.trim();
      if (!clean) throw new Error('Add a shipping address.');
      const { error } = await supabase
        .from('addresses')
        .upsert({ user_id: meId, address: clean, updated_at: new Date().toISOString() });
      if (error) throw error;
      setMyAddress(clean);
    },

    onboard: async (input) => {
      if (!meId) return;
      if (input.role === 'customer') {
        const clean = input.address.trim();
        if (!clean) throw new Error('Add a shipping address.');
        const { error: addressError } = await supabase
          .from('addresses')
          .upsert({ user_id: meId, address: clean, updated_at: new Date().toISOString() });
        if (addressError) throw addressError;
        setMyAddress(clean);
      }
      const { data, error } = await supabase
        .from('profiles')
        .update(
          input.role === 'supplier'
            ? { role: 'supplier', supplier_type: input.supplierType, ships_from: input.shipsFrom }
            : { role: 'customer', supplier_type: null, ships_from: null }
        )
        .eq('id', meId)
        .select()
        .single();
      if (error) throw error;
      setCache((c) => ({ ...c, users: upsert(c.users, userFromRow(data)) }));
    },

    livesNow: cache.lives.filter((l) => isOnAir(l, now)),

    startLive: async (title) => {
      if (!meId) throw new Error('Not signed in.');
      const { data, error } = await supabase
        .from('lives')
        .insert({ seller_id: meId, title: title.trim() })
        .select()
        .single();
      if (error) throw error;
      const live = liveFromRow(data);
      setCache((c) => ({ ...c, lives: upsert(c.lives, live) }));
      return live;
    },

    heartbeatLive: async (id) => {
      await supabase.from('lives').update({ last_seen: new Date().toISOString() }).eq('id', id);
    },

    endLive: async (id) => {
      const { data } = await supabase
        .from('lives')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (data) setCache((c) => ({ ...c, lives: upsert(c.lives, liveFromRow(data)) }));
    },

    addTestUser: async () => {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    },

    switchUser: async (id) => {
      const list = await loadDemoAccounts();
      const account = list.find((a) => a.id === id);
      if (!account) return;
      const { error } = await supabase.auth.setSession({
        access_token: account.accessToken,
        refresh_token: account.refreshToken,
      });
      if (error) throw error;
    },


    userById,
    postById,
    postsOf: (userId) => cache.posts.filter((p) => p.userId === userId).sort((a, b) => b.createdAt - a.createdAt),
    threadsOf: (userId) =>
      cache.threads.filter((t) => t.participants.includes(userId)).sort((a, b) => b.lastAt - a.lastAt),
    messagesOf: (threadId) =>
      cache.messages.filter((m) => m.threadId === threadId).sort((a, b) => a.createdAt - b.createdAt),
    reportedByMe: (postId) => cache.reports.some((r) => r.postId === postId && r.reporterId === meId),

    addPost: async (input) => {
      const l = input.listing;
      const row = {
        user_id: meId,
        photos: input.photos,
        caption: input.caption,
        price_per_kg: l?.pricePerKg ?? null,
        lot_kg: l?.lotKg ?? null,
        entered_unit: l?.enteredUnit ?? null,
        // Every listed price includes shipping.
        shipping_included: l ? true : null,
        listing_active: l ? l.active : null,
        ...(l
          ? {
              category: l.category ?? null,
              ingredients: l.ingredients,
              sell_by: l.sellBy,
              price_per_case: l.pricePerCase ?? null,
              units_per_case: l.unitsPerCase ?? null,
              unit_kg: l.unitKg ?? null,
              cases_available: l.casesAvailable ?? null,
              min_order: l.minOrder,
              cuisines: l.cuisines,
              ships_from: l.shipsFrom,
              lead_days: l.leadDays ?? null,
              fda_registered: l.fdaRegistered,
              english_label: l.englishLabel,
              allergens: l.allergens,
            }
          : {}),
      };
      const { data, error } = await supabase.from('posts').insert(row).select().single();
      if (error) throw error;
      const post = postFromRow(data);
      setCache((c) => ({ ...c, posts: upsert(c.posts, post) }));
      return post;
    },

    removePost: async (id) => {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      setCache((c) => ({ ...c, posts: removeById(c.posts, id) }));
    },

    toggleListing: async (postId) => {
      const current = cache.posts.find((p) => p.id === postId)?.listing;
      if (!current) return;
      const { data, error } = await supabase
        .from('posts')
        .update({ listing_active: !current.active })
        .eq('id', postId)
        .select()
        .single();
      if (error) throw error;
      setCache((c) => ({ ...c, posts: upsert(c.posts, postFromRow(data)) }));
    },

    messageAbout: async (post) => {
      const { data: threadId, error } = await supabase.rpc('find_or_create_thread', {
        p_other: post.userId,
        p_post: post.id,
      });
      if (error) throw error;
      await pullThread(threadId as string);
      return threadId as string;
    },

    openThread: async (otherUserId) => {
      const { data: threadId, error } = await supabase.rpc('find_or_create_thread', { p_other: otherUserId });
      if (error) throw error;
      await pullThread(threadId as string);
      return threadId as string;
    },

    sendMessage: async (threadId, text) => {
      if (!meId) return;
      const { data, error } = await supabase
        .from('messages')
        .insert({ thread_id: threadId, sender_id: meId, text })
        .select()
        .single();
      if (error) throw error;
      setCache((c) => ({ ...c, messages: upsert(c.messages, messageFromRow(data)) }));
    },

    addReport: async (postId, sellerId) => {
      if (!meId) return;
      const { data, error } = await supabase
        .from('reports')
        .insert({ post_id: postId, seller_id: sellerId, reporter_id: meId })
        .select()
        .single();
      // Reporting twice is blocked by a unique constraint — the UI already
      // hides the button once reported, so treat that race as a no-op.
      if (error && (error as any).code !== '23505') throw error;
      if (data) setCache((c) => ({ ...c, reports: upsert(c.reports, reportFromRow(data)) }));
    },

    tutorial,
    startTutorial: () => setTutorial(true),
    endTutorial: () => setTutorial(false),
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
