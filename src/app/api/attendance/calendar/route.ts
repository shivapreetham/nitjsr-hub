import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req: Request) {

  console.log("GETtting from /api/attendance/calendar but really ??");
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  console.log(searchParams)
  const userId = session.user.id;
  const year = parseInt(searchParams.get("year") || "");
  const month = parseInt(searchParams.get("month") || "");

  if (isNaN(year) || isNaN(month)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    // Start of the month
    const startDate = new Date(year, month - 1, 1);
    // Start of next month
    const endDate = new Date(year, month, 0);
    
    // Fetch both Attendance and DailyAttendance records for the month
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        subjects: true, // Include subject details
      },
    });
    
    const dailyAttendanceRecords = await prisma.dailyAttendance.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        subjects: true, // Include daily subject details
      },
    });

    // Format the response with both types of attendance data
    const formattedResponse = {
      attendanceRecords,
      dailyAttendanceRecords,
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}