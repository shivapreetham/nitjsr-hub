// app/market/[productId]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, Product } from "@/shared/types/products";
import { Button } from "@/components/ui/button";
import {formSchema} from "@/shared/schemas/productFormSchema"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/app/hooks/use-toast";
import { ArrowLeft, Loader2, Upload, Image as ImageIcon, Tag, MapPin, LayoutGrid, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MainImageUpload, AdditionalImagesUpload, PaymentQRUpload } from "@/app/(app)/market/(comp)/components/market/imageUpload";

// Create schema for editing product
interface Field {
  onChange: (value: string[]) => void;
  value: string[];
}

export default function EditProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      category: "",
      condition: "",
      hostel: "",
      mainImage: "",
      images: [],
      paymentQR: "",
      status: "AVAILABLE",
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          form.reset({
            title: data.title,
            description: data.description,
            price: data.price,
            category: data.category,
            condition: data.condition || "",
            hostel: data.hostel || "",
            mainImage: data.mainImage,
            images: data.images || [],
            paymentQR: data.paymentQR || "",
            status: data.status,
          });
        } else {
          router.push("/market");
          toast({
            title: "Error",
            description: "Product not found",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast({
          title: "Error",
          description: "Failed to load product",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId, router, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update product");
      }
      toast({
        title: "Product updated successfully",
        description: "Your changes have been saved.",
      });
      router.push(`/market/${productId}`);
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Failed to update product",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to delete product");
      }
      toast({
        title: "Product deleted",
        description: "Your product has been removed from the marketplace.",
      });
      router.push("/market");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Failed to delete product",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p>Product not found</p>
        <Button variant="link" onClick={() => router.push("/market")}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  // Helper function to remove an image URL from a field's value.
  const handleImageRemove = (field: Field, urlToRemove: string) => {
    field.onChange(field.value.filter((url: string) => url !== urlToRemove));
  };

  return (
    <div className="bg-blue-80 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 rounded-full flex items-center gap-2 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to marketplace
        </Button>

        <Card className="overflow-hidden border-0 bg-white/60 backdrop-blur-md shadow-xl rounded-2xl">
          <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <CardContent className="p-6 sm:p-10">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-blue-800">Edit Product</h1>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteProduct}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Product Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="What are you selling?"
                          {...field}
                          className="border-0 bg-blue-50/50 focus:bg-blue-50/80 focus:ring-2 focus:ring-blue-400/30 h-14 rounded-xl shadow-sm transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                            <path d="M7 7h.01" />
                          </svg>
                          Price (₹)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ''}
                            className="border-0 bg-blue-50/50 focus:bg-blue-50/80 focus:ring-2 focus:ring-blue-400/30 h-14 rounded-xl shadow-sm transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4" />
                          Category
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-0 bg-blue-50/50 focus:bg-blue-50/80 focus:ring-2 focus:ring-blue-400/30 h-14 rounded-xl shadow-sm transition-all duration-200">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white/95 backdrop-blur-md border-0 shadow-lg rounded-xl overflow-hidden">
                            {PRODUCT_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category} className="focus:bg-blue-50">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Condition
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-0 bg-blue-50/50 focus:bg-blue-50/80 focus:ring-2 focus:ring-blue-400/30 h-14 rounded-xl shadow-sm transition-all duration-200">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white/95 backdrop-blur-md border-0 shadow-lg rounded-xl overflow-hidden">
                            {PRODUCT_CONDITIONS.map((condition) => (
                              <SelectItem key={condition} value={condition} className="focus:bg-blue-50">
                                {condition}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hostel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Hostel Location (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Where is the item located?"
                            {...field}
                            className="border-0 bg-blue-50/50 focus:bg-blue-50/80 focus:ring-2 focus:ring-blue-400/30 h-14 rounded-xl shadow-sm transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your item. Include details about its condition, usage, etc."
                          className="min-h-32 border-0 bg-blue-50/50 focus:bg-blue-50/80 focus:ring-2 focus:ring-blue-400/30 rounded-xl shadow-sm transition-all duration-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50/70 to-blue-100/70 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-sm">
                    <FormField
                      control={form.control}
                      name="mainImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Main Image
                          </FormLabel>
                          <p className="text-sm text-blue-600/80 mb-3">
                            This will be the primary image shown in search results
                          </p>
                          <FormControl>
                            <div className="bg-white/70 backdrop-blur-sm p-5 rounded-xl border border-dashed border-blue-200 transition-all hover:border-blue-400 duration-300">
                              <MainImageUpload
                                value={field.value}
                                onChange={(value: string) => field.onChange(value)}
                                onRemove={() => field.onChange("")}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-blue-50/70 to-blue-100/70 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-sm">
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Additional Images (Optional)
                          </FormLabel>
                          <p className="text-sm text-blue-600/80 mb-3">
                            Upload up to 5 additional images to showcase your product
                          </p>
                          <FormControl>
                            <div className="bg-white/70 backdrop-blur-sm p-5 rounded-xl border border-dashed border-blue-200 transition-all hover:border-blue-400 duration-300">
                              <AdditionalImagesUpload
                                value={field.value}
                                onChange={(urls: string[]) => field.onChange(urls)}
                                onRemove={(url: string) => handleImageRemove(field, url)}
                              />
                              {field.value && field.value.length > 0 && (
                                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {field.value.map((url, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-blue-100 shadow-sm transition-transform hover:scale-[1.02] duration-300">
                                      <Image
                                        src={url}
                                        alt={`Additional image ${index + 1}`}
                                        fill
                                        className="object-cover w-full h-full"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleImageRemove(field, url)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-7 h-7 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors duration-200"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-blue-50/70 to-blue-100/70 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-sm">
                    <FormField
                      control={form.control}
                      name="paymentQR"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="5" height="5" x="3" y="3" rx="1" />
                              <rect width="5" height="5" x="16" y="3" rx="1" />
                              <rect width="5" height="5" x="3" y="16" rx="1" />
                              <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                              <path d="M21 21v.01" />
                              <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                              <path d="M3 12h.01" />
                              <path d="M12 3h.01" />
                              <path d="M12 16v.01" />
                              <path d="M16 12h1" />
                              <path d="M21 12v.01" />
                              <path d="M12 21v-1" />
                            </svg>
                            Payment QR Code (Optional)
                          </FormLabel>
                          <p className="text-sm text-blue-800/80 mb-3">
                            Upload your UPI/payment QR code for easier transactions
                          </p>
                          <FormControl>
                            <div className="bg-white/70 backdrop-blur-sm p-5 rounded-xl border border-dashed border-blue-200 transition-all hover:border-blue-400 duration-300">
                              <PaymentQRUpload
                                value={field.value ?? ""}
                                onChange={(url: string) => field.onChange(url)}
                                onRemove={() => field.onChange("")}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          Product Status
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-0 bg-blue-50/50 focus:bg-blue-50/80 focus:ring-2 focus:ring-blue-400/30 h-14 rounded-xl shadow-sm transition-all duration-200">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white/95 backdrop-blur-md border-0 shadow-lg rounded-xl overflow-hidden">
                            <SelectItem value="AVAILABLE" className="focus:bg-blue-50">Available</SelectItem>
                            <SelectItem value="RESERVED" className="focus:bg-blue-50">Reserved</SelectItem>
                            <SelectItem value="SOLD" className="focus:bg-blue-50">Sold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg font-medium rounded-xl shadow-lg transition-all duration-300 hover:translate-y-px flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                          <polyline points="17 21 17 13 7 13 7 21" />
                          <polyline points="7 3 7 8 15 8" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}