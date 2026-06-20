import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const employees = await prisma.employee.findMany({
    include: { _count: { select: { salaryEntries: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(employees)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const employee = await prisma.employee.create({
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
  return NextResponse.json(employee, { status: 201 })
}
