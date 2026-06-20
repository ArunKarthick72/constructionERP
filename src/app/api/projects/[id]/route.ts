import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      ownerName: body.ownerName,
      ownerPhone: body.ownerPhone,
      siteLocation: body.siteLocation,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: body.status,
      totalBudget: body.totalBudget ? parseFloat(body.totalBudget) : null,
      notes: body.notes,
    },
  })
  return NextResponse.json(project)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.project.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
