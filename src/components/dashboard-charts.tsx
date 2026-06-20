'use client'

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#6366f1', '#f97316', '#10b981', '#f59e0b']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-700 border border-surface-500 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

interface DashboardChartsProps {
  monthlyExpenses: { date: string; amount: number }[]
  expenseBreakdown: { name: string; value: number }[]
  netBalance: number
  totalIncome: number
  totalExpense: number
}

export function DashboardCharts({
  monthlyExpenses,
  expenseBreakdown,
  netBalance,
  totalIncome,
  totalExpense,
}: DashboardChartsProps) {
  const summaryData = [
    { name: 'Income', amount: totalIncome },
    { name: 'Expenses', amount: totalExpense },
    { name: 'Net Balance', amount: Math.abs(netBalance) },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Area Chart — Purchase Trend */}
      <div className="card lg:col-span-2">
        <h3 className="section-title text-base mb-4">
          Purchase Trend · <span className="tamil text-slate-400 font-normal">கொள்முதல் போக்கு</span>
        </h3>
        {monthlyExpenses.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
            No data yet — start recording purchases
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyExpenses}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="url(#colorAmount)" strokeWidth={2} name="Purchase" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie Chart — Expense Breakdown */}
      <div className="card">
        <h3 className="section-title text-base mb-4">
          Expense Breakdown · <span className="tamil text-slate-400 font-normal">செலவு பகிர்வு</span>
        </h3>
        {expenseBreakdown.every((e) => e.value === 0) ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No expense data</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {expenseBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Legend
                formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bar Chart — Summary */}
      <div className="card lg:col-span-3">
        <h3 className="section-title text-base mb-4">
          Financial Summary · <span className="tamil text-slate-400 font-normal">நிதி சுருக்கம்</span>
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={summaryData} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} name="Amount">
              {summaryData.map((_, index) => (
                <Cell key={index} fill={['#10b981', '#f97316', '#6366f1'][index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
