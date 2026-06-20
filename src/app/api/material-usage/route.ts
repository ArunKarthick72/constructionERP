import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const usages = await prisma.materialUsage.findMany({
    include: { material: { include: { category: true } }, project: true },
    orderBy: { usageDate: 'desc' },
  })
  return NextResponse.json(usages)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const qty = parseFloat(body.quantity)

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check current stock
      const lastStock = await tx.stockLedger.findFirst({
        where: { materialId: body.materialId },
        orderBy: { txnDate: 'desc' },
      })
      const currentBalance = lastStock?.balanceAfter ?? 0
      if (currentBalance < qty) {
        throw new Error(`Insufficient stock. Available: ${currentBalance} ${body.unit}`)
      }

      const usage = await tx.materialUsage.create({
        data: {
          projectId: body.projectId,
          materialId: body.materialId,
          quantity: qty,
          unit: body.unit,
          usageDate: new Date(body.usageDate),
          notes: body.notes,
        },
      })

      await tx.stockLedger.create({
        data: {
          materialId: body.materialId,
          txnType: 'OUT',
          quantity: qty,
          balanceAfter: currentBalance - qty,
          referenceType: 'USAGE',
          usageId: usage.id,
          txnDate: new Date(body.usageDate),
        },
      })

      return usage
    })

    return NextResponse.json(result, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Transaction failed' }, { status: 400 })
  }
}
