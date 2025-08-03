// app/market/my-products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/shared/types/products";
import { ProductCard } from "@/app/(app)/market/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }

    const fetchUserProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products?sellerId=${session?.user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchUserProducts();
    }
  }, [session, router, status]);

  // Filter products by status
  const availableProducts = products.filter(product => product.status === "AVAILABLE");
  const reservedProducts = products.filter(product => product.status === "RESERVED");
  const soldProducts = products.filter(product => product.status === "SOLD");

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link href="/market/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            List New Item
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({products.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableProducts.length})</TabsTrigger>
          <TabsTrigger value="reserved">Reserved ({reservedProducts.length})</TabsTrigger>
          <TabsTrigger value="sold">Sold ({soldProducts.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You haven mot listed any products yet</p>
              <Link href="/market/new">
                <Button variant="link">List something?</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="mt-4">
          {availableProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No available products</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reserved" className="mt-4">
          {reservedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No reserved products</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {reservedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="sold" className="mt-4">
          {soldProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sold products</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {soldProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}