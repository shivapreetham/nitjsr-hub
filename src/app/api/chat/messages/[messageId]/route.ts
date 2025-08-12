import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import getCurrentUser from '@/app/(shared)/serverActions/getCurrentUser';
import { pusherServer } from '@/lib/pusher';

// Function to delete file from Cloudflare R2 using existing API
async function deleteFromCloudflare(fileUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/cloudflare/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: fileUrl }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`Successfully deleted file from Cloudflare R2: ${fileUrl}`);
      return true;
    } else {
      console.error(`Failed to delete file from Cloudflare R2: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error('Failed to call Cloudflare delete API:', error);
    return false;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;

    if (!messageId) {
      return new NextResponse('Message ID is required', { status: 400 });
    }

    const message = await prisma.message.findUnique({
      where: {
        id: messageId
      },
      include: {
        seen: true,
        sender: true
      }
    });

    if (!message) {
      return new NextResponse('Message not found', { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.log(error, 'ERROR_MESSAGE_GET');
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const { messageId } = await params;

    if (!currentUser?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!messageId) {
      return new NextResponse('Message ID is required', { status: 400 });
    }

    const existingMessage = await prisma.message.findUnique({
      where: {
        id: messageId
      },
      include: {
        seen: true,
        sender: true
      }
    });

    if (!existingMessage) {
      return new NextResponse('Message not found', { status: 404 });
    }

    // Check if the current user is the message sender
    if (existingMessage.senderId !== currentUser.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete file from Cloudflare R2 if message has a file attachment
    if (existingMessage.fileUrl) {
      console.log(`Deleting file from Cloudflare for message ${messageId}: ${existingMessage.fileUrl}`);
      const cloudflareDeleted = await deleteFromCloudflare(existingMessage.fileUrl);
      if (!cloudflareDeleted) {
        console.warn(`Failed to delete file from Cloudflare R2: ${existingMessage.fileUrl}`);
        // Continue with message deletion even if Cloudflare deletion fails
      }
    }
    
    // Also handle legacy image field
    if (existingMessage.image) {
      console.log(`Deleting legacy image from Cloudflare for message ${messageId}: ${existingMessage.image}`);
      const cloudflareDeleted = await deleteFromCloudflare(existingMessage.image);
      if (!cloudflareDeleted) {
        console.warn(`Failed to delete legacy image from Cloudflare R2: ${existingMessage.image}`);
        // Continue with message deletion even if Cloudflare deletion fails
      }
    }

    // Delete the message
    const deletedMessage = await prisma.message.delete({
      where: {
        id: messageId
      },
      include: {
        seen: true,
        sender: true
      }
    });

    // Trigger Pusher event for real-time deletion
    await pusherServer.trigger(
      existingMessage.conversationId, 
      'message:delete', 
      {
        id: messageId,
        conversationId: existingMessage.conversationId
      }
    );

    return NextResponse.json(deletedMessage);
  } catch (error) {
    console.log(error, 'ERROR_MESSAGE_DELETE');
    return new NextResponse('Internal Error', { status: 500 });
  }
}