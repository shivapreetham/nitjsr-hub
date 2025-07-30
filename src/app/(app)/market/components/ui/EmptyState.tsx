import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyStateProps } from "../types";

export default function EmptyState({ hasFilters, onClearFilters, onListProduct }: EmptyStateProps) {
  return (
    <div className="glass-card p-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-blue-50 p-3">
          <Search className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-medium text-blue-900">No products found</h3>
        <p className="text-blue-600 max-w-md">
          We couldn't find any products matching your current filters.
        </p>
        <div className="flex gap-3 mt-2">
          {hasFilters && (
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
            >
              Clear filters
            </Button>
          )}
          <Button 
            onClick={onListProduct}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            List something for sale
          </Button>
        </div>
      </div>
    </div>
  );
} 