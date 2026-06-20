'use client'

import { useState, useEffect } from 'react'
import { Warehouse, Search, AlertTriangle, TrendingUp, TrendingDown, Package } from 'lucide-react'

interface StockItem {
  id: string; name: string; nameTA: string | null; unit: string; currentStock: number
  category: { name: string; nameTA: string | null }
}

const LOW_STOCK_THRESHOLD = 10

export default function WarehousePage() {
  const [stock, setStock] = useState<StockItem[]>([])
  const [search, setSearch] = useState('')
  const [filterLow, setFilterLow] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchStock = async () => {
    setLoading(true)
    const r = await fetch('/api/warehouse')
    setStock(await r.json())
    setLoading(false)
  }
  useEffect(() => { fetchStock() }, [])

  const filtered = stock.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || (s.nameTA ?? '').includes(search)
    const matchLow = !filterLow || s.currentStock <= LOW_STOCK_THRESHOLD
    return matchSearch && matchLow
  })

  const totalItems = stock.length
  const lowStockItems = stock.filter((s) => s.currentStock <= LOW_STOCK_THRESHOLD)
  const inStockItems = stock.filter((s) => s.currentStock > LOW_STOCK_THRESHOLD)

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouse <span className="tamil text-slate-400 text-lg font-normal">கிடங்கு</span></h1>
          <p className="page-subtitle">Real-time stock levels · நிலையான பொருளிருப்பு</p>
        </div>
        <button onClick={fetchStock} className="btn-secondary">↻ Refresh</button>
      </div>

      {/* Stock Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-brand-600/20"><Package className="w-6 h-6 text-brand-400" /></div>
          <div><p className="kpi-value">{totalItems}</p><p className="kpi-label">Total Materials / மொத்த பொருட்கள்</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-emerald-500/20"><TrendingUp className="w-6 h-6 text-emerald-400" /></div>
          <div><p className="kpi-value">{inStockItems.length}</p><p className="kpi-label">In Stock / இருப்பு உள்ளது</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red-500/20"><AlertTriangle className="w-6 h-6 text-red-400" /></div>
          <div><p className="kpi-value text-red-400">{lowStockItems.length}</p><p className="kpi-label">Low / No Stock Alert / குறைவு</p></div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium text-sm">Low Stock Alert / குறைவான பொருளிருப்பு</p>
            <p className="text-slate-400 text-sm mt-0.5">
              {lowStockItems.slice(0, 5).map((s) => s.name).join(', ')}
              {lowStockItems.length > 5 && ` and ${lowStockItems.length - 5} more...`}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <button
          onClick={() => setFilterLow(!filterLow)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${filterLow ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-surface-500 text-slate-400 hover:border-red-500/30'}`}
        >
          <AlertTriangle className="w-4 h-4" /> Low Stock Only
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="loading-spinner w-10 h-10" />
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Material / பொருள்</th>
                  <th>Tamil Name / தமிழ் பெயர்</th>
                  <th>Category / வகை</th>
                  <th>Unit</th>
                  <th>Current Stock / இருப்பு</th>
                  <th>Status / நிலை</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-slate-500 py-8">No materials found</td></tr>
                ) : (
                  filtered.map((item) => {
                    const isLow = item.currentStock <= LOW_STOCK_THRESHOLD
                    const isEmpty = item.currentStock === 0
                    return (
                      <tr key={item.id}>
                        <td className="font-medium">{item.name}</td>
                        <td className="tamil text-slate-400">{item.nameTA ?? '—'}</td>
                        <td className="text-slate-400 text-sm">{item.category.name}</td>
                        <td><span className="badge badge-blue">{item.unit}</span></td>
                        <td>
                          <span className={`text-lg font-bold ${isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {item.currentStock}
                          </span>
                          <span className="text-slate-500 text-xs ml-1">{item.unit}</span>
                        </td>
                        <td>
                          {isEmpty ? (
                            <span className="badge badge-red"><AlertTriangle className="w-3 h-3 mr-1" />Out of Stock</span>
                          ) : isLow ? (
                            <span className="badge badge-yellow"><AlertTriangle className="w-3 h-3 mr-1" />Low Stock</span>
                          ) : (
                            <span className="badge badge-green">In Stock</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
