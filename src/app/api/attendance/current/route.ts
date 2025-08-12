// api/attendance/current/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Define TypeScript interfaces for better type safety
interface AttendanceResponse {
  id: string;
  userId: string;
  date: Date;
  subjects: EnhancedAttendanceSubject[];
  user: UserInfo;
  overallMetrics: {
    totalAttended: number;
    totalClasses: number;
    overallPercentage: number;
    subjectsAbove75Percent: number;
    subjectsBelow75Percent: number;
  };
  subjectMetrics: SubjectMetric[];
  lastUpdated: Date;
}

interface EnhancedAttendanceSubject {
  id: string;
  slNo: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  presentTotal: string;
  attendancePercentage: string;
  attendedClasses: number;
  totalClasses: number;
  isAbove75: boolean;
  classesNeeded: number;
  classesCanSkip: number;
}

interface UserInfo {
  name: string;
  email: string;
  image: string | null;
  department: string | null;
  semester: string | null;
  registrationNumber: string | null;
  course: string | null;
  batch: string | null;
  branch: string | null;
  lastSeen: Date;
}

interface SubjectMetric {
  id: string;
  subjectCode: string;
  subjectName: string;
  subjectProfessor: string;
  attendedClasses: number;
  totalClasses: number;
  attendancePercentage: number;
  isAbove75: boolean;
  classesNeeded: number;
  classesCanSkip: number;
}

export async function GET() {
  // Get session data
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Fetch the user data with more comprehensive details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        image: true,
        course: true,
        batch: true,
        branch: true,
        lastSeen: true,
        activeStatus: true,
        loginDays: true,
        loginStreak: true,
        honorScore: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch the user's attendance record with subjects
    const attendanceRecord = await prisma.attendance.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      include: { 
        subjects: true,
      }
    });

    // Fetch the subject metrics
    const subjectMetrics = await prisma.subjectMetrics.findMany({
      where: { userId },
    });

    // Fetch daily attendance records (most recent ones)
    const dailyAttendance = await prisma.dailyAttendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10, // Get the 10 most recent daily records
      include: { subjects: true }
    });

    if (!attendanceRecord) {
      return NextResponse.json(
        { error: "No attendance record found" },
        { status: 404 }
      );
    }

    // Calculate overall metrics
    let totalAttended = 0;
    let totalClasses = 0;
    let subjectsAbove75 = 0;
    let subjectsBelow75 = 0;

    // Process each subject's data
    const enhancedSubjects = attendanceRecord.subjects.map(subject => {
      // Parse the presentTotal field (format: "14/17")
      const [attended, total] = subject.presentTotal.split('/').map(Number);
      
      // Add to totals
      totalAttended += attended || 0;
      totalClasses += total || 0;

      // Calculate whether above 75%
      const percentage = parseFloat(subject.attendancePercentage);
      const isAbove75 = percentage >= 75;
      
      if (isAbove75) {
        subjectsAbove75++;
      } else {
        subjectsBelow75++;
      }

      // Calculate classes needed to reach 75% threshold
      let classesNeeded = 0;
      if (!isAbove75 && total > 0) {
        // Formula: (attended + x) / (total + x) = 0.75
        // Solving for x: x = (0.75*total - attended) / (1 - 0.75)
        classesNeeded = Math.ceil((0.75 * total - attended) / 0.25);
        classesNeeded = classesNeeded > 0 ? classesNeeded : 0;
      }

      // Calculate classes that can be skipped while staying above 75%
      let classesCanSkip = 0;
      if (isAbove75 && total > 0) {
        // Formula: (attended) / (total + x) = 0.75
        // Solving for x: x = (attended / 0.75) - total
        classesCanSkip = Math.floor((attended / 0.75) - total);
        classesCanSkip = classesCanSkip > 0 ? classesCanSkip : 0;
      }

      return {
        ...subject,
        attendedClasses: attended || 0,
        totalClasses: total || 0,
        isAbove75,
        classesNeeded,
        classesCanSkip
      };
    });

    // Calculate overall percentage
    const overallPercentage = totalClasses > 0 
      ? ((totalAttended / totalClasses) * 100)
      : 0;

    // Create attendance trend data from daily records
    const attendanceTrend = dailyAttendance.map(record => {
      const date = record.date;
      
      // Calculate daily metrics
      let dailyAttended = 0;
      let dailyTotal = 0;
      
      record.subjects.forEach(subject => {
        dailyAttended += subject.attendedClasses;
        dailyTotal += subject.totalClasses;
      });
      
      const dailyPercentage = dailyTotal > 0
        ? ((dailyAttended / dailyTotal) * 100)
        : 0;
        
      return {
        date,
        percentage: dailyPercentage,
        attended: dailyAttended,
        total: dailyTotal
      };
    });

    // Format all the data for response
    const response: AttendanceResponse = {
      id: attendanceRecord.id,
      userId: userId,
      date: attendanceRecord.date,
      subjects: enhancedSubjects,
      user: {
        name: user.username,
        email: user.email,
        image: user.image,
        department: user.branch, // Using branch as department
        semester: user.batch, // Using batch as semester
        registrationNumber: null, // Not available in schema
        course: user.course,
        batch: user.batch,
        branch: user.branch,
        lastSeen: user.lastSeen
      },
      overallMetrics: {
        totalAttended,
        totalClasses,
        overallPercentage,
        subjectsAbove75Percent: subjectsAbove75,
        subjectsBelow75Percent: subjectsBelow75
      },
      subjectMetrics: subjectMetrics.map(metric => ({
        id: metric.id,
        subjectCode: metric.subjectCode,
        subjectName: metric.subjectName,
        subjectProfessor: metric.subjectProfessor,
        attendedClasses: metric.attendedClasses,
        totalClasses: metric.totalClasses,
        attendancePercentage: metric.attendancePercentage,
        isAbove75: metric.isAbove75,
        classesNeeded: metric.classesNeeded,
        classesCanSkip: metric.classesCanSkip
      })),
      lastUpdated: new Date()
    };

    // Add additional data that might be useful
    const extendedResponse = {
      ...response,
      attendanceTrend,
      userStats: {
        loginStreak: user.loginStreak || 0,
        loginDays: user.loginDays || 0,
        honorScore: user.honorScore,
        activeStatus: user.activeStatus
      }
    };

    // Return the comprehensive data
    return NextResponse.json(extendedResponse);

  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}