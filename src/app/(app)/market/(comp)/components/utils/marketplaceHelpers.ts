import { Product } from "@/shared/types/products";
import { MarketplaceFilters } from "../types";

export const filterProducts = (
  products: Product[],
  searchText: string,
  filters: MarketplaceFilters
): Product[] => {
  return products.filter((product) => {
    // Search filter
    const matchesSearch = searchText
      ? product.title.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase()) ||
        product.category.toLowerCase().includes(searchText.toLowerCase())
      : true;

    // Category filter
    const matchesCategory = filters.category && filters.category !== "all"
      ? product.category === filters.category
      : true;

    // Price filters
    const matchesMinPrice = filters.minPrice
      ? product.price >= parseFloat(filters.minPrice)
      : true;

    const matchesMaxPrice = filters.maxPrice
      ? product.price <= parseFloat(filters.maxPrice)
      : true;

    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });
};

export const sortProducts = (
  products: Product[],
  sortBy: "newest" | "oldest" | "price-low" | "price-high" | "name"
): Product[] => {
  const sorted = [...products];

  switch (sortBy) {
    case "newest":
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "oldest":
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "name":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
};

export const hasActiveFilters = (filters: MarketplaceFilters): boolean => {
  return Boolean(
    (filters.category && filters.category !== "all") ||
    filters.minPrice ||
    filters.maxPrice
  );
};

export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString()}`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-500 text-white";
    case "RESERVED":
      return "bg-yellow-500 text-white";
    case "SOLD":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "RESERVED":
      return "Reserved";
    case "SOLD":
      return "Sold";
    default:
      return "Unknown";
  }
}; 