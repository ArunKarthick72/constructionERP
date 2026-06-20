import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const [
    projects,
    purchases,
    materialUsages,
    salaryEntries,
    financials,
    smallWorks,
  ] = await Promise.all([
    prisma.project.findMany({ orderBy: { projectCode: 'asc' } }),
    prisma.purchase.findMany({ include: { material: { include: { category: true } }, supplier: true, project: true } }),
    prisma.materialUsage.findMany({ include: { material: { include: { category: true } }, project: true } }),
    prisma.salaryEntry.findMany({ include: { employee: true, project: true } }),
    prisma.financialEntry.findMany({ include: { project: true } }),
    prisma.smallWork.findMany({ include: { materials: { include: { material: true } } } }),
  ])

  // Project-wise P&L
  const projectPnL = projects.map((proj) => {
    const income = financials
      .filter((f) => f.projectId === proj.id && ['RECEIPT', 'ADVANCE'].includes(f.entryType))
      .reduce((s, f) => s + f.amount, 0)
    const materialCost = purchases.filter((p) => p.projectId === proj.id).reduce((s, p) => s + p.totalCost, 0)
    const salaryCost = salaryEntries.filter((s) => s.projectId === proj.id).reduce((s, e) => s + e.amount, 0)
    const totalExpense = materialCost + salaryCost
    return { projectCode: proj.projectCode, ownerName: proj.ownerName, siteLocation: proj.siteLocation, status: proj.status, income, materialCost, salaryCost, totalExpense, netProfit: income - totalExpense }
  })

  // Supplier-wise spend
  const supplierSpend: Record<string, { name: string; totalSpend: number; purchaseCount: number }> = {}
  for (const p of purchases) {
    if (!supplierSpend[p.supplierId]) supplierSpend[p.supplierId] = { name: p.supplier.name, totalSpend: 0, purchaseCount: 0 }
    supplierSpend[p.supplierId].totalSpend += p.totalCost
    supplierSpend[p.supplierId].purchaseCount += 1
  }

  // Material category spend
  const categoryCost: Record<string, { name: string; totalCost: number }> = {}
  for (const p of purchases) {
    const catName = p.material.category.name
    if (!categoryCost[catName]) categoryCost[catName] = { name: catName, totalCost: 0 }
    categoryCost[catName].totalCost += p.totalCost
  }

  // Overall
  const totalIncome = financials.filter((f) => ['RECEIPT', 'ADVANCE'].includes(f.entryType)).reduce((s, f) => s + f.amount, 0)
  const totalMaterialCost = purchases.reduce((s, p) => s + p.totalCost, 0)
  const totalSalaryCost = salaryEntries.reduce((s, e) => s + e.amount, 0)
  const totalExpense = totalMaterialCost + totalSalaryCost
  const netProfit = totalIncome - totalExpense

  return NextResponse.json({
    projectPnL,
    supplierSpend: Object.values(supplierSpend).sort((a, b) => b.totalSpend - a.totalSpend),
    categoryCost: Object.values(categoryCost).sort((a, b) => b.totalCost - a.totalCost),
    summary: { totalIncome, totalMaterialCost, totalSalaryCost, totalExpense, netProfit },
    totalPurchases: purchases.length,
    totalSalaryEntries: salaryEntries.length,
  })
}
