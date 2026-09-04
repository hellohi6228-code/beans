export type SupplierType = 'farmer' | 'bulk' | 'online_retail' | 'coffee_shop';

/**
 * Whether an account also sells. Everyone buys — a farmer can buy from another
 * farmer, a coffee shop from a bulk seller — so `supplier` only means "this
 * account can publish listings too".
 */
export type Role = 'customer' | 'supplier';

export const SUPPLIER_LABEL: Record<SupplierType, string> = {
  farmer: 'Farmer',
  bulk: 'Bulk seller',
  online_retail: 'Online retail',
  coffee_shop: 'Coffee shop',
};

export const SUPPLIER_BLURB: Record<SupplierType, string> = {
  farmer: 'Grows and mills its own coffee',
  bulk: 'Sells full bags and pallets',
  online_retail: 'Ships roasted retail bags',
  coffee_shop: 'Bricks-and-mortar shop selling beans',
};

export type User = {
  id: string;
  role: Role;
  /** Business name for suppliers, display name for customers. */
  name: string;
  handle: string;
  supplierType?: SupplierType;
  avatar?: string;
  cover?: string;
  bio: string;
  location: string;
  website?: string;
  joinedAt: number;
};

export type Post = {
  id: string;
  userId: string;
  photos: string[];
  caption: string;
  kind: 'merchandise' | 'event' | 'update';
  /**
   * Something they sell, or an event they host — the post carries a chat button
   * so anyone looking at it can ask about it directly.
   */
  contactable: boolean;
  createdAt: number;
};

export type Listing = {
  id: string;
  supplierId: string;
  title: string;
  /** 1-3 photos, taken with the camera or picked from the library. */
  photos: string[];
  pricePerKg: number;
  lotKg: number;
  /** The unit the supplier typed the numbers in; both are always displayed. */
  enteredUnit: 'kg' | 'lb';
  shippingIncluded: boolean;
  origin: string;
  process: string;
  roast: string;
  description: string;
  createdAt: number;
  active: boolean;
};

export type OrderStatus = 'inquiry' | 'agreed' | 'completed' | 'cancelled';

export type Order = {
  id: string;
  listingId: string;
  customerId: string;
  supplierId: string;
  /** Quantity the customer asked for, stored in kg. */
  qtyKg: number;
  /** Price locked from the listing at the moment the order was opened. */
  lockedPricePerKg: number;
  lockedTotal: number;
  shippingIncluded: boolean;
  status: OrderStatus;
  createdAt: number;
  reviewed: boolean;
};

export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  text?: string;
  /** An order card pinned into the conversation. */
  orderId?: string;
  /** A post the conversation was started from. */
  postId?: string;
  system?: boolean;
  createdAt: number;
};

/**
 * A direct message thread between any two accounts. Anyone can buy from anyone,
 * so a thread is not buyer-and-seller — it is just two people.
 */
export type Thread = {
  id: string;
  participants: string[];
  createdAt: number;
  lastAt: number;
};

export type Review = {
  id: string;
  orderId: string;
  listingId: string;
  supplierId: string;
  customerId: string;
  rating: number;
  text: string;
  photos: string[];
  createdAt: number;
};

export type Report = {
  id: string;
  listingId: string;
  orderId?: string;
  reporterId: string;
  supplierId: string;
  listedTotal: number;
  askedTotal: number;
  reason: string;
  details: string;
  photos: string[];
  status: 'under_review' | 'upheld' | 'dismissed';
  createdAt: number;
};
