'use client'

import { useState, useEffect } from 'react'
import { Plus, ShoppingCart, Search } from 'lucide-react'
import { formatCurrency, formatDate, formatDateInput, UNITS } from '@/lib/utils'
import { RoleGuard } from '@/components/role-guard'

interface Supplier { id: string; name: string }
interface Material { id: string; name: string; unit: string; category: { name: string } }
interface Project { id: string; projectCode: string; ownerName: string }
interface Purchase {
  id: string; supplierId: string; materialId: string; projectId: string | null
  quantity: number; unit: string; unitPrice: number; totalCost: number
  purchaseDate: string; invoiceNo: string | null; notes: string | null
  supplier: Supplier; material: Material; project: Project | null
}

const emptyForm = { projectId: '', supplierId: '', materialId: '', quantity: '', unit: 'Bags', unitPrice: '', purchaseDate: '', invoiceNo: '', notes: '' }

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
    const [pRes, sRes, mRes, prRes] = await Promise.all([
      fetch('/api/purchases'), fetch('/api/suppliers'), fetch('/api/materials'), fetch('/api/projects')
    ])
    setPurchases(await pRes.json()); setSuppliers(await sRes.json())
    setMaterials(await mRes.json()); setProjects(await prRes.json())
  }
  useEffect(() => { fetchAll() }, [])

  const openAdd = () => {
    setForm({ ...emptyForm, purchaseDate: new Date().toISOString().split('T')[0] })
    setError(''); setModalOpen(true)
  }

  const handleMaterialChange = (matId: string) => {
    const mat = materials.find((m) => m.id === matId)
    setForm((f) => ({ ...f, materialId: matId, unit: mat?.unit ?? 'Bags' }))
  }

  const totalCost = (parseFloat(form.quantity) || 0) * (parseFloat(form.unitPrice) || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch('/api/purchases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Error'); return }
      await fetchAll(); setModalOpen(false)
    } finally { setLoading(false) }
  }

  const filtered = purchases.filter((p) =>
    p.material.name.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.project?.projectCode ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const totalSpend = filtered.reduce((s, p) => s + p.totalCost, 0)

  return (
    <RoleGuard allowedRoles={['ADMIN', 'ACCOUNTANT']}>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Purchases <span className="tamil text-slate-400 text-lg font-normal">கொள்முதல்</span></h1>
            <p className="page-subtitle">Total spend: {formatCurrency(totalSpend)} · {purchases.length} records</p>
          </div>
          <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Record Purchase</button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search material, supplier, project..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>

        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date / தேதி</th>
                  <th>Material / பொருள்</th>
                  <th>Supplier / சப்ளையர்</th>
                  <th>Project / திட்டம்</th>
                  <th>Qty</th>
                  <th>Unit Price / விலை</th>
                  <th>Total / மொத்தம்</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-slate-500 py-10">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart className="w-8 h-8 text-slate-600" />
                      <span>No purchases recorded yet</span>
                      <button onClick={openAdd} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Record First Purchase</button>
                    </div>
                  </td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="text-slate-400 text-xs">{formatDate(p.purchaseDate)}</td>
                      <td>
                        <div className="font-medium">{p.material.name}</div>
                        <div className="text-xs text-slate-500">{p.material.category.name}</div>
                      </td>
                      <td className="text-slate-400">{p.supplier.name}</td>
                      <td>{p.project ? <span className="text-xs font-mono text-brand-400">{p.project.projectCode}</span> : <span className="text-slate-500">—</span>}</td>
                      <td>{p.quantity} <span className="text-slate-500 text-xs">{p.unit}</span></td>
                      <td className="text-slate-400">{formatCurrency(p.unitPrice)}</td>
                      <td className="text-emerald-400 font-semibold">{formatCurrency(p.totalCost)}</td>
                      <td className="text-slate-500 text-xs">{p.invoiceNo ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-semibold text-slate-100">Record Purchase · <span className="tamil text-slate-400 font-normal">கொள்முதல் பதிவு</span></h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xl">×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>}
                  <div className="form-grid">
                    <div>
                      <label className="label">Supplier * / சப்ளையர்</label>
                      <select className="select" required value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                        <option value="">Select supplier...</option>
                        {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                      <label className="label">Project / திட்டம்</label>
                      <select className="select" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                        <option value="">No project (Warehouse)</option>
                        {projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode} — {p.ownerName}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Purchase Date * / தேதி</label>
                      <input className="input" type="date" required value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
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
                      <label className="label">Unit Price (₹) * / விலை</label>
                      <input className="input" type="number" required step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="label">Total Cost / மொத்த செலவு</label>
                      <div className="input bg-surface-900 text-emerald-400 font-semibold">{formatCurrency(totalCost)}</div>
                    </div>
                    <div>
                      <label className="label">Invoice No / விலை பட்டியல் எண்</label>
                      <input className="input" value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} placeholder="INV-001" />
                    </div>
                    <div>
                      <label className="label">Notes / குறிப்பு</label>
                      <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Record Purchase'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
