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
  enteredUnit: 'kg' | 'lb';
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
