"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useProductDetail from "./components/hooks/useProductDetail";
import ProductImageCarousel from "./components/ui/ProductImageCarousel";
import ProductInfo from "./components/ui/ProductInfo";
import SellerInfo from "./components/ui/SellerInfo";
import ProductActions from "./components/ui/ProductActions";

export default function ProductDetailPage() {
  const router = useRouter();
  const {
    product,
    loading,
    error,
    isInterested,
    isOwner,
    toggleInterest,
    updateStatus,
    chatWithSeller,
    interestLoading,
    statusLoading,
    chatLoading,
  } = useProductDetail();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || "This product may have been removed or is no longer available."}
          </p>
          <Link href="/market">
            <Button variant="default" size="lg" className="rounded-full px-8">
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [product.mainImage, ...product.images];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-8 rounded-full hover:bg-white/10 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* Left column - Images and Info */}
            <div className="lg:col-span-3 p-6">
              <ProductImageCarousel images={allImages} title={product.title} />
              
              <ProductInfo product={product} />
              
              {/* Show interested users to owner */}
              {isOwner && product.interestedUsers && product.interestedUsers.length > 0 && (
                <div className="p-4 bg-white/5 rounded-2xl">
                  <h3 className="font-medium mb-3 text-sm">Interested Users ({product.interestedUsers.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.interestedUsers.map((user) => (
                      <div key={user.id} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        {user.username}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Details and Actions */}
            <div className="lg:col-span-2 p-6 border-t lg:border-t-0 lg:border-l border-white/10 bg-white/2">
              <SellerInfo 
                seller={product.seller}
                createdAt={product.createdAt}
                mobileNumber={product.seller?.mobileNumber || undefined}
                hostel={product.hostel}
              />
              
              {product.paymentQR && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">PAYMENT QR</h3>
                  <div className="relative aspect-square w-40 h-40 overflow-hidden rounded-2xl border border-white/10 bg-white p-2 shadow-lg hover:scale-105 transition-transform duration-300">
                    <Image
                      src={product.paymentQR}
                      alt="Payment QR"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              
              <ProductActions
                product={product}
                isOwner={isOwner}
                isInterested={isInterested}
                onInterestToggle={toggleInterest}
                onStatusUpdate={updateStatus}
                onChatWithSeller={chatWithSeller}
                loading={{
                  interest: interestLoading,
                  status: statusLoading,
                  chat: chatLoading,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}