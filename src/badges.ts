import { Order, Review, User, SupplierType } from './types';

export type Badge = {
  id: string;
  name: string;
  glyph: string;
  tier: 'bronze' | 'silver' | 'gold';
  blurb: string;
  /** How far along the customer is, out of `need`. */
  progress: (ctx: BadgeCtx) => { have: number; need: number };
};

export type BadgeCtx = {
  orders: Order[];
  reviews: Review[];
  supplierOf: (id: string) => User | undefined;
  originOf: (listingId: string) => string | undefined;
};

const done = (ctx: BadgeCtx) => ctx.orders.filter((o) => o.status === 'completed' || o.status === 'agreed');

const typeCount = (ctx: BadgeCtx, t: SupplierType) =>
  done(ctx).filter((o) => ctx.supplierOf(o.supplierId)?.supplierType === t).length;

const origins = (ctx: BadgeCtx) =>
  new Set(done(ctx).map((o) => ctx.originOf(o.listingId)).filter(Boolean) as string[]);

export const BADGES: Badge[] = [
  {
    id: 'first-pour',
    name: 'First Pour',
    glyph: '☕',
    tier: 'bronze',
    blurb: 'Place your first order.',
    progress: (c) => ({ have: Math.min(done(c).length, 1), need: 1 }),
  },
  {
    id: 'regular',
    name: 'Regular',
    glyph: '🔁',
    tier: 'bronze',
    blurb: 'Three orders placed.',
    progress: (c) => ({ have: Math.min(done(c).length, 3), need: 3 }),
  },
  {
    id: 'cellar',
    name: 'Cellar Builder',
    glyph: '📦',
    tier: 'silver',
    blurb: 'Ten orders placed.',
    progress: (c) => ({ have: Math.min(done(c).length, 10), need: 10 }),
  },
  {
    id: 'note-taker',
    name: 'Note Taker',
    glyph: '✍️',
    tier: 'bronze',
    blurb: 'Write your first review.',
    progress: (c) => ({ have: Math.min(c.reviews.length, 1), need: 1 }),
  },
  {
    id: 'cupping-panel',
    name: 'Cupping Panel',
    glyph: '🥄',
    tier: 'silver',
    blurb: 'Write five reviews.',
    progress: (c) => ({ have: Math.min(c.reviews.length, 5), need: 5 }),
  },
  {
    id: 'photo-notes',
    name: 'Show & Tell',
    glyph: '📸',
    tier: 'silver',
    blurb: 'Add photos to three reviews.',
    progress: (c) => ({ have: Math.min(c.reviews.filter((r) => r.photos.length > 0).length, 3), need: 3 }),
  },
  {
    id: 'farm-direct',
    name: 'Farm Direct',
    glyph: '🌱',
    tier: 'bronze',
    blurb: 'Buy straight from a farmer.',
    progress: (c) => ({ have: Math.min(typeCount(c, 'farmer'), 1), need: 1 }),
  },
  {
    id: 'pallet-club',
    name: 'Pallet Club',
    glyph: '🚚',
    tier: 'silver',
    blurb: 'Buy from a bulk seller.',
    progress: (c) => ({ have: Math.min(typeCount(c, 'bulk'), 1), need: 1 }),
  },
  {
    id: 'mail-order',
    name: 'Mail Order',
    glyph: '📮',
    tier: 'bronze',
    blurb: 'Buy from an online retailer.',
    progress: (c) => ({ have: Math.min(typeCount(c, 'online_retail'), 1), need: 1 }),
  },
  {
    id: 'shop-local',
    name: 'Shop Local',
    glyph: '🏪',
    tier: 'bronze',
    blurb: 'Buy from a coffee shop.',
    progress: (c) => ({ have: Math.min(typeCount(c, 'coffee_shop'), 1), need: 1 }),
  },
  {
    id: 'whole-chain',
    name: 'Whole Chain',
    glyph: '🔗',
    tier: 'gold',
    blurb: 'Buy from all four kinds of supplier.',
    progress: (c) => ({
      have: (['farmer', 'bulk', 'online_retail', 'coffee_shop'] as SupplierType[]).filter((t) => typeCount(c, t) > 0).length,
      need: 4,
    }),
  },
  {
    id: 'passport',
    name: 'Passport',
    glyph: '🗺️',
    tier: 'silver',
    blurb: 'Beans from three origins.',
    progress: (c) => ({ have: Math.min(origins(c).size, 3), need: 3 }),
  },
  {
    id: 'globetrotter',
    name: 'Globetrotter',
    glyph: '🌍',
    tier: 'gold',
    blurb: 'Beans from six origins.',
    progress: (c) => ({ have: Math.min(origins(c).size, 6), need: 6 }),
  },
  {
    id: 'heavy-lifter',
    name: 'Heavy Lifter',
    glyph: '🏋️',
    tier: 'gold',
    blurb: 'Order 100 kg / 220.46 lb in total.',
    progress: (c) => ({
      have: Math.min(Math.round(done(c).reduce((s, o) => s + o.qtyKg, 0)), 100),
      need: 100,
    }),
  },
];

export const isEarned = (b: Badge, ctx: BadgeCtx) => {
  const p = b.progress(ctx);
  return p.have >= p.need;
};
