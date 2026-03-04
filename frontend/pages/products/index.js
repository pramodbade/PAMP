import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import { getProducts, createProduct, deleteProduct } from '../../services/api'

const RISK_BADGE = { Low: 'badge-blue', Medium: 'badge-yellow', High: 'badge-orange', Critical: 'badge-red' }

const EMPTY = { product_name: '', owner_team: '', business_unit: '', risk_level: 'Medium', tech_stack: '', description: '' }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => getProducts().then((r) => setProducts(r.data))
  useEffect(() => { load() }, [])

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
    if (!confirm('Delete this product?')) return
    await deleteProduct(id)
    load()
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ New Product</button>
      </div>

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
            <p className="text-sm text-gray-400 mt-1">{p.tech_stack || ''}</p>
            <div className="flex gap-2 mt-4">
              <Link href={`/products/${p.id}`} className="btn-secondary text-xs">View</Link>
              <button onClick={() => handleDelete(p.id)} className="btn-danger text-xs">Delete</button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-gray-500 col-span-3">No products yet. Create one to get started.</p>
        )}
      </div>

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
