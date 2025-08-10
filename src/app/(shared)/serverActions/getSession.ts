import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/authentication/auth/[...nextauth]/options';

export default async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}
