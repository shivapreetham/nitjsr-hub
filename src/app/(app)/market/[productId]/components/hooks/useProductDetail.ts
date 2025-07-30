import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Product } from "@/types/products";
import { ProductStatus } from "@prisma/client";

export default function useProductDetail() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interestLoading, setInterestLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const productId = params.productId as string;
  const userId = session?.user?.id;
  
  // Use ref to track if we've already fetched this product
  const fetchedProductId = useRef<string | null>(null);

  // Fetch product data only once when component mounts or productId changes
  useEffect(() => {
    if (!productId || status === "loading" || fetchedProductId.current === productId) {
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      fetchedProductId.current = productId;
      
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          setError("Product not found");
        }
      } catch (error) {
        setError("Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, status]);

  // Computed values using useMemo to prevent recalculation
  const isInterested = useMemo(() => {
    if (!product || !userId) return false;
    return product.interestedUserIds.includes(userId);
  }, [product?.interestedUserIds, userId]);

  const isOwner = useMemo(() => {
    if (!product || !userId) return false;
    return userId === product.sellerId;
  }, [userId, product?.sellerId]);

  // Stable callback functions
  const toggleInterest = useCallback(async () => {
    if (!session || !productId) {
      router.push("/login");
      return;
    }

    setInterestLoading(true);
    
    try {
      const response = await fetch(`/api/products/${productId}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      }
    } catch (error) {
      console.error("Failed to toggle interest:", error);
    } finally {
      setInterestLoading(false);
    }
  }, [productId, session, router]);

  const updateStatus = useCallback(async (newStatus: ProductStatus) => {
    if (!session || !productId || !isOwner) return;

    setStatusLoading(true);
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setStatusLoading(false);
    }
  }, [productId, session, isOwner]);

  const chatWithSeller = useCallback(async () => {
    if (!session || !product) {
      router.push("/login");
      return;
    }
    
    if (isOwner) return;
    
    setChatLoading(true);
    
    try {
      const response = await fetch("/api/chat/conversations/find-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: product.sellerId,
          productTitle: product.title,
        }),
      });

      if (response.ok) {
        const { conversationId } = await response.json();
        router.push(`/conversations/${conversationId}`);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setChatLoading(false);
    }
  }, [session, product, router, isOwner]);

  return {
    product,
    loading,
    error,
    isInterested,
    isOwner,
    interestLoading,
    statusLoading,
    chatLoading,
    toggleInterest,
    updateStatus,
    chatWithSeller,
  };
} 