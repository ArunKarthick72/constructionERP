'use client'

import { useState, useEffect } from 'react'
import { Plus, Wrench, Trash2 } from 'lucide-react'
import { formatDate, UNITS } from '@/lib/utils'

interface Material { id: string; name: string; unit: string }
interface SmallWork {
  id: string; title: string; location: string | null; description: string | null; workDate: string
  materials: { id: string; quantity: number; unit: string; material: Material }[]
}

const emptyForm = { title: '', location: '', description: '', workDate: '' }
const emptyMaterialItem = { materialId: '', quantity: '', unit: 'Bags' }

export default function SmallWorksPage() {
  const [works, setWorks] = useState<SmallWork[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [materialItems, setMaterialItems] = useState([{ ...emptyMaterialItem }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
    const [wRes, mRes] = await Promise.all([fetch('/api/small-works'), fetch('/api/materials')])
    setWorks(await wRes.json()); setMaterials(await mRes.json())
  }
  useEffect(() => { fetchAll() }, [])

  const openAdd = () => {
    setForm({ ...emptyForm, workDate: new Date().toISOString().split('T')[0] })
    setMaterialItems([{ ...emptyMaterialItem }])
    setError(''); setModalOpen(true)
  }

  const updateMaterialItem = (idx: number, field: string, value: string) => {
    const updated = [...materialItems]
    if (field === 'materialId') {
      const mat = materials.find((m) => m.id === value)
      updated[idx] = { ...updated[idx], materialId: value, unit: mat?.unit ?? 'Bags' }
    } else {
      updated[idx] = { ...updated[idx], [field]: value }
    }
    setMaterialItems(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch('/api/small-works', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, materials: materialItems.filter((m) => m.materialId) }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Insufficient stock'); return }
      await fetchAll(); setModalOpen(false)
    } catch (err: any) { setError(err.message ?? 'Error')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Small Works <span className="tamil text-slate-400 text-lg font-normal">சிறிய வேலைகள்</span></h1>
          <p className="page-subtitle">Track minor works outside main projects · சிறிய வேலைகளுக்கு பொருள் பயன்பாடு</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> New Work</button>
      </div>

      {works.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Wrench className="w-8 h-8" /></div>
          <h3 className="text-slate-300 font-medium mb-1">No small works recorded</h3>
          <p className="text-slate-500 text-sm tamil">இன்னும் சிறிய வேலை இல்லை</p>
          <button onClick={openAdd} className="btn-primary mt-4"><Plus className="w-4 h-4" /> Record Work</button>
        </div>
      ) : (
        <div className="space-y-4">
          {works.map((w) => (
            <div key={w.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-100">{w.title}</h3>
                  <div className="flex gap-3 text-sm text-slate-400 mt-0.5">
                    <span>📅 {formatDate(w.workDate)}</span>
                    {w.location && <span>📍 {w.location}</span>}
                  </div>
                </div>
                <span className="badge badge-orange">{w.materials.length} materials used</span>
              </div>
              {w.description && <p className="text-slate-400 text-sm mb-3">{w.description}</p>}
              {w.materials.length > 0 && (
                <div className="table-container">
                  <table className="table text-xs">
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Quantity Used / பயன்படுத்திய அளவு</th>
                      </tr>
                    </thead>
                    <tbody>
                      {w.materials.map((m) => (
                        <tr key={m.id}>
                          <td>{m.material.name}</td>
                          <td className="text-amber-400 font-medium">{m.quantity} {m.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-slate-100">Record Small Work · <span className="tamil text-slate-400 font-normal">சிறிய வேலை பதிவு</span></h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>}
                <div className="form-grid">
                  <div>
                    <label className="label">Work Title * / வேலை தலைப்பு</label>
                    <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Compound wall repair" />
                  </div>
                  <div>
                    <label className="label">Work Date * / தேதி</label>
                    <input className="input" type="date" required value={form.workDate} onChange={(e) => setForm({ ...form, workDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Location / இடம்</label>
                    <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Work location" />
                  </div>
                  <div>
                    <label className="label">Description / விவரம்</label>
                    <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Work details..." />
                  </div>
                </div>

                <div className="divider" />
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-300">Materials Used · <span className="tamil text-slate-500">பயன்படுத்திய பொருட்கள்</span></p>
                  <button type="button" onClick={() => setMaterialItems([...materialItems, { ...emptyMaterialItem }])} className="btn-secondary text-xs py-1.5">
                    <Plus className="w-3 h-3" /> Add Material
                  </button>
                </div>

                {materialItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select className="select flex-1" value={item.materialId} onChange={(e) => updateMaterialItem(idx, 'materialId', e.target.value)}>
                      <option value="">Select material...</option>
                      {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <input className="input w-28" type="number" step="0.01" placeholder="Qty" value={item.quantity} onChange={(e) => updateMaterialItem(idx, 'quantity', e.target.value)} />
                    <select className="select w-28" value={item.unit} onChange={(e) => updateMaterialItem(idx, 'unit', e.target.value)}>
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    {materialItems.length > 1 && (
                      <button type="button" onClick={() => setMaterialItems(materialItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Work'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
