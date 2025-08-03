import prisma from '@/shared/lib/prismadb';
import { NextResponse } from 'next/server';

async function addUserToGroups(email: string, userId: string) {
  try {
    const emailPattern = /^(20\d{2})?(ug|pg)?([a-z]+)?/i;
    const match = email.match(emailPattern);
    console.log("got the group connection request from ", email);
    if (!match) {
      return await handleDefaultGroups(userId);
    }

    let [_, year, level, course] = match;
    
    year = year || 'common';
    level = level || 'all';
    course = course || 'general';

    const groups = await Promise.all([
      ensureGroupExists({ year, level, course, isAnonymous: false }),
      ensureGroupExists({ year, level, course, isAnonymous: true })
    ]);

    // Update both User and Conversation models
    await Promise.all(groups.map(async group => {
      // Add group ID to user's conversationIds
      await prisma.user.update({
        where: { id: userId },
        data: {
          conversationIds: {
            push: group.id
          }
        }
      });

      // Add user to group's userIds
      await prisma.conversation.update({
        where: { id: group.id },
        data: {
          userIds: {
            push: userId
          }
        }
      });
    }));

    return groups;
  } catch (error) {
    console.error('Error in addUserToGroups:', error);
    return await handleDefaultGroups(userId);
  }
}

async function handleDefaultGroups(userId: string) {
  const defaultGroups = await Promise.all([
    ensureGroupExists({ 
      year: 'common', 
      level: 'all', 
      course: 'general', 
      isAnonymous: false 
    }),
    ensureGroupExists({ 
      year: 'common', 
      level: 'all', 
      course: 'general', 
      isAnonymous: true 
    })
  ]);

  // Update both User and Conversation models for default groups
  await Promise.all(defaultGroups.map(async group => {
    await prisma.user.update({
      where: { id: userId },
      data: {
        conversationIds: {
          push: group.id
        }
      }
    });

    await prisma.conversation.update({
      where: { id: group.id },
      data: {
        userIds: {
          push: userId
        }
      }
    });
  }));

  return defaultGroups;
}

async function ensureGroupExists({ year, level, course, isAnonymous }: any) {
  const groupName = `${isAnonymous ? '##' : '#'}${year}${level}${course}`;
  
  const existingConversation = await prisma.conversation.findFirst({
    where: { name: groupName },
  });
  
  if (existingConversation) {
    return await prisma.conversation.update({
      where: { id: existingConversation.id },
      data: {
        isAnonymous,
        userIds: [],
      },
    });
  } else {
    return await prisma.conversation.create({
      data: {
        name: groupName,
        isGroup: true,
        isAnonymous,
        userIds: [],
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email;

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email is required' 
      }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    const groups = await addUserToGroups(email, user.id);

    return NextResponse.json({
      success: true,
      message: 'User added to groups successfully',
      groups: groups
    });

  } catch (error: any) {
    console.error('Error in group management:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to add user to groups',
      error: error.message 
    }, { status: 500 });
  }
}