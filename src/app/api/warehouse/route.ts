import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  // Get current stock for each material
  const materials = await prisma.material.findMany({
    include: { category: true },
    orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
  })

  const stockData = await Promise.all(
    materials.map(async (m) => {
      const lastEntry = await prisma.stockLedger.findFirst({
        where: { materialId: m.id },
        orderBy: { txnDate: 'desc' },
      })
      return {
        ...m,
        currentStock: lastEntry?.balanceAfter ?? 0,
      }
    })
  )

  return NextResponse.json(stockData)
}
