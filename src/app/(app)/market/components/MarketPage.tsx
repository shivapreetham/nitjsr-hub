// app/market/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Product, PRODUCT_CATEGORIES } from "@/types/products";
import { ProductCard } from "@/app/(app)/market/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusCircle, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useSearchParams } from 'next/navigation';

// This component uses searchParams, so it needs to be wrapped in Suspense
export default function SearchParamsWrapper() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  
  // Import useSearchParams inside the component that's wrapped in Suspense
  const searchParams = useSearchParams();

  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      // Build query string
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      
      try {
        const response = await fetch(`/api/products?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container py-8">
        {/* Header with glass effect */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold text-blue-900">Campus Marketplace</h1>
            <Link href="/market/new">
              <Button className="bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg rounded-xl">
                <PlusCircle className="mr-2 h-4 w-4" />
                List Item
              </Button>
            </Link>
          </div>
          
          {/* Modern search and filter bar */}
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
              <Input 
                className="pl-10 bg-white/80 border-blue-100 focus:border-blue-300 rounded-xl" 
                placeholder="Search products..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "border-blue-100 bg-white/80 hover:bg-blue-50 text-blue-800 rounded-xl",
                      hasActiveFilters && "border-blue-400 bg-blue-50/80"
                    )}
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge className="ml-2 bg-blue-500 rounded-xl">Active</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 border-blue-100 bg-white/95 backdrop-blur-md shadow-xl rounded-xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-blue-900">Filters</h3>
                      {hasActiveFilters && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-blue-600 hover:text-blue-800 rounded-xl"
                          onClick={clearAllFilters}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Clear all
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-900">Category</label>
                      <Select 
                        value={category || "all"} 
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger className="bg-white border-blue-100 rounded-xl">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-md border-blue-100 rounded-xl">
                          <SelectItem value="all">All Categories</SelectItem>
                          {PRODUCT_CATEGORIES.map((cat: any) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-blue-900">Price Range (₹)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          className="bg-white border-blue-100 rounded-xl"
                          value={minPrice || ""}
                          onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                        />
                        <span className="text-blue-400">to</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          className="bg-white border-blue-100 rounded-xl"
                          value={maxPrice || ""}
                          onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {category && (
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-xl"
                >
                  {category}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => handleCategoryChange("all")}
                  />
                </Badge>
              )}
              {minPrice && (
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-xl"
                >
                  Min: ₹{minPrice}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => handlePriceChange("minPrice", "")}
                  />
                </Badge>
              )}
              {maxPrice && (
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-xl"
                >
                  Max: ₹{maxPrice}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => handlePriceChange("maxPrice", "")}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Products display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 glass-card">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="mt-4 text-blue-600">Loading products...</p>
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-blue-50 p-3">
                    <Search className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-medium text-blue-900">No products found</h3>
                  <p className="text-blue-600 max-w-md">We couldnt find any products matching your current filters.</p>
                  <div className="flex gap-3 mt-2">
                    {hasActiveFilters && (
                      <Button 
                        variant="outline" 
                        onClick={clearAllFilters}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
                      >
                        Clear filters
                      </Button>
                    )}
                    <Link href="/market/new">
                      <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                        List something for sale
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="hover-lift">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}