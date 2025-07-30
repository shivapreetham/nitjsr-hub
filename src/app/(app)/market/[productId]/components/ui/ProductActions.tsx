import { Button } from "@/components/ui/button";
import { Loader2, Heart, Check, MessageCircle, Edit } from "lucide-react";
import { ProductStatus } from "@prisma/client";
import { ProductActionsProps } from "../types";
import Link from "next/link";

export default function ProductActions({
  product,
  isOwner,
  isInterested,
  onInterestToggle,
  onStatusUpdate,
  onChatWithSeller,
  loading,
}: ProductActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      {isOwner ? (
        // Owner actions
        <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-2xl">
          <h3 className="w-full text-sm font-medium mb-3 text-muted-foreground">Product Controls</h3>
          
          <Link href={`/market/${product.id}/edit`}>
            <Button variant="outline" size="sm" className="rounded-full bg-white/5 border-white/10 hover:bg-white/10">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          
          {product.status !== "AVAILABLE" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusUpdate("AVAILABLE")}
              disabled={loading.status}
              className="rounded-full bg-white/5 border-white/10 hover:bg-white/10"
            >
              {loading.status ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Mark as Available
            </Button>
          )}
          
          {product.status !== "RESERVED" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusUpdate("RESERVED")}
              disabled={loading.status}
              className="rounded-full bg-white/5 border-white/10 hover:bg-white/10"
            >
              {loading.status ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Mark as Reserved
            </Button>
          )}
          
          {product.status !== "SOLD" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusUpdate("SOLD")}
              disabled={loading.status}
              className="rounded-full bg-white/5 border-white/10 hover:bg-white/10"
            >
              {loading.status ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Mark as Sold
            </Button>
          )}
        </div>
      ) : (
        // Buyer actions
        <>
          {/* Interest button (only for available products) */}
          {product.status === "AVAILABLE" && (
            <Button
              variant={isInterested ? "default" : "outline"}
              className="w-full rounded-xl h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={onInterestToggle}
              disabled={loading.interest}
            >
              {loading.interest ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isInterested ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Interested
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-5 w-5" />
                      I am Interested
                    </>
                  )}
                </>
              )}
            </Button>
          )}
          
          {/* Chat with seller button */}
          <Button
            variant="secondary"
            className="w-full rounded-xl bg-blue-400 h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300 mb-10"
            onClick={onChatWithSeller}
            disabled={loading.chat}
          >
            {loading.chat ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat with Seller
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
} 