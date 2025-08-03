import prisma from '@/lib/prismadb';
import getSession from './getSession';

const getCurrentUser = async () => {
  try {
    const session = await getSession();
    if (!session?.user?.email) return null;

    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });
    // console.log(currentUser)
    if (!currentUser) return null;
    
    return currentUser;
  } catch  {
    return null;
  }
};

export default getCurrentUser;