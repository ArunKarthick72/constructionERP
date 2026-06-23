'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react'
import { UNITS } from '@/lib/utils'
import { RoleGuard } from '@/components/role-guard'

interface Category { id: string; name: string; nameTA: string | null }
interface Material { id: string; name: string; nameTA: string | null; unit: string; categoryId: string; category: Category }

const emptyForm = { name: '', nameTA: '', unit: 'Bags', categoryId: '' }

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  const fetchAll = async () => {
    const [mRes, cRes] = await Promise.all([fetch('/api/materials'), fetch('/api/categories')])
    const [mData, cData] = await Promise.all([mRes.json(), cRes.json()])
    setMaterials(mData)
    setCategories(cData)
    if (!form.categoryId && cData.length > 0) setForm((f) => ({ ...f, categoryId: cData[0].id }))
  }

  useEffect(() => { fetchAll() }, [])

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, categoryId: categories[0]?.id ?? '' }); setModalOpen(true) }
  const openEdit = (m: Material) => {
    setEditing(m)
    setForm({ name: m.name, nameTA: m.nameTA ?? '', unit: m.unit, categoryId: m.categoryId })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        await fetch(`/api/materials/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      } else {
        await fetch('/api/materials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      }
      await fetchAll()
      setModalOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material?')) return
    await fetch(`/api/materials/${id}`, { method: 'DELETE' })
    await fetchAll()
  }

  const filtered = materials.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || (m.nameTA ?? '').includes(search)
    const matchCat = !filterCat || m.categoryId === filterCat
    return matchSearch && matchCat
  })

  const byCategory = categories.map((cat) => ({
    ...cat,
    items: filtered.filter((m) => m.categoryId === cat.id),
  })).filter((g) => g.items.length > 0)

  const CATEGORY_COLORS: Record<string, string> = {
    0: 'text-orange-400 bg-orange-500/20',
    1: 'text-blue-400 bg-blue-500/20',
    2: 'text-green-400 bg-green-500/20',
    3: 'text-violet-400 bg-violet-500/20',
  }

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Materials <span className="tamil text-slate-400 text-lg font-normal">பொருட்கள்</span></h1>
            <p className="page-subtitle">{materials.length} materials in {categories.length} categories</p>
          </div>
          <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Material</button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="select w-auto min-w-48">
            <option value="">All Categories / அனைத்தும்</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* By Category */}
        {byCategory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package className="w-8 h-8" /></div>
            <h3 className="text-slate-300 font-medium mb-1">No materials found</h3>
            <button onClick={openAdd} className="btn-primary mt-4"><Plus className="w-4 h-4" /> Add Material</button>
          </div>
        ) : (
          <div className="space-y-6">
            {byCategory.map((group, gIdx) => (
              <div key={group.id} className="card">
                <h2 className="section-title">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${CATEGORY_COLORS[gIdx % 4]}`}>
                    {group.items.length}
                  </span>
                  {group.name}
                  {group.nameTA && <span className="tamil text-slate-400 font-normal text-sm">{group.nameTA}</span>}
                </h2>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Material Name / பொருள் பெயர்</th>
                        <th>Tamil Name / தமிழ் பெயர்</th>
                        <th>Unit</th>
                        <th className="w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((m) => (
                        <tr key={m.id}>
                          <td className="font-medium">{m.name}</td>
                          <td className="tamil text-slate-400">{m.nameTA ?? '—'}</td>
                          <td><span className="badge badge-blue">{m.unit}</span></td>
                          <td>
                            <div className="flex gap-1">
                              <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-600/10 transition-all">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-600/10 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-semibold text-slate-100">{editing ? 'Edit Material' : 'Add Material'}</h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200 transition-colors text-xl">×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div>
                    <label className="label">Category / வகை *</label>
                    <select className="select" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-grid">
                    <div>
                      <label className="label">Material Name * / பொருள் பெயர்</label>
                      <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cement" />
                    </div>
                    <div>
                      <label className="label tamil">தமிழ் பெயர் (Tamil Name)</label>
                      <input className="input tamil" value={form.nameTA} onChange={(e) => setForm({ ...form, nameTA: e.target.value })} placeholder="சிமெண்ட்" />
                    </div>
                    <div>
                      <label className="label">Unit / அளவு</label>
                      <select className="select" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : editing ? 'Update' : 'Add Material'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
