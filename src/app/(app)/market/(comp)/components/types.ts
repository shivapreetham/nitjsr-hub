import { Product } from "@/shared/types/products";

export interface MarketplaceFilters {
  category: string;
  minPrice: string;
  maxPrice: string;
}

export interface MarketplaceState {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchText: string;
  filters: MarketplaceFilters;
  isFilterOpen: boolean;
}

export interface ProductCardProps {
  product: Product;
  onInterest?: (productId: string) => void;
  isInterested?: boolean;
}

export interface ProductFiltersProps {
  filters: MarketplaceFilters;
  onFilterChange: (filters: Partial<MarketplaceFilters>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onProductClick?: (product: Product) => void;
}

export interface MarketplaceHeaderProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  onListProduct: () => void;
}

export interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onListProduct: () => void;
}

export interface LoadingStateProps {
  message?: string;
} 