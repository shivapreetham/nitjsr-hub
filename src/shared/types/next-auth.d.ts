import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      _id?: string;
      isVerified?: boolean;
      email?: string;
      isAcceptingAnonymousMessages?: boolean;
      username?: string;
      hasNitCredentials?: boolean;
      NITUsername?: string;
      NITPassword?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    _id?: string;
    isVerified?: boolean;
    email?: string;
    isAcceptingAnonymousMessages?: boolean;
    username?: string;
    hasNitCredentials?: boolean;
    NITUsername?: string;
    NITPassword?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    _id?: string;
    isVerified?: boolean;
    email?: string;
    isAcceptingAnonymousMessages?: boolean;
    username?: string;
    hasNitCredentials?: boolean;
    NITUsername?: string;
    NITPassword?: string;
  }
}