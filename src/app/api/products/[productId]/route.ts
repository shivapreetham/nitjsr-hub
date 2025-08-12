// app/api/products/[productId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(
  req: Request,
  { params }: { params: any } 
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product ID required", { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            image: true,
            mobileNumber: true,
            hostel: true
          }
        },
        interestedUsers: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: any }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    const product = await prisma.product.findUnique({
      where: {
        id: params.productId
      }
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Only allow the seller to update the product
    if (product.sellerId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: params.productId
      },
      data: {
        ...body
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: any }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: params.productId
      }
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Only allow the seller to delete the product
    if (product.sellerId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    await prisma.product.delete({
      where: {
        id: params.productId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}