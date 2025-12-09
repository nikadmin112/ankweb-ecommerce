export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  badge?: string | null;
  image?: string | null;
  category?: string | null;
  fullDescription?: string | null;
  features?: string[] | null;
  tags?: string[] | null;
  variants?: ProductVariant[] | null;
  images?: string[] | null;
  rating?: number | null;
  reviewCount?: number | null;
  discount?: number | null;
};

export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified?: boolean;
};
