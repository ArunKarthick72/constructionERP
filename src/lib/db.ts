import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const isVercel = process.env.VERCEL === '1'
let dbUrl: string | undefined = undefined

if (isVercel) {
  if (fs.existsSync('/var/task/public/dev.db')) {
    dbUrl = 'file:/var/task/public/dev.db'
  } else {
    // During build time, use an absolute path to public/dev.db
    const absoluteDbPath = path.resolve(process.cwd(), 'public/dev.db').replace(/\\/g, '/')
    dbUrl = `file:${absoluteDbPath}`
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


