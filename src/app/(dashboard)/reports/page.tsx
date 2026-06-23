'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, IndianRupee, Download, FileText, PieChart as PieIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { RoleGuard } from '@/components/role-guard'

const COLORS = ['#6366f1', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

interface ProjectPnLItem {
  projectCode: string
  ownerName: string
  siteLocation: string
  status: string
  income: number
  materialCost: number
  salaryCost: number
  totalExpense: number
  netProfit: number
}

interface SupplierSpendItem {
  name: string
  totalSpend: number
  purchaseCount: number
}

interface CategoryCostItem {
  name: string
  totalCost: number
}

interface ReportData {
  projectPnL: ProjectPnLItem[]
  supplierSpend: SupplierSpendItem[]
  categoryCost: CategoryCostItem[]
  summary: {
    totalIncome: number
    totalMaterialCost: number
    totalSalaryCost: number
    totalExpense: number
    netProfit: number
  }
  totalPurchases: number
  totalSalaryEntries: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-700 border border-surface-600 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color ?? p.fill }} className="font-medium">
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'projects' | 'suppliers' | 'materials'>('overview')

  const fetchData = async () => {
    setLoading(true)
    const r = await fetch('/api/reports')
    setData(await r.json())
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const exportCSV = () => {
    if (!data) return
    let rows: any[] = []
    let filename = 'report'

    if (tab === 'projects') {
      rows = data.projectPnL
      filename = 'project_pnl_report'
    } else if (tab === 'suppliers') {
      rows = data.supplierSpend
      filename = 'supplier_spend_report'
    } else if (tab === 'materials') {
      rows = data.categoryCost
      filename = 'material_category_spend_report'
    } else {
      // Overview summary as rows
      rows = [
        { Metric: 'Total Receipts (Income)', Amount: data.summary.totalIncome },
        { Metric: 'Total Material Cost', Amount: data.summary.totalMaterialCost },
        { Metric: 'Total Salary Cost', Amount: data.summary.totalSalaryCost },
        { Metric: 'Total Expense', Amount: data.summary.totalExpense },
        { Metric: 'Net Profit', Amount: data.summary.netProfit },
        { Metric: 'Total Purchases', Amount: data.totalPurchases },
        { Metric: 'Total Salary Entries', Amount: data.totalSalaryEntries },
      ]
      filename = 'overview_report'
    }

    if (!rows.length) return
    const keys = Object.keys(rows[0])
    const csv = [
      keys.join(','),
      ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename + '.csv'
    a.click()
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <RoleGuard allowedRoles={['ADMIN', 'ACCOUNTANT']}>
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-10 h-10" />
        </div>
      </RoleGuard>
    )
  }

  if (!data) return null

  const { summary } = data

  const TABS = [
    { id: 'overview', label: 'Overview', labelTA: 'கண்ணோட்டம்' },
    { id: 'projects', label: 'Project P&L', labelTA: 'திட்ட லாப நஷ்டம்' },
    { id: 'suppliers', label: 'Supplier Spend', labelTA: 'சப்ளையர் செலவு' },
    { id: 'materials', label: 'Material Cost Summary', labelTA: 'பொருள் செலவு' },
  ]

  return (
    <RoleGuard allowedRoles={['ADMIN', 'ACCOUNTANT']}>
      <div className="space-y-6 print:space-y-4 print:p-0">
        {/* Header */}
        <div className="page-header print:hidden">
          <div>
            <h1 className="page-title">
              Reports & Analytics <span className="tamil text-slate-400 text-lg font-normal">அறிக்கைகள்</span>
            </h1>
            <p className="page-subtitle">
              Financial health, site margins, and material costs · நிதிநிலை மற்றும் செயல்பாட்டு அறிக்கை
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="btn-secondary text-sm">
              <Download className="w-4 h-4" /> Export CSV / சி.எஸ்.வி
            </button>
            <button onClick={handlePrint} className="btn-primary text-sm">
              <FileText className="w-4 h-4" /> Print / அச்சிடுக
            </button>
          </div>
        </div>

        {/* Print Only Header */}
        <div className="hidden print:block border-b border-slate-700 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-slate-100">Deivenei Associates ERP</h1>
          <p className="text-slate-400 text-sm">Reports & Analytics Report — {new Date().toLocaleDateString('en-IN')}</p>
        </div>

        {/* Tabs Bar */}
        <div className="flex gap-1 bg-surface-800 border border-surface-600 rounded-xl p-1 w-fit print:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
              <span className="text-[10px] block opacity-80 tamil font-normal leading-none mt-0.5">{t.labelTA}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:grid-cols-5">
              {[
                {
                  label: 'Total Receipts',
                  labelTA: 'மொத்த வரவு',
                  value: formatCurrency(summary.totalIncome),
                  color: 'text-emerald-400',
                  icon: TrendingUp,
                  bg: 'bg-emerald-500/20',
                },
                {
                  label: 'Material Cost',
                  labelTA: 'பொருள் செலவு',
                  value: formatCurrency(summary.totalMaterialCost),
                  color: 'text-orange-400',
                  icon: TrendingDown,
                  bg: 'bg-orange-500/20',
                },
                {
                  label: 'Salary Cost',
                  labelTA: 'சம்பள செலவு',
                  value: formatCurrency(summary.totalSalaryCost),
                  color: 'text-blue-400',
                  icon: TrendingDown,
                  bg: 'bg-blue-500/20',
                },
                {
                  label: 'Total Expenses',
                  labelTA: 'மொத்த செலவு',
                  value: formatCurrency(summary.totalExpense),
                  color: 'text-red-400',
                  icon: TrendingDown,
                  bg: 'bg-red-500/20',
                },
                {
                  label: 'Net Profit',
                  labelTA: 'நிகர லாபம்',
                  value: formatCurrency(summary.netProfit),
                  color: summary.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400',
                  icon: IndianRupee,
                  bg: summary.netProfit >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20',
                },
              ].map((kpi) => {
                const Icon = kpi.icon
                return (
                  <div key={kpi.label} className="stat-card">
                    <div className={`stat-icon ${kpi.bg}`}>
                      <Icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-base md:text-lg font-bold truncate ${kpi.color}`}>{kpi.value}</p>
                      <p className="text-xs text-slate-400">{kpi.label}</p>
                      <p className="text-[10px] text-slate-500 tamil">{kpi.labelTA}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:space-y-6">
              {/* Expense Breakdown Pie */}
              <div className="card">
                <h3 className="section-title">
                  <PieIcon className="w-5 h-5 text-brand-400" />
                  Expense Breakdown · <span className="tamil text-slate-400 font-normal">செலவு பிரிவு</span>
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Materials', value: summary.totalMaterialCost },
                          { name: 'Salaries', value: summary.totalSalaryCost },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        innerRadius={55}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#f97316" />
                        <Cell fill="#6366f1" />
                      </Pie>
                      <Tooltip formatter={(v: any) => formatCurrency(v)} />
                      <Legend formatter={(v) => <span className="text-slate-300 text-xs">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Cost Bar Chart */}
              <div className="card">
                <h3 className="section-title">
                  <BarChart3 className="w-5 h-5 text-brand-400" />
                  Category Spend · <span className="tamil text-slate-400 font-normal">வகை செலவு</span>
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.categoryCost} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="totalCost" name="Spend" radius={[4, 4, 0, 0]}>
                        {data.categoryCost.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project P&L Tab */}
        {tab === 'projects' && (
          <div className="card">
            <h3 className="section-title">
              <FileText className="w-5 h-5 text-brand-400" />
              Project-wise P&L · <span className="tamil text-slate-400 font-normal">திட்டவாரி லாப நஷ்ட கணக்கு</span>
            </h3>
            <div className="table-container">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>Code / குறியீடு</th>
                    <th>Owner / உரிமையாளர்</th>
                    <th>Site Location / தளம்</th>
                    <th>Status</th>
                    <th>Receipts / வரவு</th>
                    <th>Material Cost / பொருட்கள்</th>
                    <th>Salaries / சம்பளம்</th>
                    <th>Total Expenses / செலவு</th>
                    <th>Net Profit / லாபம்</th>
                  </tr>
                </thead>
                <tbody>
                  {data.projectPnL.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-slate-500 py-8">
                        No project records found · <span className="tamil">திட்டங்கள் எதுவும் இல்லை</span>
                      </td>
                    </tr>
                  ) : (
                    data.projectPnL.map((p, idx) => (
                      <tr key={idx}>
                        <td className="font-mono font-bold text-brand-400 text-xs">{p.projectCode}</td>
                        <td className="font-medium">{p.ownerName}</td>
                        <td className="text-slate-400 text-xs">{p.siteLocation}</td>
                        <td>
                          <span
                            className={`badge ${
                              p.status === 'ACTIVE'
                                ? 'badge-green'
                                : p.status === 'COMPLETED'
                                ? 'badge-blue'
                                : 'badge-yellow'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="text-emerald-400 font-medium">{formatCurrency(p.income)}</td>
                        <td className="text-slate-400">{formatCurrency(p.materialCost)}</td>
                        <td className="text-slate-400">{formatCurrency(p.salaryCost)}</td>
                        <td className="text-red-400 font-medium">{formatCurrency(p.totalExpense)}</td>
                        <td className={`font-bold ${p.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {p.netProfit >= 0 ? '+' : ''}
                          {formatCurrency(p.netProfit)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {tab === 'suppliers' && (
          <div className="card max-w-3xl">
            <h3 className="section-title">
              Supplier Volume Analysis · <span className="tamil text-slate-400 font-normal">சப்ளையர் கொள்முதல் செலவு</span>
            </h3>
            <div className="table-container">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>Supplier / சப்ளையர்</th>
                    <th className="w-40">Purchase Transactions / எண்ணிக்கை</th>
                    <th>Total Spend / மொத்த கொள்முதல்</th>
                  </tr>
                </thead>
                <tbody>
                  {data.supplierSpend.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-slate-500 py-8">
                        No transactions found · <span className="tamil">கொள்முதல் இல்லை</span>
                      </td>
                    </tr>
                  ) : (
                    data.supplierSpend.map((s, idx) => (
                      <tr key={idx}>
                        <td className="font-medium">{s.name}</td>
                        <td>
                          <span className="badge badge-blue">{s.purchaseCount}</span>
                        </td>
                        <td className="text-emerald-400 font-semibold">{formatCurrency(s.totalSpend)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {tab === 'materials' && (
          <div className="card max-w-3xl">
            <h3 className="section-title">
              Material Category Expenditures · <span className="tamil text-slate-400 font-normal">பொருட்களின் செலவு விபரம்</span>
            </h3>
            <div className="table-container">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>Category Name / வகை பெயர்</th>
                    <th>Total Spend / மொத்த செலவு</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categoryCost.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center text-slate-500 py-8">
                        No category data found · <span className="tamil">வகை செலவு இல்லை</span>
                      </td>
                    </tr>
                  ) : (
                    data.categoryCost.map((c, i) => (
                      <tr key={i}>
                        <td className="font-medium">{c.name}</td>
                        <td className="text-amber-400 font-semibold">{formatCurrency(c.totalCost)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}