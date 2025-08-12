// File: app/api/attendance/leaderboard/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET(request: Request) {
  try {
    // Parse query parameters for additional filtering options
    const { searchParams } = new URL(request.url);
    const batchFilter = searchParams.get('batch');
    const branchFilter = searchParams.get('branch');
    const subjectFilter = searchParams.get('subject');

    // Build where clause based on filters
    const whereClause: any = {
      isVerified: true
    };

    if (batchFilter) {
      whereClause.batch = batchFilter;
    }

    if (branchFilter) {
      whereClause.branch = branchFilter;
    }

    // Fetch users with their attendance metrics
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        batch: true,
        branch: true,
        course: true,
        lastSeen: true,
        overallPercentage: true,
        overallAttendedClasses: true,
        overallTotalClasses: true,
        subjects: {
          select: {
            id: true,
            subjectCode: true,
            subjectName: true,
            subjectProfessor: true,
            attendedClasses: true,
            totalClasses: true,
            attendancePercentage: true,
            isAbove75: true,
            classesNeeded: true,
            classesCanSkip: true,
          }
        }
      },
      where: whereClause
    });

    // Filter users based on subject if needed
    let filteredUsers = users;
    if (subjectFilter) {
      filteredUsers = users.filter(user => 
        user.subjects.some(subject => subject.subjectCode === subjectFilter)
      );
    }

    // Sort users by overall attendance percentage in descending order
    const sortedUsers = filteredUsers.sort((a, b) => 
      b.overallPercentage - a.overallPercentage
    );

    // Add rank field to each user
    const rankedUsers = sortedUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    // Get unique batches and branches for filters
    const batches = [...new Set(users.map(user => user.batch).filter(Boolean))];
    const branches = [...new Set(users.map(user => user.branch).filter(Boolean))];
    
    // Get unique subjects for filter
    const allSubjects = new Set<string>();
    users.forEach(user => {
      user.subjects.forEach(subject => {
        if (subject.subjectCode) {
          allSubjects.add(subject.subjectCode);
        }
      });
    });
    const subjects = Array.from(allSubjects).sort();

    return NextResponse.json({
      users: rankedUsers,
      metadata: {
        total: rankedUsers.length,
        batches,
        branches,
        subjects
      }
    });
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}