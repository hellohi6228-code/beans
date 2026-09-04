export type SupplierType = 'farmer' | 'bulk' | 'online_retail' | 'coffee_shop';

export type Role = 'customer' | 'supplier';

export const SUPPLIER_LABEL: Record<SupplierType, string> = {
  farmer: 'Farmer',
  bulk: 'Bulk seller',
  online_retail: 'Online retail',
  coffee_shop: 'Coffee shop',
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

/** The price and amount on a post that is selling something. */
export type ListingPart = {
  pricePerKg: number;
  lotKg: number;
  /** The unit it was typed in; both are always displayed. */
  enteredUnit: 'kg' | 'lb';
  shippingIncluded: boolean;
  /** The seller can switch a listing off without deleting the post. */
  active: boolean;
};

/**
 * Everything is a post. A post that is selling carries a listing and shows an
 * icon in the top-left corner.
 */
export type Post = {
  id: string;
  userId: string;
  photos: string[];
  caption: string;
  listing?: ListingPart;
  createdAt: number;
};

export type Order = {
  id: string;
  postId: string;
  customerId: string;
  supplierId: string;
  qtyKg: number;
  lockedPricePerKg: number;
  lockedTotal: number;
  shippingIncluded: boolean;
  createdAt: number;
  reviewed: boolean;
};

export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  text?: string;
  orderId?: string;
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
  postId: string;
  supplierId: string;
  customerId: string;
  rating: number;
  text: string;
  photos: string[];
  createdAt: number;
};

export type Report = {
  id: string;
  postId: string;
  orderId?: string;
  reporterId: string;
  supplierId: string;
  listedTotal: number;
  askedTotal: number;
  reason: string;
  details: string;
  photos: string[];
  createdAt: number;
};
