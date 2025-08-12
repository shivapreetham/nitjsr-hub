import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();
    
    if (!filename || !contentType) {
      return NextResponse.json(
        { success: false, error: 'Missing filename or contentType' },
        { status: 400 }
      );
    }
    
    // Validate file size limit (5MB = 5 * 1024 * 1024 bytes)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    
    // Validate content type for images, videos, and gifs
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov',
      'video/wmv'
    ];
    
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images, videos, and GIFs are allowed.' },
        { status: 400 }
      );
    }
    
    const key = `${Date.now()}-${filename}`;

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
      ContentLengthRange: [0, maxFileSize], // Enforce 5MB limit
    });

    const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 3600 });

    return NextResponse.json({
      success: true,
      presignedUrl,
      key,
      publicUrl: `https://${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`,
    });
    
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}