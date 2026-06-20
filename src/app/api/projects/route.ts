import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateProjectCode } from '@/lib/utils'

export async function GET() {
  const projects = await prisma.project.findMany({
    include: {
      _count: { select: { purchases: true, financials: true, salaryEntries: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const count = await prisma.project.count()
  const projectCode = generateProjectCode(count)
  const project = await prisma.project.create({
    data: {
      projectCode,
      ownerName: body.ownerName,
      ownerPhone: body.ownerPhone,
      siteLocation: body.siteLocation,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: body.status ?? 'ACTIVE',
      totalBudget: body.totalBudget ? parseFloat(body.totalBudget) : null,
      notes: body.notes,
    },
  })
  return NextResponse.json(project, { status: 201 })
}
