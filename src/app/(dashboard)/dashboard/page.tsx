import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { DashboardCharts } from '@/components/dashboard-charts'
import {
  FolderOpen, ShoppingCart, Users2, Warehouse,
  TrendingUp, TrendingDown, AlertTriangle, IndianRupee
} from 'lucide-react'

async function getDashboardData() {
  const [
    activeProjects,
    totalSuppliers,
    totalEmployees,
    totalPurchases,
    totalFinancials,
    totalSalaries,
    lowStockCount,
    recentPurchases,
    monthlyExpenses,
  ] = await Promise.all([
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.supplier.count(),
    prisma.employee.count(),
    prisma.purchase.aggregate({ _sum: { totalCost: true } }),
    prisma.financialEntry.aggregate({
      _sum: { amount: true },
      where: { entryType: { in: ['RECEIPT', 'ADVANCE'] } },
    }),
    prisma.salaryEntry.aggregate({ _sum: { amount: true } }),
    prisma.material.count(),
    prisma.purchase.findMany({
      take: 5,
      orderBy: { purchaseDate: 'desc' },
      include: { material: true, supplier: true, project: true },
    }),
    prisma.purchase.groupBy({
      by: ['purchaseDate'],
      _sum: { totalCost: true },
      orderBy: { purchaseDate: 'asc' },
      take: 7,
    }),
  ])

  return {
    activeProjects,
    totalSuppliers,
    totalEmployees,
    totalPurchase: totalPurchases._sum.totalCost ?? 0,
    totalIncome: totalFinancials._sum.amount ?? 0,
    totalSalary: totalSalaries._sum.amount ?? 0,
    lowStockCount,
    recentPurchases,
    monthlyExpenses,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  const totalExpense = data.totalPurchase + data.totalSalary
  const netBalance = data.totalIncome - totalExpense

  const kpis = [
    {
      label: 'Active Projects',
      labelTA: 'செயலில் உள்ள திட்டங்கள்',
      value: data.activeProjects,
      icon: FolderOpen,
      iconBg: 'bg-brand-600/20',
      iconColor: 'text-brand-400',
      trend: null,
    },
    {
      label: 'Total Income',
      labelTA: 'மொத்த வருமானம்',
      value: formatCurrency(data.totalIncome),
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      trend: 'up',
    },
    {
      label: 'Total Expenses',
      labelTA: 'மொத்த செலவு',
      value: formatCurrency(totalExpense),
      icon: TrendingDown,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      trend: 'down',
    },
    {
      label: 'Net Balance',
      labelTA: 'நிகர இருப்பு',
      value: formatCurrency(netBalance),
      icon: IndianRupee,
      iconBg: netBalance >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20',
      iconColor: netBalance >= 0 ? 'text-emerald-400' : 'text-red-400',
      trend: null,
    },
    {
      label: 'Suppliers',
      labelTA: 'சப்ளையர்கள்',
      value: data.totalSuppliers,
      icon: Users2,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      trend: null,
    },
    {
      label: 'Employees',
      labelTA: 'ஊழியர்கள்',
      value: data.totalEmployees,
      icon: Users2,
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-400',
      trend: null,
    },
    {
      label: 'Purchase Cost',
      labelTA: 'கொள்முதல் செலவு',
      value: formatCurrency(data.totalPurchase),
      icon: ShoppingCart,
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      trend: null,
    },
    {
      label: 'Salary Paid',
      labelTA: 'சம்பளம் கொடுத்தது',
      value: formatCurrency(data.totalSalary),
      icon: IndianRupee,
      iconBg: 'bg-pink-500/20',
      iconColor: 'text-pink-400',
      trend: null,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard <span className="tamil text-slate-400 text-lg font-normal">டாஷ்போர்டு</span></h1>
        <p className="page-subtitle">Welcome to Deivenei Associates ERP · கட்டுமான மேலாண்மை</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="stat-card">
              <div className={`stat-icon ${kpi.iconBg}`}>
                <Icon className={`w-6 h-6 ${kpi.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="kpi-value truncate">{kpi.value}</p>
                <p className="kpi-label">{kpi.label}</p>
                <p className="text-[10px] text-slate-500 tamil">{kpi.labelTA}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <DashboardCharts
        monthlyExpenses={data.monthlyExpenses.map((m) => ({
          date: new Date(m.purchaseDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          amount: m._sum.totalCost ?? 0,
        }))}
        expenseBreakdown={[
          { name: 'Materials', value: data.totalPurchase },
          { name: 'Salaries', value: data.totalSalary },
        ]}
        netBalance={netBalance}
        totalIncome={data.totalIncome}
        totalExpense={totalExpense}
      />

      {/* Recent Purchases */}
      <div className="card">
        <h2 className="section-title">
          <ShoppingCart className="w-5 h-5 text-brand-400" />
          Recent Purchases · <span className="tamil text-slate-400 font-normal">சமீபத்திய கொள்முதல்</span>
        </h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Material / பொருள்</th>
                <th>Supplier / சப்ளையர்</th>
                <th>Project / திட்டம்</th>
                <th>Qty</th>
                <th>Amount / தொகை</th>
                <th>Date / தேதி</th>
              </tr>
            </thead>
            <tbody>
              {data.recentPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500 py-8">
                    No purchases yet · <span className="tamil">இன்னும் கொள்முதல் இல்லை</span>
                  </td>
                </tr>
              ) : (
                data.recentPurchases.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.material.name}</td>
                    <td className="text-slate-400">{p.supplier.name}</td>
                    <td className="text-slate-400">{p.project?.projectCode ?? '—'}</td>
                    <td>{p.quantity} {p.unit}</td>
                    <td className="text-emerald-400 font-medium">{formatCurrency(p.totalCost)}</td>
                    <td className="text-slate-400">{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
