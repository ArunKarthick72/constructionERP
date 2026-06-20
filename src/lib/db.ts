import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const isVercel = process.env.VERCEL === '1'
const dbUrl = isVercel ? 'file:/var/task/public/dev.db' : undefined

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
