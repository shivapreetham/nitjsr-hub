import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        console.log('=== Google Profile Validation ===');
        console.log('Profile email:', profile.email);
        
        const emailRegex = /^(20\d{2})(ug|pg)([a-z]+)(\d{3})@nitjsr\.ac\.in$/;
        
        if (!emailRegex.test(profile.email)) {
          console.error('Email validation failed for:', profile.email);
          throw new Error('Please use your NIT JSR institute email address');
        }

        console.log('Email validation passed for:', profile.email);
        const userObj = {
          id: profile.sub,
          username: profile.email.split('@')[0],
          email: profile.email,
          image: profile.picture,
          isVerified: true,
          isAcceptingAnonymousMessages: true,
        };
        console.log('Returning user object:', userObj);
        return userObj;
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
      console.log('=== SignIn Callback Start ===');
      console.log('Provider:', account?.provider);
      console.log('User email:', user.email);
      console.log('User object:', JSON.stringify(user, null, 2));
      
      if (account?.provider === 'google' && user.email) {
        console.log('Processing Google OAuth sign-in for:', user.email);
        try {
          // Check if a user with this email already exists
          console.log('Checking for existing user with email:', user.email);
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true }
          });
          console.log('Existing user found:', existingUser ? 'Yes' : 'No');

          if (existingUser) {
            console.log('Processing existing user:', existingUser.id);
            // Check if this Google account is already linked
            const existingGoogleAccount = existingUser.accounts.find(
              acc => acc.provider === 'google' && acc.providerAccountId === account.providerAccountId
            );

            if (!existingGoogleAccount) {
              // Check if any Google account already exists for this provider
              const anyGoogleAccount = existingUser.accounts.find(
                acc => acc.provider === 'google'
              );

              if (!anyGoogleAccount) {
                // Link the Google account to existing user
                await prisma.account.upsert({
                  where: {
                    provider_providerAccountId: {
                      provider: account.provider,
                      providerAccountId: account.providerAccountId,
                    }
                  },
                  update: {
                    refresh_token: account.refresh_token,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    session_state: account.session_state,
                  },
                  create: {
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
                
                console.log(`Successfully linked Google account to existing user: ${user.email}`);
              }
            }

            // Update the user object to reflect the existing user
            user.id = existingUser.id;
            user.username = existingUser.username;
            user.isVerified = existingUser.isVerified;
            user.isAcceptingAnonymousMessages = existingUser.isAcceptingAnonymousMessages;
          } else {
            console.log('Creating new user for:', user.email);
            // For new users, create them manually to ensure all required fields are present
            const username = user.email.split('@')[0];
            console.log('Generated username:', username);
            
            const emailRegex = /^(20\d{2})(ug|pg)([a-z]+)(\d{3})@nitjsr\.ac\.in$/;
            const emailMatch = user.email.match(emailRegex);
            console.log('Email regex match:', emailMatch);
            
            let batch = null;
            let branch = null;
            let course = null;
            
            if (emailMatch) {
              const [, batchValue, branchCode, courseCode] = emailMatch;
              const branchMap = { ug: 'Undergraduate', pg: 'Postgraduate' };
              const courseMap = {
                cs: 'Computer Science and Engineering',
                ec: 'Electronics and Communication Engineering',
                ee: 'Electrical Engineering',
                ce: 'Civil Engineering',
                me: 'Mechanical Engineering',
                mm: 'Metallurgical and Materials Engineering',
                pi: 'Production and Industrial Engineering',
                csca: 'Master in Computer Applications',
                phd: 'PhD',
              };
              
              batch = batchValue;
              branch = branchMap[branchCode.toLowerCase() as keyof typeof branchMap] || branchCode.toUpperCase();
              course = courseMap[courseCode.toLowerCase() as keyof typeof courseMap] || courseCode.toUpperCase();
            }

            // Create the user manually with all required fields
            console.log('Creating user with data:', { username, email: user.email, batch, branch, course });
            const newUser = await prisma.user.create({
              data: {
                username,
                email: user.email,
                image: user.image,
                isVerified: true,
                isAcceptingAnonymousMessages: true,
                batch,
                branch,
                course,
              },
            });
            console.log('New user created with ID:', newUser.id);

            // Create the account record if it doesn't exist
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                }
              },
              update: {
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
              create: {
                userId: newUser.id,
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

            // Update user object with created user data
            user.id = newUser.id;
            user.username = newUser.username;
            user.isVerified = newUser.isVerified;
            user.isAcceptingAnonymousMessages = newUser.isAcceptingAnonymousMessages;
            
            console.log(`Successfully created new Google OAuth user: ${user.email}`);
          }

          // Trigger group management for Google OAuth users (non-blocking)
          setImmediate(async () => {
            try {
              await fetch(`${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL}/api/chat/group-management`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: user.email,
                  username: user.email?.split('@')[0],
                }),
                signal: AbortSignal.timeout(2000) // 2 second timeout
              });
            } catch (groupError) {
              console.error('Error in group management (non-blocking):', groupError);
              // Don't block sign-in if group management fails
            }
          });
        } catch (error) {
          console.error('Error in Google OAuth sign-in:', error);
          console.error('Error details:', error);
          return false; // Block sign in if there's an error with user/account creation
        }
      }
      
      console.log('=== SignIn Callback End - Returning true ===');
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
          // Only attempt to refresh if we have a valid MongoDB ObjectID format
          const userId = token.id as string;
          if (userId && userId.length === 24 && /^[a-f\d]{24}$/i.test(userId)) {
            const user = await prisma.user.findUnique({
              where: { id: userId },
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
          } else {
            // If the ID format is invalid, clear the credentials but don't fail
            token.hasNitCredentials = false;
            console.warn('Invalid ObjectID format in JWT token:', userId);
          }
        } catch (error) {
          console.error('Error refreshing user data in JWT:', error);
          // Don't fail the authentication, just clear the credentials
          token.hasNitCredentials = false;
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
