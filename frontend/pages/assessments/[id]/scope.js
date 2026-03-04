import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import AssessmentNav from '../../../components/AssessmentNav'
import Modal from '../../../components/Modal'
import { getScope, addScope, deleteScope } from '../../../services/api'

const ASSET_TYPES = ['Web Application', 'API', 'Android Application', 'iOS Application', 'Network IP', 'Cloud Infrastructure', 'Other']
const EMPTY = { asset_type: 'Web Application', asset_name: '', url_or_ip: '', notes: '' }

export default function ScopePage() {
  const { query } = useRouter()
  const id = query.id
  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const load = () => id && getScope(id).then((r) => setItems(r.data))
  useEffect(() => { load() }, [id])

  const handleAdd = async (e) => {
    e.preventDefault()
    await addScope(id, form)
    setShowModal(false)
    setForm(EMPTY)
    load()
  }

  const handleDelete = async (scopeId) => {
    if (!confirm('Remove this scope item?')) return
    await deleteScope(id, scopeId)
    load()
  }

  return (
    <Layout>
      <AssessmentNav assessmentId={id} />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Scope</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Asset</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">URL / IP</th>
              <th className="pb-2 font-medium">Notes</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2"><span className="badge-blue">{item.asset_type}</span></td>
                <td className="py-2 font-medium">{item.asset_name}</td>
                <td className="py-2 text-gray-500 font-mono text-xs">{item.url_or_ip || '—'}</td>
                <td className="py-2 text-gray-500">{item.notes || '—'}</td>
                <td className="py-2 text-right">
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-400">No scope items defined.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Add Scope Asset" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="label">Asset Type *</label>
              <select className="input" value={form.asset_type} onChange={(e) => setForm({ ...form, asset_type: e.target.value })}>
                {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Asset Name *</label>
              <input className="input" required value={form.asset_name} onChange={(e) => setForm({ ...form, asset_name: e.target.value })} placeholder="e.g. Customer Portal" />
            </div>
            <div>
              <label className="label">URL / IP</label>
              <input className="input" value={form.url_or_ip} onChange={(e) => setForm({ ...form, url_or_ip: e.target.value })} placeholder="https://app.example.com" />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary">Add</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
