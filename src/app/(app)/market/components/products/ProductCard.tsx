// components/products/ProductCard.tsx
import { Product } from "@/types/products";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link href={`/market/${product.id}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={product.mainImage}
            alt={product.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={
              product.status === "AVAILABLE" 
                ? "default" 
                : product.status === "RESERVED" 
                  ? "secondary" 
                  : "destructive"
            }>
              {product.status === "AVAILABLE" 
                ? "Available" 
                : product.status === "RESERVED" 
                  ? "Reserved" 
                  : "Sold"}
            </Badge>
          </div>
        </div>
        <CardHeader className="p-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold truncate">{product.title}</h3>
            <p className="font-bold">₹{product.price}</p>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-sm text-muted-foreground truncate">{product.category}</p>
          <p className="text-xs text-muted-foreground">
            {product.hostel ? `${product.hostel}` : ""}
          </p>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
          </p>
          <p className="text-xs">
            {product.interestedUserIds.length > 0 && 
              `${product.interestedUserIds.length} interested`}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};