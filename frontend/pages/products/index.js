import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import { getProducts, createProduct, deleteProduct } from '../../services/api'
import { getUser } from '../../services/auth'

const RISK_BADGE = { Low: 'badge-blue', Medium: 'badge-yellow', High: 'badge-orange', Critical: 'badge-red' }

const EMPTY = { product_name: '', owner_team: '', business_unit: '', risk_level: 'Medium', tech_stack: '', description: '' }

// ── Icons ────────────────────────────────────────────────────────────────────
function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState('grid')  // 'grid' | 'list'
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const load = () => getProducts().then((r) => setProducts(r.data))
  useEffect(() => { load() }, [])

  const canManage = ['admin', 'lead_pentester'].includes(user?.role)

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createProduct(form)
      setShowModal(false)
      setForm(EMPTY)
      load()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await deleteProduct(id)
    load()
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`px-3 py-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`px-3 py-2 border-l border-gray-300 transition-colors ${
                viewMode === 'list'
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ListIcon />
            </button>
          </div>
          {canManage && (
            <button onClick={() => setShowModal(true)} className="btn-primary">+ New Product</button>
          )}
        </div>
      </div>

      {/* ── Grid View ─────────────────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <Link href={`/products/${p.id}`} className="font-semibold text-brand-600 hover:underline">
                  {p.product_name}
                </Link>
                <span className={RISK_BADGE[p.risk_level] || 'badge-gray'}>{p.risk_level || '—'}</span>
              </div>
              <p className="text-sm text-gray-500">{p.owner_team || 'No team'}</p>
              {p.business_unit && <p className="text-xs text-gray-400">{p.business_unit}</p>}
              <p className="text-sm text-gray-400 mt-1">{p.tech_stack || ''}</p>
              <div className="flex gap-2 mt-4">
                <Link href={`/products/${p.id}`} className="btn-secondary text-xs">View</Link>
                {canManage && (
                  <button onClick={() => handleDelete(p.id)} className="btn-danger text-xs">Delete</button>
                )}
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-gray-500 col-span-3">No products yet. Create one to get started.</p>
          )}
        </div>
      )}

      {/* ── List View ─────────────────────────────────────────────────────── */}
      {viewMode === 'list' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Owner Team</th>
                <th className="px-4 py-3 font-medium">Business Unit</th>
                <th className="px-4 py-3 font-medium">Tech Stack</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/products/${p.id}`} className="font-medium text-brand-600 hover:underline">
                      {p.product_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={RISK_BADGE[p.risk_level] || 'badge-gray'}>{p.risk_level || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.owner_team || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.business_unit || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{p.tech_stack || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/products/${p.id}`} className="btn-secondary text-xs">View</Link>
                      {canManage && (
                        <button onClick={() => handleDelete(p.id)} className="btn-danger text-xs">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No products yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <Modal title="New Product" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="label">Product Name *</label>
              <input className="input" required value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Owner Team</label>
                <input className="input" value={form.owner_team} onChange={(e) => setForm({ ...form, owner_team: e.target.value })} />
              </div>
              <div>
                <label className="label">Business Unit</label>
                <input className="input" value={form.business_unit} onChange={(e) => setForm({ ...form, business_unit: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Risk Level</label>
              <select className="input" value={form.risk_level} onChange={(e) => setForm({ ...form, risk_level: e.target.value })}>
                {['Low', 'Medium', 'High', 'Critical'].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tech Stack</label>
              <input className="input" placeholder="React, Node.js, PostgreSQL" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Create'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
