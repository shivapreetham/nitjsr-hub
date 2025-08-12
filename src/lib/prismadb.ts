// lib/prismadb.ts
import { PrismaClient } from '@prisma/client'
//globalForPrisma ensures that only one instance of the Prisma Client is created,
// regardless of even in a development environment where hot reloading might cause the file to be re-executed multiple times.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create client without transactions, if it exists then just give it back
const prisma = globalForPrisma.prisma ?? 
  new PrismaClient()

//why not the same instance?
//In production, a new instance is created without attaching it globally to avoid potential memory leaks or other issues caused by long-lived global objects in serverless environments.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma