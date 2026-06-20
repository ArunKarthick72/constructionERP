'use client'

import { useState, useEffect } from 'react'
import { Plus, Wallet, Filter, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatDate, formatDateInput } from '@/lib/utils'

interface Project { id: string; projectCode: string; ownerName: string }
interface FinancialEntry {
  id: string; projectId: string; entryType: string; amount: number
  description: string | null; entryDate: string; referenceNo: string | null
  project: Project
}

const ENTRY_TYPES = [
  { value: 'ADVANCE', label: 'Advance / முன்பணம்', badge: 'badge-yellow' },
  { value: 'RECEIPT', label: 'Receipt / பெறப்பட்ட', badge: 'badge-green' },
  { value: 'EXPENSE', label: 'Expense / செலவு', badge: 'badge-red' },
  { value: 'REFUND', label: 'Refund / திரும்ப', badge: 'badge-blue' },
]

const emptyForm = { projectId: '', entryType: 'RECEIPT', amount: '', description: '', entryDate: '', referenceNo: '' }

export default function FinancialsPage() {
  const [entries, setEntries] = useState<FinancialEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filterProject, setFilterProject] = useState('')
  const [filterType, setFilterType] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  const fetchAll = async () => {
    const [eRes, pRes] = await Promise.all([fetch('/api/financials'), fetch('/api/projects')])
    setEntries(await eRes.json())
    setProjects(await pRes.json())
  }
  useEffect(() => { fetchAll() }, [])

  const openAdd = () => {
    setForm({ ...emptyForm, entryDate: new Date().toISOString().split('T')[0], projectId: projects[0]?.id ?? '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      await fetch('/api/financials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      await fetchAll(); setModalOpen(false)
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/financials/${id}`, { method: 'DELETE' }); await fetchAll()
  }

  const filtered = entries.filter((e) => {
    return (!filterProject || e.projectId === filterProject) && (!filterType || e.entryType === filterType)
  })

  // Running balance
  const totalIn = filtered.filter((e) => ['RECEIPT', 'ADVANCE'].includes(e.entryType)).reduce((s, e) => s + e.amount, 0)
  const totalOut = filtered.filter((e) => ['EXPENSE', 'REFUND'].includes(e.entryType)).reduce((s, e) => s + e.amount, 0)
  const balance = totalIn - totalOut

  const getTypeInfo = (type: string) => ENTRY_TYPES.find((t) => t.value === type) ?? ENTRY_TYPES[0]

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financials <span className="tamil text-slate-400 text-lg font-normal">நிதி</span></h1>
          <p className="page-subtitle">Date-wise ledger for all sites · அனைத்து தளங்களுக்கான தேதிவாரி கணக்கு</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Entry / பதிவு சேர்</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-emerald-500/20"><TrendingUp className="w-6 h-6 text-emerald-400" /></div>
          <div><p className="kpi-value">{formatCurrency(totalIn)}</p><p className="kpi-label">Total Income / மொத்த வருமானம்</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red-500/20"><TrendingDown className="w-6 h-6 text-red-400" /></div>
          <div><p className="kpi-value">{formatCurrency(totalOut)}</p><p className="kpi-label">Total Outflow / மொத்த வெளிச்செலவு</p></div>
        </div>
        <div className="stat-card">
          <div className={`stat-icon ${balance >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            <Wallet className={`w-6 h-6 ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
          <div><p className={`kpi-value ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(balance)}</p><p className="kpi-label">Balance / இருப்பு</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="select w-auto min-w-52">
          <option value="">All Projects / அனைத்து திட்டங்கள்</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode} — {p.ownerName}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="select w-auto min-w-40">
          <option value="">All Types</option>
          {ENTRY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date / தேதி</th>
                <th>Project / திட்டம்</th>
                <th>Type / வகை</th>
                <th>Description / விவரம்</th>
                <th>Ref No</th>
                <th>Amount / தொகை</th>
                <th className="w-16">Del</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-500 py-8 tamil">இன்னும் நிதி பதிவு இல்லை</td></tr>
              ) : (
                filtered.map((e) => {
                  const typeInfo = getTypeInfo(e.entryType)
                  const isIncome = ['RECEIPT', 'ADVANCE'].includes(e.entryType)
                  return (
                    <tr key={e.id}>
                      <td className="text-slate-400">{formatDate(e.entryDate)}</td>
                      <td>
                        <span className="text-xs font-mono text-brand-400">{e.project.projectCode}</span>
                        <span className="text-slate-400 ml-1 text-xs">{e.project.ownerName}</span>
                      </td>
                      <td><span className={`badge ${typeInfo.badge}`}>{e.entryType}</span></td>
                      <td className="text-slate-400">{e.description ?? '—'}</td>
                      <td className="text-slate-500 text-xs">{e.referenceNo ?? '—'}</td>
                      <td className={`font-semibold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isIncome ? '+' : '-'} {formatCurrency(e.amount)}
                      </td>
                      <td>
                        <button onClick={() => handleDelete(e.id)} className="text-slate-500 hover:text-red-400 transition-colors text-lg leading-none">×</button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-slate-100">Add Financial Entry · <span className="tamil text-slate-400 font-normal">நிதி பதிவு சேர்</span></h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="label">Project * / திட்டம்</label>
                  <select className="select" required value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                    <option value="">Select project...</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode} — {p.ownerName}</option>)}
                  </select>
                </div>
                <div className="form-grid">
                  <div>
                    <label className="label">Entry Type / வகை *</label>
                    <select className="select" value={form.entryType} onChange={(e) => setForm({ ...form, entryType: e.target.value })}>
                      {ENTRY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Date / தேதி *</label>
                    <input className="input" type="date" required value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Amount (₹) * / தொகை</label>
                    <input className="input" type="number" required step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="label">Reference No / குறிப்பு எண்</label>
                    <input className="input" value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} placeholder="Cheque/UPI ref" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Description / விவரம்</label>
                    <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Payment details..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Add Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
