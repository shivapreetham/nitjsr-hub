// types/product.ts
import { ProductStatus } from "@prisma/client";
import { User } from "@prisma/client";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  status: ProductStatus;
  category: string;
  condition?: string;
  hostel?: string;
  mainImage: string;
  images: string[];
  paymentQR?: string;
  createdAt: Date;
  updatedAt: Date;
  sellerId: string;
  seller?: User;
  interestedUserIds: string[];
  interestedUsers?: User[];
}

export interface ProductFormValues {
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string;
  hostel?: string;
  mainImage: string;
  images: string[];
  paymentQR?: string;
}

export const PRODUCT_CATEGORIES = [
  "Books",
  "Electronics",
  "Furniture",
  "Clothing",
  "Sports Equipment",
  "Kitchen Items",
  "Other"
];

export const PRODUCT_CONDITIONS = [
  "Brand New",
  "Like New",
  "Good",
  "Fair",
  "Needs Repair"
];