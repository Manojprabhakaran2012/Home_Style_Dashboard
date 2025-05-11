// Add additional types here that aren't covered by schema.ts

export type AddressType = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
};

export type PaymentMethodType = "cod" | "card" | "upi";

export type OrderStatusType = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type FilterOptionsType = {
  inStock?: boolean;
  isSale?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number | null;
};

export type SortOptionType = "featured" | "price_low" | "price_high" | "newest" | "rating";

export type BreadcrumbItemType = {
  label: string;
  href: string;
};

export type ReviewFormType = {
  rating: number;
  comment: string;
};

export type ContactFormType = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export type ProfileUpdateType = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
};
