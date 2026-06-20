'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, UserCheck, Search } from 'lucide-react'
import { ROLES, formatCurrency, formatDate, formatDateInput } from '@/lib/utils'

interface Employee {
  id: string; name: string; phone: string | null; role: string
  dailyWage: number | null; monthlyWage: number | null
  joinDate: string | null; notes: string | null
  _count: { salaryEntries: number }
}

const emptyForm = { name: '', phone: '', role: 'CHITTHAL', dailyWage: '', monthlyWage: '', joinDate: '', notes: '' }

const roleColors: Record<string, string> = {
  MAESTRI: 'badge-purple', KOTHANAR: 'badge-blue', CHITTHAL: 'badge-orange', ENGINEER: 'badge-green', OTHER: 'badge-yellow'
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  const fetchAll = async () => { const r = await fetch('/api/employees'); setEmployees(await r.json()) }
  useEffect(() => { fetchAll() }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (emp: Employee) => {
    setEditing(emp)
    setForm({ name: emp.name, phone: emp.phone ?? '', role: emp.role, dailyWage: emp.dailyWage?.toString() ?? '', monthlyWage: emp.monthlyWage?.toString() ?? '', joinDate: emp.joinDate ? formatDateInput(emp.joinDate) : '', notes: emp.notes ?? '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      if (editing) {
        await fetch(`/api/employees/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      } else {
        await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      }
      await fetchAll(); setModalOpen(false)
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete employee?')) return
    await fetch(`/api/employees/${id}`, { method: 'DELETE' }); await fetchAll()
  }

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || (e.phone ?? '').includes(search)
    const matchRole = !filterRole || e.role === filterRole
    return matchSearch && matchRole
  })

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees <span className="tamil text-slate-400 text-lg font-normal">ஊழியர்கள்</span></h1>
          <p className="page-subtitle">{employees.length} employees · {Object.keys(ROLES).length} roles</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Employee / ஊழியர் சேர்</button>
      </div>

      {/* Role Badges Summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ROLES).map(([key, role]) => {
          const count = employees.filter((e) => e.role === key).length
          return (
            <button key={key} onClick={() => setFilterRole(filterRole === key ? '' : key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-all ${filterRole === key ? 'bg-brand-600/30 border-brand-500 text-brand-300' : 'border-surface-500 text-slate-400 hover:border-brand-600/30'}`}>
              <span className="tamil font-medium">{role.ta}</span>
              <span className="text-slate-500">({role.en})</span>
              <span className="bg-surface-600 text-slate-300 text-xs px-1.5 py-0.5 rounded-full">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><UserCheck className="w-8 h-8" /></div>
          <h3 className="text-slate-300 font-medium mb-1">No employees found</h3>
          <button onClick={openAdd} className="btn-primary mt-4"><Plus className="w-4 h-4" /> Add Employee</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((emp) => {
            const role = ROLES[emp.role as keyof typeof ROLES]
            return (
              <div key={emp.id} className="card hover:border-brand-600/40 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-violet-700 flex items-center justify-center text-white font-bold">
                      {emp.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">{emp.name}</h3>
                      <span className={`badge ${roleColors[emp.role]} text-xs`}>
                        <span className="tamil">{role?.ta}</span> · {role?.en}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-600/10 transition-all"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(emp.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-600/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  {emp.phone && <p className="text-slate-400">📞 {emp.phone}</p>}
                  {emp.dailyWage && <p className="text-amber-400">Daily: {formatCurrency(emp.dailyWage)}/day</p>}
                  {emp.monthlyWage && <p className="text-emerald-400">Monthly: {formatCurrency(emp.monthlyWage)}/month</p>}
                  {emp.joinDate && <p className="text-slate-500 text-xs">Joined: {formatDate(emp.joinDate)}</p>}
                </div>
                <div className="divider" />
                <p className="text-xs text-slate-500">{emp._count.salaryEntries} salary entries</p>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-slate-100">{editing ? 'Edit Employee' : 'Add Employee'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div>
                    <label className="label">Name * / பெயர்</label>
                    <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Employee name" />
                  </div>
                  <div>
                    <label className="label">Phone / தொலைபேசி</label>
                    <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Role / பங்கு *</label>
                    <select className="select" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      {Object.entries(ROLES).map(([key, role]) => (
                        <option key={key} value={key}>{role.ta} — {role.en}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Daily Wage (₹) / நாள் கூலி</label>
                    <input className="input" type="number" step="0.01" value={form.dailyWage} onChange={(e) => setForm({ ...form, dailyWage: e.target.value })} placeholder="500.00" />
                  </div>
                  <div>
                    <label className="label">Monthly Salary (₹) / மாத சம்பளம்</label>
                    <input className="input" type="number" step="0.01" value={form.monthlyWage} onChange={(e) => setForm({ ...form, monthlyWage: e.target.value })} placeholder="15000.00" />
                  </div>
                  <div>
                    <label className="label">Join Date / சேர்ந்த தேதி</label>
                    <input className="input" type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Notes / குறிப்பு</label>
                    <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : editing ? 'Update Employee' : 'Add Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
