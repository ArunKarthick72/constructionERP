import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const supplier = await prisma.$transaction(async (tx) => {
    // Delete existing material mappings
    await tx.supplierMaterial.deleteMany({
      where: { supplierId: params.id },
    })

    // Update supplier details and insert new material mappings
    return await tx.supplier.update({
      where: { id: params.id },
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
  })
  return NextResponse.json(supplier)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.supplier.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
