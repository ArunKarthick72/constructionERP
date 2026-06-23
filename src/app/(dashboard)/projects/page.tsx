'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, FolderOpen, Search, MapPin, Calendar } from 'lucide-react'
import { formatCurrency, formatDate, formatDateInput } from '@/lib/utils'
import { RoleGuard } from '@/components/role-guard'

interface Project {
  id: string; projectCode: string; ownerName: string; ownerPhone: string | null
  siteLocation: string; startDate: string; endDate: string | null; status: string
  totalBudget: number | null; notes: string | null
  _count: { purchases: number; financials: number; salaryEntries: number }
}

const emptyForm = {
  ownerName: '', ownerPhone: '', siteLocation: '', startDate: '', endDate: '',
  status: 'ACTIVE', totalBudget: '', notes: ''
}

const statusBadge: Record<string, string> = {
  ACTIVE: 'badge-green', COMPLETED: 'badge-blue', ON_HOLD: 'badge-yellow'
}
const statusLabel: Record<string, string> = {
  ACTIVE: 'Active / செயலில்', COMPLETED: 'Completed / முடிந்தது', ON_HOLD: 'On Hold / நிறுத்தம்'
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  const fetch_ = async () => { const r = await fetch('/api/projects'); setProjects(await r.json()) }
  useEffect(() => { fetch_() }, [])

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, startDate: new Date().toISOString().split('T')[0] }); setModalOpen(true) }
  const openEdit = (p: Project) => {
    setEditing(p)
    setForm({ ownerName: p.ownerName, ownerPhone: p.ownerPhone ?? '', siteLocation: p.siteLocation, startDate: formatDateInput(p.startDate), endDate: p.endDate ? formatDateInput(p.endDate) : '', status: p.status, totalBudget: p.totalBudget?.toString() ?? '', notes: p.notes ?? '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      if (editing) {
        await fetch(`/api/projects/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      } else {
        await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      }
      await fetch_(); setModalOpen(false)
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete project and all linked records?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' }); await fetch_()
  }

  const filtered = projects.filter((p) => {
    const matchSearch = p.ownerName.toLowerCase().includes(search.toLowerCase()) || p.projectCode.toLowerCase().includes(search.toLowerCase()) || p.siteLocation.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || p.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPERVISOR', 'ACCOUNTANT']}>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Projects <span className="tamil text-slate-400 text-lg font-normal">திட்டங்கள்</span></h1>
            <p className="page-subtitle">{projects.filter((p) => p.status === 'ACTIVE').length} active · {projects.length} total</p>
          </div>
          <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> New Project / புதிய திட்டம்</button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by owner, code, location..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select w-auto min-w-40">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FolderOpen className="w-8 h-8" /></div>
            <h3 className="text-slate-300 font-medium mb-1">No projects yet</h3>
            <p className="text-slate-500 text-sm tamil">இன்னும் திட்டம் இல்லை</p>
            <button onClick={openAdd} className="btn-primary mt-4"><Plus className="w-4 h-4" /> Add First Project</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="card hover:border-brand-600/40 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-brand-400 bg-brand-600/10 px-2 py-0.5 rounded">{p.projectCode}</span>
                      <span className={`badge ${statusBadge[p.status]}`}>{statusLabel[p.status]}</span>
                    </div>
                    <h3 className="font-semibold text-slate-100">{p.ownerName}</h3>
                    {p.ownerPhone && <p className="text-slate-400 text-sm">{p.ownerPhone}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-600/10 transition-all"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-600/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-400"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{p.siteLocation}</div>
                  <div className="flex items-center gap-2 text-slate-400"><Calendar className="w-3.5 h-3.5" />{formatDate(p.startDate)}{p.endDate ? ` → ${formatDate(p.endDate)}` : ''}</div>
                  {p.totalBudget && <div className="text-emerald-400 font-medium">Budget: {formatCurrency(p.totalBudget)}</div>}
                </div>
                <div className="divider" />
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>{p._count.purchases} purchases</span>
                  <span>{p._count.financials} financial entries</span>
                  <span>{p._count.salaryEntries} salaries</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal max-w-xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-semibold text-slate-100">{editing ? 'Edit Project' : 'New Project'} · <span className="tamil text-slate-400 font-normal">{editing ? 'திருத்து' : 'புதிய திட்டம்'}</span></h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xl">×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div>
                      <label className="label">Owner Name * / உரிமையாளர் பெயர்</label>
                      <input className="input" required value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Owner full name" />
                    </div>
                    <div>
                      <label className="label">Owner Phone / தொலைபேசி</label>
                      <input className="input" value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Site Location * / தள இடம்</label>
                      <input className="input" required value={form.siteLocation} onChange={(e) => setForm({ ...form, siteLocation: e.target.value })} placeholder="Full site address" />
                    </div>
                    <div>
                      <label className="label">Start Date * / தொடக்க தேதி</label>
                      <input className="input" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">End Date / முடிவு தேதி</label>
                      <input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Status / நிலை</label>
                      <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="ACTIVE">Active / செயலில்</option>
                        <option value="COMPLETED">Completed / முடிந்தது</option>
                        <option value="ON_HOLD">On Hold / நிறுத்தம்</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Total Budget (₹) / மொத்த பட்ஜெட்</label>
                      <input className="input" type="number" value={form.totalBudget} onChange={(e) => setForm({ ...form, totalBudget: e.target.value })} placeholder="0.00" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Notes / குறிப்புகள்</label>
                      <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : editing ? 'Update Project' : 'Create Project'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
