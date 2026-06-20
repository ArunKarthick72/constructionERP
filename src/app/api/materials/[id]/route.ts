import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const material = await prisma.material.update({
    where: { id: params.id },
    data: { name: body.name, nameTA: body.nameTA, unit: body.unit, categoryId: body.categoryId },
    include: { category: true },
  })
  return NextResponse.json(material)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.material.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
