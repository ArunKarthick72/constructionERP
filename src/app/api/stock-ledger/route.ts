import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const materialId = searchParams.get('materialId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const ledger = await prisma.stockLedger.findMany({
    where: {
      ...(materialId && { materialId }),
      ...(startDate && { txnDate: { gte: new Date(startDate) } }),
      ...(endDate && { txnDate: { lte: new Date(endDate) } }),
    },
    include: { material: true },
    orderBy: { txnDate: 'desc' },
    take: 100,
  })
  return NextResponse.json(ledger)
}
