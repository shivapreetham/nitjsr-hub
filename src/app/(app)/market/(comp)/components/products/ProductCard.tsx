// components/products/ProductCard.tsx
import { Product } from "@/shared/types/products";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, getStatusColor, getStatusText } from "../utils/marketplaceHelpers";

interface ProductCardProps {
  product: Product;
  onInterest?: (productId: string) => void;
  isInterested?: boolean;
}

export const ProductCard = ({ product, onInterest, isInterested }: ProductCardProps) => {
  return (
    <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 bg-white/80 backdrop-blur-sm">
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={product.mainImage}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`${getStatusColor(product.status)} text-xs font-medium`}>
            {getStatusText(product.status)}
          </Badge>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs">
            {product.category}
          </Badge>
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <Button size="sm" variant="secondary" className="rounded-full">
              <Eye className="h-4 w-4" />
            </Button>
            {onInterest && (
              <Button 
                size="sm" 
                variant={isInterested ? "default" : "secondary"}
                className="rounded-full"
                onClick={(e) => {
                  e.preventDefault();
                  onInterest(product.id);
                }}
              >
                <Heart className={`h-4 w-4 ${isInterested ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
            {product.title}
          </h3>
          <p className="font-bold text-lg text-blue-600 ml-2">
            {formatPrice(product.price)}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pb-2">
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{product.hostel || "Campus"}</span>
          <span>{formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {product.interestedUserIds.length > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-500" />
                {product.interestedUserIds.length} interested
              </span>
            )}
          </div>
          
          <Link href={`/market/${product.id}`} className="flex-1 ml-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};