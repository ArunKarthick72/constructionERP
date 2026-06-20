import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')
  const projectId = searchParams.get('projectId')

  const entries = await prisma.salaryEntry.findMany({
    where: {
      ...(employeeId && { employeeId }),
      ...(projectId && { projectId }),
    },
    include: { employee: true, project: true },
    orderBy: { paidDate: 'desc' },
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = await prisma.salaryEntry.create({
    data: {
      employeeId: body.employeeId,
      projectId: body.projectId || null,
      payType: body.payType,
      amount: parseFloat(body.amount),
      daysWorked: body.daysWorked ? parseFloat(body.daysWorked) : null,
      periodFrom: new Date(body.periodFrom),
      periodTo: new Date(body.periodTo),
      paidDate: new Date(body.paidDate),
      notes: body.notes,
    },
    include: { employee: true, project: true },
  })
  return NextResponse.json(entry, { status: 201 })
}
