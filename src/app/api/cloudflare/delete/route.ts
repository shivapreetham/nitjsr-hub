import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

// Helper function to extract full key (with subfolder, if any)
function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const decodedPath = decodeURIComponent(urlObj.pathname);
    return decodedPath.startsWith('/') ? decodedPath.slice(1) : decodedPath;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'Missing imageUrl' }, { status: 400 });
    }

    const key = extractKeyFromUrl(imageUrl);
    if (!key) {
      return NextResponse.json({ success: false, error: 'Invalid imageUrl format' }, { status: 400 });
    }

    const deleteParams = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);

    return NextResponse.json({ success: true, message: 'File deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: 500 }
    );
  }
}