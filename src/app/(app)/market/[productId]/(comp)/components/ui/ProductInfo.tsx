import { Badge } from "@/components/ui/badge";
import { ProductInfoProps } from "../types";

export default function ProductInfo({ product }: ProductInfoProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-500/20 text-green-500";
      case "RESERVED": return "bg-amber-500/20 text-amber-500";
      case "SOLD": return "bg-red-500/20 text-red-500";
      default: return "bg-slate-500/20 text-slate-500";
    }
  };

  return (
    <div>
      {/* Status Badges */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusVariant(product.status)}`}>
          {product.status === "AVAILABLE" 
            ? "Available" 
            : product.status === "RESERVED" 
              ? "Reserved" 
              : "Sold"}
        </span>
        <Badge variant="outline" className="rounded-full px-3 py-1 bg-white/5 border-white/10">
          {product.category}
        </Badge>
        {product.condition && (
          <Badge variant="outline" className="rounded-full px-3 py-1 bg-white/5 border-white/10">
            {product.condition}
          </Badge>
        )}
      </div>

      {/* Product Details */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
        <p className="text-3xl font-bold text-primary mb-6">₹{product.price.toLocaleString()}</p>
        
        <div>
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">DESCRIPTION</h3>
          <p className="whitespace-pre-line text-base">{product.description}</p>
        </div>
      </div>
    </div>
  );
} 