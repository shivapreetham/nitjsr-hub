import getCurrentUser from '@/app/(shared)/serverActions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { image, username, NITUsername, NITPassword, mobileNumber, hostel } = body;
    
    // Create an object with only the fields to update
    const updateData: any = {};
    
    if (image !== undefined) updateData.image = image;
    if (username !== undefined) updateData.username = username;
    if (NITUsername !== undefined) updateData.NITUsername = NITUsername;
    if (NITPassword !== undefined) updateData.NITPassword = NITPassword;
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;
    if (hostel !== undefined) updateData.hostel = hostel;
    
    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return new NextResponse('No changes provided', { status: 400 });
    }
    
    // Check for username uniqueness if it's being updated
    if (username && username !== currentUser.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });
      
      if (existingUser) {
        return new NextResponse('Username already taken', { status: 409 });
      }
    }

    console.log('Updating user with data:', updateData);
    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: updateData,
    });

    // Remove sensitive data before sending response
    const { ...safeUser } = updatedUser;
    return NextResponse.json(safeUser, { status: 200 });
  } catch (error) {
    console.log(error, 'ERROR_PROFILE_UPDATE');
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
