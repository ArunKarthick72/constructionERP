import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const purchases = await prisma.purchase.findMany({
    include: { material: { include: { category: true } }, supplier: true, project: true },
    orderBy: { purchaseDate: 'desc' },
  })
  return NextResponse.json(purchases)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const qty = parseFloat(body.quantity)
  const unitPrice = parseFloat(body.unitPrice)
  const totalCost = qty * unitPrice

  // Create purchase and update stock ledger in transaction
  const result = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        projectId: body.projectId || null,
        supplierId: body.supplierId,
        materialId: body.materialId,
        quantity: qty,
        unit: body.unit,
        unitPrice,
        totalCost,
        purchaseDate: new Date(body.purchaseDate),
        invoiceNo: body.invoiceNo,
        notes: body.notes,
      },
    })

    // Get current stock balance
    const lastStock = await tx.stockLedger.findFirst({
      where: { materialId: body.materialId },
      orderBy: { txnDate: 'desc' },
    })
    const currentBalance = lastStock?.balanceAfter ?? 0
    const newBalance = currentBalance + qty

    await tx.stockLedger.create({
      data: {
        materialId: body.materialId,
        txnType: 'IN',
        quantity: qty,
        balanceAfter: newBalance,
        referenceType: 'PURCHASE',
        purchaseId: purchase.id,
        txnDate: new Date(body.purchaseDate),
      },
    })

    return purchase
  })

  return NextResponse.json(result, { status: 201 })
}
