// app/market/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Product } from "@/shared/types/products";
import { PRODUCT_CATEGORIES } from "@/shared/types/products";
import { filterProducts } from "./utils/marketplaceHelpers";
import useMarketplaceData from "./hooks/useMarketplaceData";
import MarketplaceHeader from "./ui/MarketplaceHeader";
import ProductFilters from "./ui/ProductFilters";
import ProductGrid from "./ui/ProductGrid";
import EmptyState from "./ui/EmptyState";
import LoadingState from "./ui/LoadingState";
import { Button } from "@/components/ui/button";
import { MarketplaceFilters } from "./types";

// This component uses searchParams, so it needs to be wrapped in Suspense
export default function SearchParamsWrapper() {
  const {
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
  } = useMarketplaceData();

  // Memoize filtered products to prevent unnecessary re-renders
  const filteredProducts = useMemo(() => {
    return filterProducts(products, searchText, filters);
  }, [products, searchText, filters]);

  const handleFilterChange = useCallback((newFilters: Partial<MarketplaceFilters>) => {
    if (newFilters.category !== undefined) {
      handleCategoryChange(newFilters.category);
    }
    if (newFilters.minPrice !== undefined) {
      handlePriceChange("minPrice", newFilters.minPrice);
    }
    if (newFilters.maxPrice !== undefined) {
      handlePriceChange("maxPrice", newFilters.maxPrice);
    }
  }, [handleCategoryChange, handlePriceChange]);

  const handleListProduct = useCallback(() => {
    window.location.href = "/market/new";
  }, []);

  const handleClearFiltersAndSearch = useCallback(() => {
    clearAllFilters();
    setSearchText("");
  }, [clearAllFilters, setSearchText]);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card p-8 text-center rounded-lg shadow-sm border">
            <h3 className="text-xl font-medium text-destructive mb-2">Error Loading Products</h3>
            <p className="text-destructive">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <MarketplaceHeader
          searchText={searchText}
          onSearchChange={setSearchText}
          onListProduct={handleListProduct}
        />
        
        {/* Filters */}
        <div className="mb-6">
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearAllFilters}
            hasActiveFilters={hasActiveFilters}
            isOpen={isFilterOpen}
            onOpenChange={setIsFilterOpen}
          />
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.category && filters.category !== "all" && (
              <div 
                className="px-3 py-1 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer text-sm"
                onClick={() => handleCategoryChange("all")}
              >
                {filters.category} ×
              </div>
            )}
            {filters.minPrice && (
              <div 
                className="px-3 py-1 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer text-sm"
                onClick={() => handlePriceChange("minPrice", "")}
              >
                Min: ₹{filters.minPrice} ×
              </div>
            )}
            {filters.maxPrice && (
              <div 
                className="px-3 py-1 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer text-sm"
                onClick={() => handlePriceChange("maxPrice", "")}
              >
                Max: ₹{filters.maxPrice} ×
              </div>
            )}
          </div>
        )}

        {/* Products display */}
        {loading ? (
          <LoadingState />
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <EmptyState
                hasFilters={hasActiveFilters || searchText.length > 0}
                onClearFilters={handleClearFiltersAndSearch}
                onListProduct={handleListProduct}
              />
            ) : (
              <ProductGrid products={filteredProducts} loading={loading} />
            )}
          </>
        )}
      </div>
    </div>
  );
}