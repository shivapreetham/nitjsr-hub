import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size based on type
    const MAX_SIZE = type === "qr" ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB for QR, 5MB for others
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File size exceeds the limit of ${MAX_SIZE / (1024 * 1024)}MB` 
        },
        { status: 400 }
      );
    }

    // Extract file extension
    const originalName = file.name;
    const fileExt = originalName.split(".").pop()?.toLowerCase();

    // Create unique filename with user-friendly structure
    const folderPath = type === "main" ? "main" : type === "qr" ? "qr" : "additional";
    const uniqueFilename = `${folderPath}/${Date.now()}-${uuidv4()}.${fileExt}`;

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const {error } = await supabase
      .storage
      .from('product-images') // Your bucket name in Supabase
      .upload(uniqueFilename, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('product-images')
      .getPublicUrl(uniqueFilename);

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// Set larger payload size limit for image uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};