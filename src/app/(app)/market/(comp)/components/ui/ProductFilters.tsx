import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PRODUCT_CATEGORIES } from "@/shared/types/products";
import { ProductFiltersProps } from "../types";
import { cn } from "@/lib/utils";

export default function ProductFilters({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  isOpen,
  onOpenChange,
}: ProductFiltersProps) {
  return (
    <div className="flex gap-2">
      <Popover open={isOpen} onOpenChange={onOpenChange}>
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
                  onClick={onClearFilters}
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">Category</label>
              <Select 
                value={filters.category || "all"} 
                onValueChange={(value) => onFilterChange({ category: value })}
              >
                <SelectTrigger className="bg-white border-blue-100 rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md border-blue-100 rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {PRODUCT_CATEGORIES.map((cat) => (
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
                  value={filters.minPrice || ""}
                  onChange={(e) => onFilterChange({ minPrice: e.target.value })}
                />
                <span className="text-blue-400">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="bg-white border-blue-100 rounded-xl"
                  value={filters.maxPrice || ""}
                  onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 