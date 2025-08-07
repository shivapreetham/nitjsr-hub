"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from "@/shared/types/products";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Loader2, Upload, Image as ImageIcon, Tag, MapPin, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { productSchema as formSchema } from "@/shared/schemas/productSchema";
import { MainImageUpload, AdditionalImagesUpload, PaymentQRUpload } from "@/app/(app)/market/(comp)/components/market/imageUpload";

export default function NewProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create product");
      }
      const product = await response.json();
      toast({
        title: "Product listed successfully",
        description: "Your product is now available in the marketplace.",
      });
      router.push(`/market/${product.id}`);
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Failed to list product",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageRemove = (field: any, urlToRemove: string) => {
    field.onChange(field.value.filter((url: string) => url !== urlToRemove));
  };

  return (
    <div className="bg-background py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-foreground hover:text-foreground hover:bg-muted rounded-full flex items-center gap-2 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to marketplace
        </Button>

        <Card className="overflow-hidden border-0 bg-card/60 backdrop-blur-md shadow-xl rounded-2xl">
          <div className="h-2 bg-gradient-to-r from-primary to-primary/80"></div>
          <CardContent className="p-6 sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">List Your Product</h1>
              <p className="text-muted-foreground">Fill in the details below to list your item in the marketplace</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Product Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="What are you selling?"
                          {...field}
                          className="border-0 bg-muted/50 focus:bg-muted/80 focus:ring-2 focus:ring-primary/30 h-14 rounded-xl shadow-sm transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium flex items-center gap-2">
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
                            className="border-0 bg-muted/50 focus:bg-muted/80 focus:ring-2 focus:ring-primary/30 h-14 rounded-xl shadow-sm transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4" />
                          Category
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-0 bg-muted/50 focus:bg-muted/80 focus:ring-2 focus:ring-primary/30 h-14 rounded-xl shadow-sm transition-all duration-200">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card/95 backdrop-blur-md border-0 shadow-lg rounded-xl overflow-hidden">
                            {PRODUCT_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category} className="focus:bg-muted">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-destructive" />
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
                        <FormLabel className="text-foreground font-medium flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Condition
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-0 bg-muted/50 focus:bg-muted/80 focus:ring-2 focus:ring-primary/30 h-14 rounded-xl shadow-sm transition-all duration-200">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card/95 backdrop-blur-md border-0 shadow-lg rounded-xl overflow-hidden">
                            {PRODUCT_CONDITIONS.map((condition) => (
                              <SelectItem key={condition} value={condition} className="focus:bg-muted">
                                {condition}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hostel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Hostel Location (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Where is the item located?"
                            {...field}
                            className="border-0 bg-muted/50 focus:bg-muted/80 focus:ring-2 focus:ring-primary/30 h-14 rounded-xl shadow-sm transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your item. Include details about its condition, usage, etc."
                          className="min-h-32 border-0 bg-muted/50 focus:bg-muted/80 focus:ring-2 focus:ring-primary/30 rounded-xl shadow-sm transition-all duration-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-muted/70 to-muted/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-sm">
                    <FormField
                      control={form.control}
                      name="mainImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Main Image
                          </FormLabel>
                          <p className="text-sm text-muted-foreground mb-3">
                            This will be the primary image shown in search results
                          </p>
                          <FormControl>
                            <div className="bg-card/70 backdrop-blur-sm p-5 rounded-xl border border-dashed border-border transition-all hover:border-primary duration-300">
                              <MainImageUpload
                                value={field.value}
                                onChange={(value: string) => field.onChange(value)}
                                onRemove={() => field.onChange("")}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-muted/70 to-muted/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-sm">
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Additional Images (Optional)
                          </FormLabel>
                          <p className="text-sm text-muted-foreground mb-3">
                            Upload up to 5 additional images to showcase your product
                          </p>
                          <FormControl>
                            <div className="bg-card/70 backdrop-blur-sm p-5 rounded-xl border border-dashed border-border transition-all hover:border-primary duration-300">
                              <AdditionalImagesUpload
                                value={field.value}
                                onChange={(urls: string[]) => field.onChange(urls)}
                                onRemove={(url: string) => handleImageRemove(field, url)}
                              />
                              {field.value && field.value.length > 0 && (
                                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {field.value.map((url, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border shadow-sm transition-transform hover:scale-[1.02] duration-300">
                                      <Image
                                        src={url}
                                        alt={`Additional image ${index + 1}`}
                                        fill
                                        className="object-cover w-full h-full"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleImageRemove(field, url)}
                                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 w-7 h-7 flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors duration-200"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-muted/70 to-muted/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-sm">
                    <FormField
                      control={form.control}
                      name="paymentQR"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium flex items-center gap-2">
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
                          <p className="text-sm text-muted-foreground mb-3">
                            Upload your UPI/payment QR code for easier transactions
                          </p>
                          <FormControl>
                            <div className="bg-card/70 backdrop-blur-sm p-5 rounded-xl border border-dashed border-border transition-all hover:border-primary duration-300">
                              <PaymentQRUpload
                                value={field.value ?? ""}
                                onChange={(url: string) => field.onChange(url)}
                                onRemove={() => field.onChange("")}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground py-6 text-lg font-medium rounded-xl shadow-lg transition-all duration-300 hover:translate-y-px flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Listing Product...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 9h14l-4 4M5 15h14l-4 4" />
                        </svg>
                        List Product
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