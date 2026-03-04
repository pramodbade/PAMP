import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import AssessmentNav from '../../../components/AssessmentNav'
import Modal from '../../../components/Modal'
import { getBlockers, createBlocker, updateBlocker, deleteBlocker } from '../../../services/api'

const EMPTY = { start_date: '', end_date: '', reason: '', expected_resolution: '', resolved: false }

export default function BlockersPage() {
  const { query } = useRouter()
  const id = query.id
  const [blockers, setBlockers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const load = () => id && getBlockers(id).then((r) => setBlockers(r.data))
  useEffect(() => { load() }, [id])

  const handleAdd = async (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.end_date) delete payload.end_date
    if (!payload.expected_resolution) delete payload.expected_resolution
    await createBlocker(id, payload)
    setShowModal(false)
    setForm(EMPTY)
    load()
  }

  const resolve = async (blocker) => {
    const today = new Date().toISOString().split('T')[0]
    await updateBlocker(id, blocker.id, { resolved: true, end_date: today })
    load()
  }

  const handleDelete = async (blockerId) => {
    if (!confirm('Delete this blocker?')) return
    await deleteBlocker(id, blockerId)
    load()
  }

  return (
    <Layout>
      <AssessmentNav assessmentId={id} />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Blockers</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {blockers.filter((b) => b.resolved).length}/{blockers.length} resolved
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Record Blocker</button>
      </div>

      <div className="space-y-3">
        {blockers.map((b) => (
          <div key={b.id} className={`card border-l-4 ${b.resolved ? 'border-green-400' : 'border-red-400'}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{b.reason}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Started: <strong>{b.start_date}</strong>
                  {b.end_date && <span> → Resolved: <strong>{b.end_date}</strong></span>}
                  {!b.end_date && b.expected_resolution && (
                    <span className="text-orange-500"> · Expected: {b.expected_resolution}</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                {!b.resolved && (
                  <button onClick={() => resolve(b)} className="btn-secondary text-xs">Mark Resolved</button>
                )}
                <span className={b.resolved ? 'badge-green' : 'badge-red'}>{b.resolved ? 'Resolved' : 'Open'}</span>
                <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-700 text-xs ml-1">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {blockers.length === 0 && (
          <div className="card text-center text-gray-400 py-8">No blockers recorded.</div>
        )}
      </div>

      {showModal && (
        <Modal title="Record Blocker" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="label">Reason *</label>
              <textarea className="input" rows={2} required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="VPN access missing, test account unavailable..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start Date *</label>
                <input className="input" type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <label className="label">Expected Resolution</label>
                <input className="input" type="date" value={form.expected_resolution} onChange={(e) => setForm({ ...form, expected_resolution: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary">Record</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
