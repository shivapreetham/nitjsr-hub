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
import { cn } from "@/app/lib/utils";

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
              "border-border bg-background hover:bg-muted text-foreground rounded-xl",
              hasActiveFilters && "border-primary bg-primary/10"
            )}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-2 bg-primary rounded-xl">Active</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 border-border bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Filters</h3>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-primary hover:text-primary/80 rounded-xl"
                  onClick={onClearFilters}
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select 
                value={filters.category || "all"} 
                onValueChange={(value) => onFilterChange({ category: value })}
              >
                <SelectTrigger className="bg-background border-border rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-border rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="bg-background border-border rounded-xl"
                  value={filters.minPrice || ""}
                  onChange={(e) => onFilterChange({ minPrice: e.target.value })}
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="bg-background border-border rounded-xl"
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