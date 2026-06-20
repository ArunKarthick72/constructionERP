import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    include: { materials: { include: { material: { include: { category: true } } } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(suppliers)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supplier = await prisma.supplier.create({
    data: {
      name: body.name,
      contactName: body.contactName,
      phone: body.phone,
      email: body.email,
      address: body.address,
      gstin: body.gstin,
      notes: body.notes,
      materials: {
        create: (body.materialIds ?? []).map((id: string) => ({
          materialId: id,
        })),
      },
    },
    include: {
      materials: {
        include: {
          material: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  })
  return NextResponse.json(supplier, { status: 201 })
}
