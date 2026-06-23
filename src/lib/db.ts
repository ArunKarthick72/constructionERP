import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const isVercel = process.env.VERCEL === '1'
let dbUrl: string | undefined = undefined

if (isVercel) {
  if (fs.existsSync('/var/task/public/dev.db')) {
    dbUrl = 'file:/var/task/public/dev.db'
  } else {
    dbUrl = 'file:./public/dev.db'
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

