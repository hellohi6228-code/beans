export type SupplierType = 'farmer' | 'bulk' | 'online_retail' | 'coffee_shop';

/**
 * Everyone starts as a customer. Tapping "I am also a supplier" flips this,
 * which is the only thing that unlocks listing beans.
 */
export type Role = 'customer' | 'supplier';

export const SUPPLIER_LABEL: Record<SupplierType, string> = {
  farmer: 'Farmer',
  bulk: 'Bulk seller',
  online_retail: 'Online retail',
  coffee_shop: 'Coffee shop',
};

/**
 * One account, tied to the App Store / Play account on the device. There is no
 * sign up and no sign out — the app opens straight into it.
 */
export type User = {
  id: string;
  role: Role;
  name: string;
  /** Free text under the business name. */
  bio: string;
  supplierType?: SupplierType;
  /** A real photo the user took or picked. */
  avatar?: string;
  createdAt: number;
};

export type Post = {
  id: string;
  userId: string;
  photos: string[];
  caption: string;
  /** Something they sell or an event they host — the photo gets a chat button. */
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
