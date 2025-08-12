import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from "uuid";

// Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    console.log('Upload route hit');
    
    // Check environment variables
    if (!process.env.CLOUDFLARE_R2_ACCOUNT_ID || !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || !process.env.CLOUDFLARE_R2_BUCKET_NAME) {
      console.error('Missing Cloudflare R2 environment variables');
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    console.log('Upload request:', { fileName: file?.name, fileSize: file?.size, type });

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type - now supports images, videos, and GIFs
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only images, videos, and GIFs are allowed" },
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

    // Upload to Cloudflare R2
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: uniqueFilename,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type,
    });

    console.log('Uploading to R2:', uniqueFilename);
    await s3Client.send(command);
    console.log('Upload successful to R2');

    // Generate public URL
    const publicUrl = `https://${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${uniqueFilename}`;
    console.log('Generated public URL:', publicUrl);

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