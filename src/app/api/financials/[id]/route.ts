import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.financialEntry.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
