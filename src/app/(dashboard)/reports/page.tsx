'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, IndianRupee, Download, FileText } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#6366f1', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

interface ReportData {
  projectPnL: Array<{ projectCode: string; ownerName: string; siteLocation: string; status: string; income: number; materialCost: number; salaryCost: number; totalExpense: number; netProfit: number }>
  supplierSpend: Array<{ name: string; totalSpend: number; purchaseCount: number }>
  categoryCost: Array<{ name: string; totalCost: number }>
  summary: { totalIncome: number; totalMaterialCost: number; totalSalaryCost: number; totalExpense: number; netProfit: number }
  totalPurchases: number
  totalSalaryEntries: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-700 border border-surface-500 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color ?? p.fill }} className="font-medium">{p.name}: {formatCurrency(p.value)}</p>
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
  useEffect(() => { fetchData() }, [])

  const exportCSV = (rows: any[], filename: string) => {
    if (!rows.length) return
    const keys = Object.keys(rows[0])
    const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename + '.csv'; a.click()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="loading-spinner w-10 h-10" />
    </div>
  )
  if (!data) return null

  const { summary } = data

  const TABS = [
    { id: 'overview', label: 'Overview / கண்ணோட்டம்' },
    { id: 'projects', label: 'Projects P&L / திட்ட லாப நஷ்டம்' },
    { id: 'suppliers', label: 'Suppliers / சப்ளையர்கள்' },
    { id: 'materials', label: 'Materials / பொருட்கள்' },
  ]

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics <span className="tamil text-slate-400 text-lg font-normal">அறிக்கைகள்</span></h1>
          <p className="page-subtitle">Profit & Loss, Expenses, Material Cost Analysis</p>
        </div>
        <button onClick={fetchData} className="btn-secondary">↻ Refresh</button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Income', labelTA: 'மொத்த வருமானம்', value: formatCurrency(summary.totalIncome), color: 'text-emerald-400', icon: TrendingUp, bg: 'bg-emerald-500/20' },
          { label: 'Material Cost', labelTA: 'பொருள் செலவு', value: formatCurrency(summary.totalMaterialCost), color: 'text-amber-400', icon: TrendingDown, bg: 'bg-amber-500/20' },
          { label: 'Salary Cost', labelTA: 'சம்பள செலவு', value: formatCurrency(summary.totalSalaryCost), color: 'text-blue-400', icon: TrendingDown, bg: 'bg-blue-500/20' },
          { label: 'Total Expense', labelTA: 'மொத்த செலவு', value: formatCurrency(summary.totalExpense), color: 'text-red-400', icon: TrendingDown, bg: 'bg-red-500/20' },
          { label: 'Net Profit', labelTA: 'நிகர லாபம்', value: formatCurrency(summary.netProfit), color: summary.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400', icon: IndianRupee, bg: summary.netProfit >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20' },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="stat-card">
              <div className={`stat-icon ${kpi.bg}`}><Icon className={`w-5 h-5 ${kpi.color}`} /></div>
              <div className="min-w-0">
                <p className={`text-lg font-bold truncate ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-slate-400">{kpi.label}</p>
                <p className="text-[10px] text-slate-500 tamil">{kpi.labelTA}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-800 border border-surface-600 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Breakdown Pie */}
          <div className="card">
            <h3 className="section-title"><BarChart3 className="w-5 h-5 text-brand-400" />Expense Breakdown · <span className="tamil text-slate-400 font-normal">செலவு பிரிவு</span></h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={[{ name: 'Materials', value: summary.totalMaterialCost }, { name: 'Salaries', value: summary.totalSalaryCost }]} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4} dataKey="value">
                  {['#6366f1', '#f97316'].map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Legend formatter={(v) => <span className="text-slate-300 text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Cost Bar */}
          <div className="card">
            <h3 className="section-title"><BarChart3 className="w-5 h-5 text-accent-400" />Category Spend · <span className="tamil text-slate-400 font-normal">வகை செலவு</span></h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.categoryCost.map((c) => ({ name: c.name.split(' ')[0], amount: c.totalCost }))} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" name="Spend" radius={[4, 4, 0, 0]}>
                  {data.categoryCost.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Projects P&L Tab */}
      {tab === 'projects' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0"><FileText className="w-5 h-5 text-brand-400" />Project-wise P&L · <span className="tamil text-slate-400 font-normal">திட்ட லாப நஷ்டம்</span></h3>
            <button onClick={() => exportCSV(data.projectPnL, 'project-pnl')} className="btn-secondary text-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Project / திட்டம்</th>
                  <th>Owner / உரிமையாளர்</th>
                  <th>Status</th>
                  <th>Income / வருமானம்</th>
                  <th>Material Cost</th>
                  <th>Salary Cost</th>
                  <th>Total Expense</th>
                  <th>Net Profit / லாபம்</th>
                </tr>
              </thead>
              <tbody>
                {data.projectPnL.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-slate-500 py-8">No project data yet</td></tr>
                ) : (
                  data.projectPnL.map((p) => (
                    <tr key={p.projectCode}>
                      <td><span className="font-mono text-brand-400 text-xs">{p.projectCode}</span></td>
                      <td className="text-slate-300">{p.ownerName}</td>
                      <td><span className={`badge ${p.status === 'ACTIVE' ? 'badge-green' : p.status === 'COMPLETED' ? 'badge-blue' : 'badge-yellow'}`}>{p.status}</span></td>
                      <td className="text-emerald-400">{formatCurrency(p.income)}</td>
                      <td className="text-amber-400">{formatCurrency(p.materialCost)}</td>
                      <td className="text-blue-400">{formatCurrency(p.salaryCost)}</td>
                      <td className="text-red-400">{formatCurrency(p.totalExpense)}</td>
                      <td className={`font-bold ${p.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {p.netProfit >= 0 ? '+' : ''}{formatCurrency(p.netProfit)}
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
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Supplier-wise Spend · <span className="tamil text-slate-400 font-normal">சப்ளையர் செலவு</span></h3>
            <button onClick={() => exportCSV(data.supplierSpend, 'supplier-spend')} className="btn-secondary text-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Supplier / சப்ளையர்</th><th>Purchases / கொள்முதல்</th><th>Total Spend / மொத்த செலவு</th></tr></thead>
              <tbody>
                {data.supplierSpend.length === 0 ? (
                  <tr><td colSpan={3} className="text-center text-slate-500 py-8">No supplier data</td></tr>
                ) : (
                  data.supplierSpend.map((s, i) => (
                    <tr key={i}>
                      <td className="font-medium">{s.name}</td>
                      <td><span className="badge badge-blue">{s.purchaseCount}</span></td>
                      <td className="text-amber-400 font-semibold">{formatCurrency(s.totalSpend)}</td>
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
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Category Cost · <span className="tamil text-slate-400 font-normal">வகை செலவு</span></h3>
            <button onClick={() => exportCSV(data.categoryCost, 'category-cost')} className="btn-secondary text-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Category / வகை</th><th>Total Cost / மொத்த செலவு</th></tr></thead>
              <tbody>
                {data.categoryCost.length === 0 ? (
                  <tr><td colSpan={2} className="text-center text-slate-500 py-8">No category data</td></tr>
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
  )
}
