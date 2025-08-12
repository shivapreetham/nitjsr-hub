import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        const emailRegex = /^(20\d{2})(ug|pg)([a-z]+)(\d{3})@nitjsr\.ac\.in$/;
        
        if (!emailRegex.test(profile.email)) {
          throw new Error('Please use your NIT JSR institute email address');
        }

        return {
          id: profile.sub,
          username: profile.email.split('@')[0],
          email: profile.email,
          image: profile.picture,
          isVerified: true,
          isAcceptingAnonymousMessages: true,
        };
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email/Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('Missing email/username or password');
        }

        try {
          // Find user by email or username
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.identifier },
                { username: credentials.identifier },
              ],
              isVerified: true,
            },
          });

          if (!user) {
            throw new Error('No user found with this identifier');
          }

          // Verify password
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.hashedPassword || ''
          );

          if (!isPasswordCorrect) {
            throw new Error('Incorrect password');
          }

          return user;
        } catch (err: any) {
          throw new Error(err.message || 'Authentication failed');
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if a user with this email already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true }
          });

          if (existingUser) {
            // Check if this Google account is already linked
            const existingGoogleAccount = existingUser.accounts.find(
              acc => acc.provider === 'google'
            );

            if (!existingGoogleAccount) {
              // Link the Google account to existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                }
              });

              // Update the user object to reflect the existing user
              user.id = existingUser.id;
              user.username = existingUser.username;
              user.isVerified = existingUser.isVerified;
              user.isAcceptingAnonymousMessages = existingUser.isAcceptingAnonymousMessages;
              
              console.log(`Successfully linked Google account to existing user: ${user.email}`);
            }
          }

          // Trigger group management for Google OAuth users
          await fetch(`${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL}/api/chat/group-management`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              username: user.email?.split('@')[0],
            })
          });
        } catch (error) {
          console.error('Error linking Google account or adding user to groups:', error);
          // Don't block sign in for linking failures
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.isVerified = user.isVerified;
        token.email = user.email;
        token.isAcceptingAnonymousMessages = user.isAcceptingAnonymousMessages;
        token.username = user.username;
        token.NITUsername = user.NITUsername;
        token.NITPassword = user.NITPassword;
        token.hasNitCredentials = Boolean(user.NITUsername && user.NITPassword);
      }

      // Handle session updates (e.g., when credentials are updated)
      if (trigger === 'update' && session) {
        token.NITUsername = session.user.NITUsername;
        token.NITPassword = session.user.NITPassword;
        token.hasNitCredentials = Boolean(session.user.NITUsername && session.user.NITPassword);
      }

      // Refresh user data from database periodically
      if (trigger === 'update' || !token.hasNitCredentials) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              NITUsername: true,
              NITPassword: true,
              isVerified: true,
              isAcceptingAnonymousMessages: true,
            }
          });

          if (user) {
            token.NITUsername = user.NITUsername || undefined;
            token.NITPassword = user.NITPassword || undefined;
            token.hasNitCredentials = Boolean(user.NITUsername && user.NITPassword);
            token.isVerified = user.isVerified;
            token.isAcceptingAnonymousMessages = user.isAcceptingAnonymousMessages;
          }
        } catch (error) {
          console.error('Error refreshing user data in JWT:', error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.isVerified = token.isVerified;
        session.user.email = token.email;
        session.user.isAcceptingAnonymousMessages =
          token.isAcceptingAnonymousMessages;
        session.user.username = token.username;
        session.user.NITUsername = token.NITUsername;
        session.user.NITPassword = token.NITPassword;
        session.user.hasNitCredentials = token.hasNitCredentials;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/sign-in',
  },
};
