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

export const SUPPLIER_LABEL: Record<SupplierType, string> = {
  farmer: 'Farm / grower 种植基地',
  manufacturer: 'Manufacturer 生产厂家',
  importer: 'Importer / distributor 进口经销',
  bulk: 'Bulk seller 批发商',
  online_retail: 'Online retail 网店',
  coffee_shop: 'Shop / café 门店',
};

/** What a listing is. Ordered roughly by how restaurants and shops buy. */
export type Category = 'coffee' | 'tea' | 'snacks' | 'sauces' | 'noodles' | 'frozen' | 'pantry';

export const CATEGORIES: Category[] = ['coffee', 'tea', 'snacks', 'sauces', 'noodles', 'frozen', 'pantry'];

export const CATEGORY_LABEL: Record<Category, string> = {
  coffee: 'Coffee 咖啡',
  tea: 'Tea & boba 茶饮奶茶',
  snacks: 'Snacks 零食',
  sauces: 'Sauces & spices 调味品',
  noodles: 'Noodles & rice 米面',
  frozen: 'Frozen 速冻',
  pantry: 'Pantry 粮油干货',
};

/** The nine major food allergens US labels must declare (sesame since 2023). */
export const ALLERGENS = ['milk', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 'wheat', 'soy', 'sesame'] as const;
export type Allergen = (typeof ALLERGENS)[number];

export const ALLERGEN_LABEL: Record<Allergen, string> = {
  milk: 'Milk',
  eggs: 'Eggs',
  fish: 'Fish',
  shellfish: 'Shellfish',
  tree_nuts: 'Tree nuts',
  peanuts: 'Peanuts',
  wheat: 'Wheat',
  soy: 'Soy',
  sesame: 'Sesame',
};

/** The same allergens as Chinese labels write them. */
export const ALLERGEN_ZH: Record<Allergen, string> = {
  milk: '乳',
  eggs: '蛋',
  fish: '鱼',
  shellfish: '甲壳类',
  tree_nuts: '坚果',
  peanuts: '花生',
  wheat: '小麦',
  soy: '大豆',
  sesame: '芝麻',
};

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

  /** Already in a US warehouse (duty paid), or shipped from China. */
  shipsFrom: 'us' | 'china';
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
