// app/api/products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      price,
      category,
      condition,
      hostel,
      mainImage,
      images,
      paymentQR
    } = body;

    // Validate required fields
    if (!title || !description || !price || !category || !mainImage) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user has mobile number and hostel
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mobileNumber: true, hostel: true }
    });

    if (!user?.mobileNumber || (!user?.hostel && !hostel)) {
      return new NextResponse(
        "Please update your profile with mobile number and hostel information to list products",
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price.toString()),
        category,
        condition,
        hostel: hostel || user.hostel,
        mainImage,
        images: images || [],
        paymentQR,
        sellerId: session.user.id
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const hostel = searchParams.get("hostel");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sellerId = searchParams.get("sellerId");

    // Build filter object
    const filters: any = {
      where: {}
    };

    if (category) filters.where.category = category;
    if (status) filters.where.status = status;
    if (hostel) filters.where.hostel = hostel;
    if (sellerId) filters.where.sellerId = sellerId;
    
    if (minPrice || maxPrice) {
      filters.where.price = {};
      if (minPrice) filters.where.price.gte = parseFloat(minPrice);
      if (maxPrice) filters.where.price.lte = parseFloat(maxPrice);
    }

    const products = await prisma.product.findMany({
      ...filters,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}