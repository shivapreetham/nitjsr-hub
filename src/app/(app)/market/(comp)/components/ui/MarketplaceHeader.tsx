import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MarketplaceHeaderProps } from "../types";

export default function MarketplaceHeader({
  searchText,
  onSearchChange,
  onListProduct,
}: MarketplaceHeaderProps) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-foreground">Campus Marketplace</h1>
          <Button 
            onClick={onListProduct}
            className="transition-all shadow-md hover:shadow-lg rounded-xl"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            List Item
          </Button>
        </div>
        
        {/* Search bar */}
        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              className="pl-10 bg-background border-border focus:border-primary rounded-xl" 
              placeholder="Search products..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 