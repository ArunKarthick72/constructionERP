'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Users2, Search, Phone, Mail, MapPin } from 'lucide-react'
import { RoleGuard } from '@/components/role-guard'

interface Supplier {
  id: string
  name: string
  contactName: string | null
  phone: string | null
  email: string | null
  address: string | null
  gstin: string | null
  notes: string | null
  materials: {
    materialId: string
    material: {
      id: string
      name: string
      nameTA: string | null
      category: {
        id: string
        name: string
        nameTA: string | null
      }
    }
  }[]
}

interface Material {
  id: string
  name: string
  nameTA: string | null
  unit: string
  categoryId: string
  category: {
    id: string
    name: string
    nameTA: string | null
  }
}

const emptyForm = {
  name: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  gstin: '',
  notes: '',
  materialIds: [] as string[]
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  const fetchSuppliers = async () => {
    const res = await fetch('/api/suppliers')
    setSuppliers(await res.json())
  }

  const fetchMaterials = async () => {
    const res = await fetch('/api/materials')
    setMaterials(await res.json())
  }

  useEffect(() => {
    fetchSuppliers()
    fetchMaterials()
  }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (s: Supplier) => {
    setEditing(s)
    setForm({
      name: s.name,
      contactName: s.contactName ?? '',
      phone: s.phone ?? '',
      email: s.email ?? '',
      address: s.address ?? '',
      gstin: s.gstin ?? '',
      notes: s.notes ?? '',
      materialIds: s.materials?.map((m) => m.materialId) ?? [],
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        await fetch(`/api/suppliers/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      } else {
        await fetch('/api/suppliers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      }
      await fetchSuppliers()
      setModalOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this supplier? / இந்த சப்ளையரை நீக்கவா?')) return
    await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
    await fetchSuppliers()
  }

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contactName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (s.phone ?? '').includes(search) ||
    (s.materials ?? []).some((sm) =>
      sm.material.name.toLowerCase().includes(search.toLowerCase()) ||
      (sm.material.nameTA ?? '').toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <RoleGuard allowedRoles={['ADMIN', 'ACCOUNTANT']}>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Suppliers <span className="tamil text-slate-400 text-lg font-normal">சப்ளையர்கள்</span></h1>
            <p className="page-subtitle">{suppliers.length} suppliers registered · சப்ளையர்கள் பதிவு செய்யப்பட்டனர்</p>
          </div>
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Supplier / சப்ளையர் சேர்
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers... / சப்ளையர் தேடு..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Users2 className="w-8 h-8" /></div>
            <h3 className="text-slate-300 font-medium mb-1">No suppliers yet</h3>
            <p className="text-slate-500 text-sm tamil">இன்னும் சப்ளையர் இல்லை</p>
            <button onClick={openAdd} className="btn-primary mt-4"><Plus className="w-4 h-4" /> Add First Supplier</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <div key={s.id} className="card hover:border-brand-600/40 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center text-brand-400 font-bold">
                      {s.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">{s.name}</h3>
                      {s.contactName && <p className="text-slate-400 text-sm">{s.contactName}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-600/10 transition-all">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-600/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  {s.phone && <div className="flex items-center gap-2 text-slate-400"><Phone className="w-3.5 h-3.5" />{s.phone}</div>}
                  {s.email && <div className="flex items-center gap-2 text-slate-400"><Mail className="w-3.5 h-3.5" />{s.email}</div>}
                  {s.address && <div className="flex items-center gap-2 text-slate-400"><MapPin className="w-3.5 h-3.5" />{s.address}</div>}
                  {s.gstin && <div className="text-slate-500 text-xs">GSTIN: {s.gstin}</div>}
                </div>
                {s.materials && s.materials.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Supplied Materials / பொருட்கள்
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {s.materials.map((sm) => (
                        <span key={sm.materialId} className="badge badge-purple text-[11px] px-2 py-0.5">
                          {sm.material.name}
                          {sm.material.nameTA && (
                            <span className="text-[9px] opacity-85 ml-0.5 tamil font-normal">
                              ({sm.material.nameTA})
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal max-w-xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-semibold text-slate-100">
                  {editing ? 'Edit Supplier' : 'Add Supplier'} · <span className="tamil text-slate-400 font-normal">{editing ? 'திருத்து' : 'சேர்'}</span>
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200 transition-colors text-xl leading-none">×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div>
                      <label className="label">Supplier Name * / பெயர்</label>
                      <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Company or Person Name" />
                    </div>
                    <div>
                      <label className="label">Contact Person / தொடர்பு நபர்</label>
                      <input className="input" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Contact name" />
                    </div>
                    <div>
                      <label className="label">Phone / தொலைபேசி</label>
                      <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Address / முகவரி</label>
                      <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
                    </div>
                    <div>
                      <label className="label">GSTIN</label>
                      <input className="input" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="GST Number" />
                    </div>
                    <div>
                      <label className="label">Notes / குறிப்புகள்</label>
                      <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label mb-2">Materials Supplied / வழங்கப்படும் பொருட்கள்</label>
                      <div className="max-h-56 overflow-y-auto border border-surface-500 rounded-xl p-3 bg-surface-800 space-y-4">
                        {Object.entries(
                          materials.reduce((acc, m) => {
                            const catKey = m.category.name + (m.category.nameTA ? ` / ${m.category.nameTA}` : '')
                            if (!acc[catKey]) acc[catKey] = []
                            acc[catKey].push(m)
                            return acc
                          }, {} as Record<string, typeof materials>)
                        ).map(([catName, items]) => (
                          <div key={catName} className="space-y-1.5">
                            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wide border-b border-surface-500 pb-1">
                              {catName}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {items.map((m) => {
                                const isChecked = form.materialIds.includes(m.id)
                                return (
                                  <label
                                    key={m.id}
                                    className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer hover:text-white transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        const newIds = isChecked
                                          ? form.materialIds.filter((id) => id !== m.id)
                                          : [...form.materialIds, m.id]
                                        setForm({ ...form, materialIds: newIds })
                                      }}
                                      className="rounded border-surface-500 text-brand-600 focus:ring-brand-500 bg-surface-900 w-4 h-4 cursor-pointer"
                                    />
                                    <span>
                                      {m.name}
                                      {m.nameTA && (
                                        <span className="text-slate-400 text-xs ml-1 tamil">
                                          ({m.nameTA})
                                        </span>
                                      )}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : editing ? 'Update Supplier' : 'Add Supplier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
