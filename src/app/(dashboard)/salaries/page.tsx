'use client'

import { useState, useEffect } from 'react'
import { Plus, HardHat, Search } from 'lucide-react'
import { formatCurrency, formatDate, formatDateInput, ROLES } from '@/lib/utils'
import { RoleGuard } from '@/components/role-guard'

interface Employee { id: string; name: string; role: string }
interface Project { id: string; projectCode: string; ownerName: string }
interface SalaryEntry {
  id: string; employeeId: string; projectId: string | null; payType: string
  amount: number; daysWorked: number | null; periodFrom: string; periodTo: string
  paidDate: string; notes: string | null; employee: Employee; project: Project | null
}

const PAY_TYPES = [
  { value: 'DAILY', label: 'Daily / நாள் கூலி' },
  { value: 'WEEKLY', label: 'Weekly / வார கூலி' },
  { value: 'MONTHLY', label: 'Monthly / மாத சம்பளம்' },
  { value: 'ADVANCE', label: 'Advance / முன்பணம்' },
]

const emptyForm = { employeeId: '', projectId: '', payType: 'DAILY', amount: '', daysWorked: '', periodFrom: '', periodTo: '', paidDate: '', notes: '' }

export default function SalariesPage() {
  const [entries, setEntries] = useState<SalaryEntry[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [filterEmployee, setFilterEmployee] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  const fetchAll = async () => {
    const [eRes, empRes, pRes] = await Promise.all([fetch('/api/salaries'), fetch('/api/employees'), fetch('/api/projects')])
    setEntries(await eRes.json()); setEmployees(await empRes.json()); setProjects(await pRes.json())
  }
  useEffect(() => { fetchAll() }, [])

  const openAdd = () => {
    const today = new Date().toISOString().split('T')[0]
    setForm({ ...emptyForm, paidDate: today, periodFrom: today, periodTo: today })
    setModalOpen(true)
  }

  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find((e) => e.id === empId)
    setForm((f) => ({ ...f, employeeId: empId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      await fetch('/api/salaries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      await fetchAll(); setModalOpen(false)
    } finally { setLoading(false) }
  }

  const filtered = entries.filter((e) => {
    const matchSearch = e.employee.name.toLowerCase().includes(search.toLowerCase())
    const matchEmp = !filterEmployee || e.employeeId === filterEmployee
    return matchSearch && matchEmp
  })

  const totalPaid = filtered.reduce((s, e) => s + e.amount, 0)

  return (
    <RoleGuard allowedRoles={['ADMIN', 'ACCOUNTANT']}>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Salaries <span className="tamil text-slate-400 text-lg font-normal">சம்பளம்</span></h1>
            <p className="page-subtitle">Total paid: {formatCurrency(totalPaid)} · {entries.length} entries</p>
          </div>
          <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Record Salary / சம்பளம் பதிவு</button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
          </div>
          <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)} className="select w-auto min-w-48">
            <option value="">All Employees / அனைவரும்</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Paid Date / தேதி</th>
                  <th>Employee / ஊழியர்</th>
                  <th>Role / பங்கு</th>
                  <th>Pay Type / வகை</th>
                  <th>Period / காலம்</th>
                  <th>Days</th>
                  <th>Project</th>
                  <th>Amount / தொகை</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-slate-500 py-10">
                    <div className="flex flex-col items-center gap-2">
                      <HardHat className="w-8 h-8 text-slate-600" />
                      <span className="tamil">இன்னும் சம்பள பதிவு இல்லை</span>
                      <button onClick={openAdd} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Record Salary</button>
                    </div>
                  </td></tr>
                ) : (
                  filtered.map((e) => {
                    const role = ROLES[e.employee.role as keyof typeof ROLES]
                    return (
                      <tr key={e.id}>
                        <td className="text-slate-400 text-xs">{formatDate(e.paidDate)}</td>
                        <td className="font-medium">{e.employee.name}</td>
                        <td><span className="tamil text-xs text-slate-400">{role?.ta}</span></td>
                        <td><span className="badge badge-blue text-xs">{e.payType}</span></td>
                        <td className="text-slate-400 text-xs">{formatDate(e.periodFrom)} → {formatDate(e.periodTo)}</td>
                        <td className="text-slate-400">{e.daysWorked ?? '—'}</td>
                        <td>{e.project ? <span className="text-xs font-mono text-brand-400">{e.project.projectCode}</span> : <span className="text-slate-500">—</span>}</td>
                        <td className="text-emerald-400 font-semibold">{formatCurrency(e.amount)}</td>
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
            <div className="modal max-w-xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-semibold text-slate-100">Record Salary · <span className="tamil text-slate-400 font-normal">சம்பளம் பதிவு</span></h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xl">×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div>
                      <label className="label">Employee * / ஊழியர்</label>
                      <select className="select" required value={form.employeeId} onChange={(e) => handleEmployeeChange(e.target.value)}>
                        <option value="">Select employee...</option>
                        {employees.map((e) => <option key={e.id} value={e.id}>{e.name} — {ROLES[e.role as keyof typeof ROLES]?.ta}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Pay Type / வகை *</label>
                      <select className="select" value={form.payType} onChange={(e) => setForm({ ...form, payType: e.target.value })}>
                        {PAY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Period From * / தொடக்கம்</label>
                      <input className="input" type="date" required value={form.periodFrom} onChange={(e) => setForm({ ...form, periodFrom: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Period To * / முடிவு</label>
                      <input className="input" type="date" required value={form.periodTo} onChange={(e) => setForm({ ...form, periodTo: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Amount (₹) * / தொகை</label>
                      <input className="input" type="number" required step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="label">Days Worked / வேலை நாட்கள்</label>
                      <input className="input" type="number" step="0.5" value={form.daysWorked} onChange={(e) => setForm({ ...form, daysWorked: e.target.value })} placeholder="0" />
                    </div>
                    <div>
                      <label className="label">Paid Date * / தொகை கொடுத்த தேதி</label>
                      <input className="input" type="date" required value={form.paidDate} onChange={(e) => setForm({ ...form, paidDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Project / திட்டம்</label>
                      <select className="select" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                        <option value="">Not project-specific</option>
                        {projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode} — {p.ownerName}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Notes / குறிப்பு</label>
                      <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Payment details..." />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Record Salary'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
