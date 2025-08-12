// app/api/products/[productId]/interest/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
export async function POST(
  req: Request,
  { params }: { params: any}
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        interestedUsers: true
      }
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Don't allow seller to express interest in their own product
    if (product.sellerId === session.user.id) {
      return new NextResponse("Cannot express interest in your own product", { status: 400 });
    }

    // Check if user has already expressed interest
    const hasInterest = product.interestedUserIds.includes(session.user.id);

    // Add or remove interest
    const updatedProduct = await prisma.product.update({
      where: {
        id: params.productId
      },
      data: {
        interestedUsers: {
          ...(hasInterest 
            ? { disconnect: { id: session.user.id } }
            : { connect: { id: session.user.id } })
        }
      },
      include: {
        interestedUsers: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("[PRODUCT_INTEREST_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}