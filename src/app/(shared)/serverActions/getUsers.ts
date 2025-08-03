import prisma from '@/lib/prismadb';
import getSession from './getSession';

const getUsers = async () => {
  try {
    const session = await getSession();

    if (!session?.user?.email) return [];

    // Get all users except the current user
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          email: session.user.email as string,
        },
      },
    });

    if (!users) return [];

    return users;
  } catch {
    return [];
  }
};

export default getUsers;
