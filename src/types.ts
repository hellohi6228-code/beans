export type SupplierType = 'farmer' | 'manufacturer' | 'importer' | 'bulk' | 'online_retail' | 'coffee_shop';

export type Role = 'customer' | 'supplier';

export const SUPPLIER_TYPES: SupplierType[] = [
  'farmer',
  'manufacturer',
  'importer',
  'bulk',
  'online_retail',
  'coffee_shop',
];

/** What a listing is. Ordered roughly by how much of it a restaurant buys. */
export type Category =
  | 'produce'
  | 'meat'
  | 'seafood'
  | 'dairy'
  | 'noodles'
  | 'sauces'
  | 'pantry'
  | 'frozen'
  | 'snacks'
  | 'tea'
  | 'coffee';

export const CATEGORIES: Category[] = [
  'produce',
  'meat',
  'seafood',
  'dairy',
  'noodles',
  'sauces',
  'pantry',
  'frozen',
  'snacks',
  'tea',
  'coffee',
];

/** The kitchens a listing is for. A listing can serve several. */
export type Cuisine =
  | 'chinese'
  | 'japanese'
  | 'korean'
  | 'vietnamese'
  | 'thai'
  | 'filipino'
  | 'indian'
  | 'mediterranean'
  | 'mexican'
  | 'italian'
  | 'african';

export const CUISINES: Cuisine[] = [
  'chinese',
  'japanese',
  'korean',
  'vietnamese',
  'thai',
  'filipino',
  'indian',
  'mediterranean',
  'mexican',
  'italian',
  'african',
];

/** Where an overseas listing ships from. */
export type Origin =
  | 'china'
  | 'taiwan'
  | 'japan'
  | 'korea'
  | 'vietnam'
  | 'thailand'
  | 'philippines'
  | 'india'
  | 'mexico'
  | 'italy'
  | 'other';

export const ORIGINS: Origin[] = [
  'china',
  'taiwan',
  'japan',
  'korea',
  'vietnam',
  'thailand',
  'philippines',
  'india',
  'mexico',
  'italy',
  'other',
];

/** The nine major food allergens US labels must declare (sesame since 2023). */
export const ALLERGENS = ['milk', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 'wheat', 'soy', 'sesame'] as const;
export type Allergen = (typeof ALLERGENS)[number];

export type User = {
  id: string;
  role: Role;
  name: string;
  bio: string;
  supplierType?: SupplierType;
  avatar?: string;
  createdAt: number;
};

/**
 * The selling half of a post. Sold either by weight (coffee, tea, bulk dry
 * goods) or by the case (snacks, sauces, frozen). Case listings still carry a
 * per-kg equivalent and a total weight, so every listing can be compared and
 * shown in kg and lb.
 */
export type ListingPart = {
  category: Category;
  sellBy: 'weight' | 'case';

  /** Per-kg price. For a case listing, derived from the case price. */
  pricePerKg: number;
  /** Total available, in kg. For a case listing, cases × units × unit weight. */
  lotKg: number;
  /** The unit the seller typed in; both are always displayed. */
  enteredUnit: 'kg' | 'lb';

  pricePerCase?: number;
  unitsPerCase?: number;
  /** Net weight of one unit in the case, in kg. */
  unitKg?: number;
  casesAvailable?: number;

  /** Smallest order: kg for a weight listing, cases for a case listing. 0 = none. */
  minOrder: number;

  /** Kitchens it is for. Empty means it was not tagged. */
  cuisines: Cuisine[];

  /** Already in a US warehouse (duty paid), or shipped from overseas. */
  shipsFrom: 'us' | Origin;
  leadDays?: number;

  fdaRegistered: boolean;
  englishLabel: boolean;
  allergens: Allergen[];

  shippingIncluded: boolean;
  /** Switched off: no icon, no messaging. */
  active: boolean;
};

/** Everything is a post. A post that is selling carries a listing. */
export type Post = {
  id: string;
  userId: string;
  photos: string[];
  caption: string;
  listing?: ListingPart;
  createdAt: number;
};

export type Thread = {
  id: string;
  participants: string[];
  /** The post the conversation was started from — sent once, at the start. */
  postId?: string;
  createdAt: number;
  lastAt: number;
};

export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  text?: string;
  /** The product card, attached once when the conversation begins. */
  postId?: string;
  createdAt: number;
};

/** Just a flag: the price was not what was listed. */
export type Report = {
  id: string;
  postId: string;
  reporterId: string;
  sellerId: string;
  createdAt: number;
};
