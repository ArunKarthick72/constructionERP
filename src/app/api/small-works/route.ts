import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const works = await prisma.smallWork.findMany({
    include: { materials: { include: { material: true } } },
    orderBy: { workDate: 'desc' },
  })
  return NextResponse.json(works)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    const result = await prisma.$transaction(async (tx) => {
      const work = await tx.smallWork.create({
        data: {
          title: body.title,
          location: body.location,
          description: body.description,
          workDate: new Date(body.workDate),
        },
      })

      for (const item of body.materials || []) {
        const qty = parseFloat(item.quantity)
        const lastStock = await tx.stockLedger.findFirst({
          where: { materialId: item.materialId },
          orderBy: { txnDate: 'desc' },
        })
        const currentBalance = lastStock?.balanceAfter ?? 0
        if (currentBalance < qty) {
          throw new Error(`Insufficient stock for material. Available: ${currentBalance}`)
        }

        const swMaterial = await tx.smallWorkMaterial.create({
          data: {
            smallWorkId: work.id,
            materialId: item.materialId,
            quantity: qty,
            unit: item.unit,
          },
        })

        await tx.stockLedger.create({
          data: {
            materialId: item.materialId,
            txnType: 'OUT',
            quantity: qty,
            balanceAfter: currentBalance - qty,
            referenceType: 'SMALL_WORK',
            smallWorkId: swMaterial.id,
            txnDate: new Date(body.workDate),
          },
        })
      }

      return work
    })

    return NextResponse.json(result, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Transaction failed' }, { status: 400 })
  }
}
