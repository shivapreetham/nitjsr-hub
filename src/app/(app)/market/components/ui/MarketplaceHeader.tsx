import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarketplaceHeaderProps } from "../types";

export default function MarketplaceHeader({
  searchText,
  onSearchChange,
  onListProduct,
}: MarketplaceHeaderProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-blue-900">Campus Marketplace</h1>
        <Button 
          onClick={onListProduct}
          className="bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg rounded-xl"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          List Item
        </Button>
      </div>
      
      {/* Search bar */}
      <div className="mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
          <Input 
            className="pl-10 bg-white/80 border-blue-100 focus:border-blue-300 rounded-xl" 
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
} 