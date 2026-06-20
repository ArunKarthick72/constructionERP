import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')

  const entries = await prisma.financialEntry.findMany({
    where: projectId ? { projectId } : undefined,
    include: { project: true },
    orderBy: { entryDate: 'desc' },
  })

  // Compute running balance per project
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = await prisma.financialEntry.create({
    data: {
      projectId: body.projectId,
      entryType: body.entryType,
      amount: parseFloat(body.amount),
      description: body.description,
      entryDate: new Date(body.entryDate),
      referenceNo: body.referenceNo,
    },
    include: { project: true },
  })
  return NextResponse.json(entry, { status: 201 })
}
