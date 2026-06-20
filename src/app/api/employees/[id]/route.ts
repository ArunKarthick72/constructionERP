import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const employee = await prisma.employee.update({
    where: { id: params.id },
    data: {
      name: body.name,
      phone: body.phone,
      role: body.role,
      dailyWage: body.dailyWage ? parseFloat(body.dailyWage) : null,
      monthlyWage: body.monthlyWage ? parseFloat(body.monthlyWage) : null,
      joinDate: body.joinDate ? new Date(body.joinDate) : null,
      notes: body.notes,
    },
  })
  return NextResponse.json(employee)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.employee.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
