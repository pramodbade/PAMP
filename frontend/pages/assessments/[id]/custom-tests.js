import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import AssessmentNav from '../../../components/AssessmentNav'
import Modal from '../../../components/Modal'
import { getCustomTests, createCustomTest, updateCustomTest, deleteCustomTest } from '../../../services/api'

const STATUS_OPTIONS = ['Pending', 'Completed', 'Not Applicable', 'Issue Found']
const STATUS_COLOR = { Pending: 'badge-gray', Completed: 'badge-green', 'Not Applicable': 'badge-yellow', 'Issue Found': 'badge-red' }
const EMPTY = { test_name: '', area: '', description: '', status: 'Pending', notes: '' }

export default function CustomTestsPage() {
  const { query } = useRouter()
  const id = query.id
  const [tests, setTests] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)

  const load = () => id && getCustomTests(id).then((r) => setTests(r.data))
  useEffect(() => { load() }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingId) {
      await updateCustomTest(id, editingId, form)
    } else {
      await createCustomTest(id, form)
    }
    setShowModal(false)
    setForm(EMPTY)
    setEditingId(null)
    load()
  }

  const openEdit = (t) => {
    setForm({ test_name: t.test_name, area: t.area || '', description: t.description || '', status: t.status, notes: t.notes || '' })
    setEditingId(t.id)
    setShowModal(true)
  }

  const handleDelete = async (testId) => {
    if (!confirm('Delete this test?')) return
    await deleteCustomTest(id, testId)
    load()
  }

  return (
    <Layout>
      <AssessmentNav assessmentId={id} />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Custom Test Scenarios</h2>
        <button onClick={() => { setForm(EMPTY); setEditingId(null); setShowModal(true) }} className="btn-primary">+ Add Test</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2 font-medium">Test Name</th>
              <th className="pb-2 font-medium">Area</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Notes</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 font-medium">{t.test_name}</td>
                <td className="py-2 text-gray-500">{t.area || '—'}</td>
                <td className="py-2"><span className={STATUS_COLOR[t.status] || 'badge-gray'}>{t.status}</span></td>
                <td className="py-2 text-gray-500 text-xs">{t.notes || '—'}</td>
                <td className="py-2 text-right flex gap-2 justify-end">
                  <button onClick={() => openEdit(t)} className="text-brand-600 hover:text-brand-800 text-xs">Edit</button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {tests.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-400">No custom tests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingId ? 'Edit Test' : 'Add Custom Test'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Test Name *</label>
              <input className="input" required value={form.test_name} onChange={(e) => setForm({ ...form, test_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Area</label>
                <input className="input" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Authentication, API..." />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
