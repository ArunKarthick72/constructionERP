import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const materials = await prisma.material.findMany({
    include: { category: true },
    orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
  })
  return NextResponse.json(materials)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const material = await prisma.material.create({
    data: {
      name: body.name,
      nameTA: body.nameTA,
      unit: body.unit,
      categoryId: body.categoryId,
    },
    include: { category: true },
  })
  return NextResponse.json(material, { status: 201 })
}
