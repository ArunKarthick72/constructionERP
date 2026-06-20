'use client'

import { useState, useEffect } from 'react'
import { Plus, Hammer, Search } from 'lucide-react'
import { formatDate, UNITS } from '@/lib/utils'

interface Material { id: string; name: string; unit: string }
interface Project { id: string; projectCode: string; ownerName: string }
interface Usage {
  id: string; projectId: string; materialId: string; quantity: number
  unit: string; usageDate: string; notes: string | null
  project: Project; material: Material
}

const emptyForm = { projectId: '', materialId: '', quantity: '', unit: 'Bags', usageDate: '', notes: '' }

export default function MaterialUsagePage() {
  const [usages, setUsages] = useState<Usage[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
    const [uRes, mRes, pRes] = await Promise.all([fetch('/api/material-usage'), fetch('/api/materials'), fetch('/api/projects')])
    setUsages(await uRes.json()); setMaterials(await mRes.json()); setProjects(await pRes.json())
  }
  useEffect(() => { fetchAll() }, [])

  const openAdd = () => {
    setForm({ ...emptyForm, usageDate: new Date().toISOString().split('T')[0] })
    setError(''); setModalOpen(true)
  }

  const handleMaterialChange = (matId: string) => {
    const mat = materials.find((m) => m.id === matId)
    setForm((f) => ({ ...f, materialId: matId, unit: mat?.unit ?? 'Bags' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch('/api/material-usage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Insufficient stock or error'); return }
      await fetchAll(); setModalOpen(false)
    } catch (err: any) { setError(err.message ?? 'Error')
    } finally { setLoading(false) }
  }

  const filtered = usages.filter((u) =>
    u.material.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.project?.projectCode ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Material Usage <span className="tamil text-slate-400 text-lg font-normal">பொருள் பயன்பாடு</span></h1>
          <p className="page-subtitle">Track material consumption per site · தள வாரியாக பொருள் பயன்பாடு</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Record Usage</button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search material, project..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date / தேதி</th>
                <th>Material / பொருள்</th>
                <th>Project / திட்டம்</th>
                <th>Quantity / அளவு</th>
                <th>Notes / குறிப்பு</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-500 py-10">
                  <div className="flex flex-col items-center gap-2">
                    <Hammer className="w-8 h-8 text-slate-600" />
                    <span>No material usage recorded</span>
                    <button onClick={openAdd} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Record First Usage</button>
                  </div>
                </td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="text-slate-400 text-xs">{formatDate(u.usageDate)}</td>
                    <td className="font-medium">{u.material.name}</td>
                    <td><span className="text-xs font-mono text-brand-400">{u.project.projectCode}</span> <span className="text-slate-400 text-xs">{u.project.ownerName}</span></td>
                    <td><span className="font-semibold text-amber-400">{u.quantity}</span> <span className="text-slate-500 text-xs">{u.unit}</span></td>
                    <td className="text-slate-400 text-sm">{u.notes ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-slate-100">Record Material Usage · <span className="tamil text-slate-400 font-normal">பொருள் பயன்பாடு பதிவு</span></h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>}
                <div className="form-grid">
                  <div>
                    <label className="label">Project * / திட்டம்</label>
                    <select className="select" required value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                      <option value="">Select project...</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode} — {p.ownerName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Material * / பொருள்</label>
                    <select className="select" required value={form.materialId} onChange={(e) => handleMaterialChange(e.target.value)}>
                      <option value="">Select material...</option>
                      {materials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Quantity * / அளவு</label>
                    <input className="input" type="number" required step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
                  </div>
                  <div>
                    <label className="label">Unit</label>
                    <select className="select" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Usage Date * / தேதி</label>
                    <input className="input" type="date" required value={form.usageDate} onChange={(e) => setForm({ ...form, usageDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Notes / குறிப்பு</label>
                    <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Purpose of usage..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Record Usage'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
