import { Product } from "@/types/products";
import { ProductStatus } from "@prisma/client";

export interface ProductDetailState {
  product: Product | null;
  loading: boolean;
  error: string | null;
  isInterested: boolean;
  interestLoading: boolean;
  statusLoading: boolean;
  chatLoading: boolean;
}

export interface ProductImageCarouselProps {
  images: string[];
  title: string;
}

export interface ProductInfoProps {
  product: Product;
}

export interface SellerInfoProps {
  seller: Product['seller'];
  createdAt: Date;
  mobileNumber?: string;
  hostel?: string;
}

export interface ProductActionsProps {
  product: Product;
  isOwner: boolean;
  isInterested: boolean;
  onInterestToggle: () => void;
  onStatusUpdate: (status: ProductStatus) => void;
  onChatWithSeller: () => void;
  loading: {
    interest: boolean;
    status: boolean;
    chat: boolean;
  };
}

export interface ProductStatusProps {
  status: ProductStatus;
  onStatusUpdate: (status: ProductStatus) => void;
  loading: boolean;
  isOwner: boolean;
}

export interface InterestedUsersProps {
  users: Product['interestedUsers'];
} 