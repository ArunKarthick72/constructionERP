import { prisma } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DashboardCharts } from '@/components/dashboard-charts'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import {
  FolderOpen, ShoppingCart, Users2, Warehouse,
  TrendingUp, TrendingDown, AlertTriangle, IndianRupee,
  Hammer, Wrench, ChevronRight
} from 'lucide-react'

async function getDashboardData() {
  const [
    activeProjects,
    totalSuppliers,
    totalEmployees,
    totalPurchases,
    totalFinancials,
    totalSalaries,
    recentPurchases,
    monthlyExpenses,
    totalUsages,
    totalSmallWorks,
    recentUsages,
    materials,
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
    prisma.materialUsage.count(),
    prisma.smallWork.count(),
    prisma.materialUsage.findMany({
      take: 5,
      orderBy: { usageDate: 'desc' },
      include: { material: true, project: true },
    }),
    prisma.material.findMany(),
  ])

  // Count low stock materials
  let lowStockCount = 0
  await Promise.all(
    materials.map(async (m) => {
      const lastEntry = await prisma.stockLedger.findFirst({
        where: { materialId: m.id },
        orderBy: { txnDate: 'desc' },
      })
      const stock = lastEntry?.balanceAfter ?? 0
      if (stock <= 10) {
        lowStockCount++
      }
    })
  )

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
    totalUsages,
    totalSmallWorks,
    recentUsages,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? 'ADMIN'
  const userName = session?.user?.name ?? 'User'
  const data = await getDashboardData()

  // Conditional View for Site Supervisor
  if (role === 'SUPERVISOR') {
    const supervisorKpis = [
      {
        label: 'Active Projects',
        labelTA: 'செயலில் உள்ள திட்டங்கள்',
        value: data.activeProjects,
        icon: FolderOpen,
        iconBg: 'bg-brand-600/20',
        iconColor: 'text-brand-400',
      },
      {
        label: 'Material Usages',
        labelTA: 'பொருள் பயன்பாடுகள்',
        value: data.totalUsages,
        icon: Hammer,
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
      },
      {
        label: 'Small Works',
        labelTA: 'சிறிய வேலைகள்',
        value: data.totalSmallWorks,
        icon: Wrench,
        iconBg: 'bg-indigo-500/20',
        iconColor: 'text-indigo-400',
      },
      {
        label: 'Low Stock Alerts',
        labelTA: 'குறைந்த இருப்பு எச்சரிக்கை',
        value: data.lowStockCount,
        icon: AlertTriangle,
        iconBg: data.lowStockCount > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20',
        iconColor: data.lowStockCount > 0 ? 'text-red-400' : 'text-emerald-400',
      },
    ]

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">
            Supervisor Portal <span className="tamil text-slate-400 text-lg font-normal">மேற்பார்வையாளர் போர்டல்</span>
          </h1>
          <p className="page-subtitle">Welcome back, {userName} · கட்டுமான கள மேலாண்மை</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {supervisorKpis.map((kpi) => {
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Panel */}
          <div className="card h-fit">
            <h3 className="section-title">
              Quick Actions · <span className="tamil text-slate-400 font-normal">விரைவு செயல்பாடுகள்</span>
            </h3>
            <div className="space-y-3 mt-4">
              {[
                { label: 'Record Material Usage', labelTA: 'பொருள் பயன்பாடு பதிவு', href: '/material-usage', icon: Hammer, color: 'text-amber-400 hover:bg-amber-500/5' },
                { label: 'Record Small Work', labelTA: 'சிறிய வேலை பதிவு', href: '/small-works', icon: Wrench, color: 'text-indigo-400 hover:bg-indigo-500/5' },
                { label: 'Check Warehouse Stock', labelTA: 'கிடங்கு பொருளிருப்பு', href: '/warehouse', icon: Warehouse, color: 'text-brand-400 hover:bg-brand-500/5' },
                { label: 'View Sites & Projects', labelTA: 'திட்டங்கள் விபரம்', href: '/projects', icon: FolderOpen, color: 'text-slate-300 hover:bg-slate-500/5' },
              ].map((act) => {
                const Icon = act.icon
                return (
                  <Link key={act.label} href={act.href}>
                    <span className={`w-full flex items-center justify-between p-3.5 rounded-xl border border-surface-600 bg-surface-800 transition-all duration-200 group ${act.color} mt-2`}>
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <div>
                          <p className="text-sm font-semibold">{act.label}</p>
                          <p className="text-xs text-slate-500 tamil">{act.labelTA}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Usage Panel */}
          <div className="card lg:col-span-2">
            <h2 className="section-title">
              <Hammer className="w-5 h-5 text-amber-400" />
              Recent Material Usages · <span className="tamil text-slate-400 font-normal">சமீபத்திய பயன்பாடுகள்</span>
            </h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Material / பொருள்</th>
                    <th>Project / திட்டம்</th>
                    <th>Qty / அளவு</th>
                    <th>Date / தேதி</th>
                    <th>Notes / குறிப்பு</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentUsages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-500 py-8">
                        No usages recorded yet · <span className="tamil">பயன்பாடு இல்லை</span>
                      </td>
                    </tr>
                  ) : (
                    data.recentUsages.map((u) => (
                      <tr key={u.id}>
                        <td className="font-medium">{u.material.name}</td>
                        <td>
                          <span className="text-xs font-mono text-brand-400">{u.project.projectCode}</span>
                        </td>
                        <td className="text-amber-400 font-medium">{u.quantity} {u.unit}</td>
                        <td className="text-slate-400">{formatDate(u.usageDate)}</td>
                        <td className="text-slate-500 text-xs truncate max-w-[150px]">{u.notes ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Admin and Accountant View
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
