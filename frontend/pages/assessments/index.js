import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import { StatusBadge } from '../../components/StatusBadge'
import { getAssessments, createAssessment, getProducts } from '../../services/api'

const EMPTY = { product_id: '', environment: 'Production', start_date: '', estimated_effort_days: '', lead_pentester: '' }

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState([])
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const load = () => getAssessments().then((r) => setAssessments(r.data))

  useEffect(() => {
    load()
    getProducts().then((r) => setProducts(r.data))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.estimated_effort_days) delete payload.estimated_effort_days
      if (!payload.lead_pentester) delete payload.lead_pentester
      const { data } = await createAssessment(payload)
      setShowModal(false)
      setForm(EMPTY)
      router.push(`/assessments/${data.id}`)
    } finally { setSaving(false) }
  }

  const productName = (id) => products.find((p) => p.id === id)?.product_name || id

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assessments</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ New Assessment</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">Environment</th>
              <th className="pb-3 font-medium">Start Date</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 font-medium">{productName(a.product_id)}</td>
                <td className="py-3 text-gray-600">{a.environment}</td>
                <td className="py-3 text-gray-600">{a.start_date}</td>
                <td className="py-3"><StatusBadge value={a.status} /></td>
                <td className="py-3 text-right">
                  <Link href={`/assessments/${a.id}`} className="btn-secondary text-xs">Open</Link>
                </td>
              </tr>
            ))}
            {assessments.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-400">No assessments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="New Assessment" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="label">Product *</label>
              <select className="input" required value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
                <option value="">— Select product —</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.product_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Environment *</label>
                <select className="input" value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })}>
                  {['Production', 'Staging', 'Development', 'QA'].map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Start Date *</label>
                <input className="input" type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <label className="label">Estimated Effort (days)</label>
                <input className="input" type="number" min={1} value={form.estimated_effort_days} onChange={(e) => setForm({ ...form, estimated_effort_days: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating…' : 'Create'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
