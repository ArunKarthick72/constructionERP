import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const categories = await prisma.materialCategory.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(categories)
}
