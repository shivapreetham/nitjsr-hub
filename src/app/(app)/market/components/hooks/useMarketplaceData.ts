import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Product } from "@/types/products";
import { MarketplaceFilters } from "../types";

export default function useMarketplaceData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get filters from URL params
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  // Memoize filters to prevent recreation on every render
  const filters: MarketplaceFilters = useMemo(() => ({
    category,
    minPrice,
    maxPrice,
  }), [category, minPrice, maxPrice]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query string
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        
        const response = await fetch(`/api/products?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, minPrice, maxPrice]);

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    router.push(`/market?${params.toString()}`);
  };

  const handlePriceChange = (field: "minPrice" | "maxPrice", value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(field, value);
    } else {
      params.delete(field);
    }
    router.push(`/market?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/market");
  };

  const hasActiveFilters = Boolean(category || minPrice || maxPrice);

  return {
    products,
    loading,
    error,
    searchText,
    setSearchText,
    filters,
    isFilterOpen,
    setIsFilterOpen,
    handleCategoryChange,
    handlePriceChange,
    clearAllFilters,
    hasActiveFilters,
  };
} 