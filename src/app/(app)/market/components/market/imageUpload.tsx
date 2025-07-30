// components/imageUpload.tsx
"use client";

import { useState } from "react";
import { Upload, X, Loader2} from "lucide-react";
import Image from "next/image";

// Common types
type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadResponse {
  url: string;
  success: boolean;
  error?: string;
}

// Main Image Upload Component
interface MainImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export const MainImageUpload = ({ value, onChange, onRemove }: MainImageUploadProps) => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setStatus("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "main");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!data.success || !data.url) {
        throw new Error(data.error || "Failed to upload image");
      }

      onChange(data.url);
      setStatus("success");
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Failed to upload image");
      setStatus("error");
    }
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative">
          <div className="aspect-square w-full relative rounded-lg overflow-hidden border border-blue-200">
            <Image 
              src={value} 
              alt="Main product image" 
              fill 
              className="object-cover" 
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="w-full">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
            <Upload className="h-10 w-10 text-blue-500 mb-2" />
            <p className="text-sm font-medium text-blue-700">
              {status === "uploading" ? "Uploading..." : "Upload main product image"}
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
            
            <input
              id="main-image-upload"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={status === "uploading"}
            />
            
            <label htmlFor="main-image-upload" className="mt-4">
              <div className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${status === "uploading" 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-blue-600 text-white hover:bg-blue-700"}`}
              >
                {status === "uploading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Select Image"
                )}
              </div>
            </label>
            
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Additional Images Upload Component
interface AdditionalImagesUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onRemove: (url: string) => void;
}

export const AdditionalImagesUpload = ({ value, onChange}: AdditionalImagesUploadProps) => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the 5 image limit
    if (value.length + files.length > 5) {
      setError("You can upload a maximum of 5 additional images");
      return;
    }

    setStatus("uploading");
    setError(null);

    const uploadPromises: Promise<string>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload image files only");
        setStatus("error");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be less than 5MB");
        setStatus("error");
        return;
      }

      // Create upload promise
      const uploadPromise = new Promise<string>(async (resolve, reject) => {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", "additional");

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data: UploadResponse = await response.json();

          if (!data.success || !data.url) {
            throw new Error(data.error || "Failed to upload image");
          }

          resolve(data.url);
        } catch (error) {
          reject(error);
        }
      });

      uploadPromises.push(uploadPromise);
    }

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...value, ...uploadedUrls]);
      setStatus("success");
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Failed to upload images");
      setStatus("error");
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
          <Upload className="h-10 w-10 text-blue-500 mb-2" />
          <p className="text-sm font-medium text-blue-700">
            {status === "uploading" ? "Uploading..." : "Upload additional images"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {`${value.length}/5 images uploaded`}
          </p>
          
          <input
            id="additional-images-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={status === "uploading" || value.length >= 5}
          />
          
          <label htmlFor="additional-images-upload" className="mt-4">
            <div className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${value.length >= 5 
                ? "bg-gray-300 text-gray-700 cursor-not-allowed" 
                : status === "uploading" 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              {status === "uploading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : value.length >= 5 ? (
                "Maximum images reached"
              ) : (
                "Select Images"
              )}
            </div>
          </label>
          
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Payment QR Upload Component
interface PaymentQRUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export const PaymentQRUpload = ({ value, onChange, onRemove }: PaymentQRUploadProps) => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("QR code image size must be less than 2MB");
      return;
    }

    setStatus("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "qr");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!data.success || !data.url) {
        throw new Error(data.error || "Failed to upload QR code");
      }

      onChange(data.url);
      setStatus("success");
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Failed to upload QR code");
      setStatus("error");
    }
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative">
          <div className="w-48 h-48 mx-auto relative rounded-lg overflow-hidden border border-blue-200">
            <Image 
              src={value} 
              alt="Payment QR code" 
              fill 
              className="object-contain" 
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="w-full">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
            <Upload className="h-10 w-10 text-blue-500 mb-2" />
            <p className="text-sm font-medium text-blue-700">
              {status === "uploading" ? "Uploading..." : "Upload payment QR code"}
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 2MB</p>
            
            <input
              id="qr-code-upload"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={status === "uploading"}
            />
            
            <label htmlFor="qr-code-upload" className="mt-4">
              <div className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${status === "uploading" 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-blue-600 text-white hover:bg-blue-700"}`}
              >
                {status === "uploading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Select QR Code"
                )}
              </div>
            </label>
            
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};