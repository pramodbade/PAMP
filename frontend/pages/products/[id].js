import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { getProduct, updateProduct, getFindings, createFinding, getProductTimeline } from '../../services/api'
import { SeverityBadge, StatusBadge } from '../../components/StatusBadge'
import Modal from '../../components/Modal'

const FINDING_EMPTY = { title: '', severity: 'Medium', description: '', first_found_date: '', status: 'Open' }

function CoverageBar({ pct }) {
  let barColor = 'bg-gray-300'
  if (pct >= 80) barColor = 'bg-green-500'
  else if (pct >= 50) barColor = 'bg-blue-500'
  else if (pct > 0) barColor = 'bg-amber-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-16">
        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function ProductDetailPage() {
  const router = useRouter()
  const { id } = router.query

  const [product, setProduct] = useState(null)
  const [findings, setFindings] = useState([])
  const [timeline, setTimeline] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [showFindingModal, setShowFindingModal] = useState(false)
  const [findingForm, setFindingForm] = useState(FINDING_EMPTY)

  useEffect(() => {
    if (!id) return
    getProduct(id).then((r) => { setProduct(r.data); setForm(r.data) })
    getFindings(id).then((r) => setFindings(r.data))
    getProductTimeline(id).then((r) => setTimeline(r.data)).catch(() => {})
  }, [id])

  const saveProduct = async (e) => {
    e.preventDefault()
    await updateProduct(id, form)
    setProduct(form)
    setEditing(false)
  }

  const addFinding = async (e) => {
    e.preventDefault()
    await createFinding(id, { ...findingForm, product_id: id })
    getFindings(id).then((r) => setFindings(r.data))
    setShowFindingModal(false)
    setFindingForm(FINDING_EMPTY)
  }

  if (!product) return <Layout><p className="text-gray-500">Loading…</p></Layout>

  return (
    <Layout>
      <div className="mb-4">
        <Link href="/products" className="text-sm text-brand-600 hover:underline">← Products</Link>
      </div>

      <div className="card mb-6">
        {!editing ? (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{product.product_name}</h1>
                <p className="text-gray-500 text-sm mt-1">{product.owner_team} — {product.business_unit}</p>
              </div>
              <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Edit</button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Risk Level:</span> <strong>{product.risk_level}</strong></div>
              <div><span className="text-gray-500">Tech Stack:</span> {product.tech_stack}</div>
              <div className="col-span-2"><span className="text-gray-500">Description:</span> {product.description}</div>
            </div>
          </>
        ) : (
          <form onSubmit={saveProduct} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Product Name</label>
                <input className="input" value={form.product_name || ''} onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
              </div>
              <div>
                <label className="label">Risk Level</label>
                <select className="input" value={form.risk_level || ''} onChange={(e) => setForm({ ...form, risk_level: e.target.value })}>
                  {['Low', 'Medium', 'High', 'Critical'].map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Owner Team</label>
                <input className="input" value={form.owner_team || ''} onChange={(e) => setForm({ ...form, owner_team: e.target.value })} />
              </div>
              <div>
                <label className="label">Business Unit</label>
                <input className="input" value={form.business_unit || ''} onChange={(e) => setForm({ ...form, business_unit: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="label">Tech Stack</label>
                <input className="input" value={form.tech_stack || ''} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Previous Findings */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Previous Findings</h2>
        <button onClick={() => setShowFindingModal(true)} className="btn-primary text-sm">+ Add Finding</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2 font-medium">Title</th>
              <th className="pb-2 font-medium">Severity</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">First Found</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 font-medium">{f.title}</td>
                <td className="py-2"><SeverityBadge value={f.severity} /></td>
                <td className="py-2"><StatusBadge value={f.status} /></td>
                <td className="py-2 text-gray-500">{f.first_found_date || '—'}</td>
              </tr>
            ))}
            {findings.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-gray-400 text-center">No findings recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assessment History Timeline */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Assessment History</h2>
        {timeline.length === 0 ? (
          <div className="card text-center py-8 text-gray-400 text-sm">
            No assessments for this product yet.{' '}
            <Link href="/assessments" className="text-brand-600 hover:underline">Create one</Link>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {timeline.map((a, idx) => {
                const isActive = a.status === 'Active'
                const dotColor = a.status === 'Completed' ? 'bg-green-500' : a.status === 'Active' ? 'bg-brand-500' : 'bg-orange-400'
                return (
                  <div key={a.id} className="flex gap-4 pl-10 relative">
                    {/* Dot */}
                    <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 border-white ${dotColor}`} />
                    <div className="card flex-1 p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{a.environment}</span>
                            <StatusBadge value={a.status} />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {a.start_date || 'No start date'}
                            {a.end_date ? ` → ${a.end_date}` : isActive ? ' → ongoing' : ''}
                          </p>
                        </div>
                        <Link
                          href={`/assessments/${a.id}`}
                          className="text-xs text-brand-600 hover:underline shrink-0"
                        >
                          Open assessment
                        </Link>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500 mb-1">Endpoint Coverage</p>
                          <CoverageBar pct={a.endpoint_coverage_pct} />
                          <p className="text-gray-400 mt-0.5">{a.tested_endpoints}/{a.total_endpoints} tested</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Checklist Completion</p>
                          <CoverageBar pct={a.checklist_completion_pct} />
                          <p className="text-gray-400 mt-0.5">{a.completed_checks}/{a.total_checks} checks done</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showFindingModal && (
        <Modal title="Add Finding" onClose={() => setShowFindingModal(false)}>
          <form onSubmit={addFinding} className="space-y-3">
            <div>
              <label className="label">Title *</label>
              <input className="input" required value={findingForm.title} onChange={(e) => setFindingForm({ ...findingForm, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Severity</label>
                <select className="input" value={findingForm.severity} onChange={(e) => setFindingForm({ ...findingForm, severity: e.target.value })}>
                  {['Informational', 'Low', 'Medium', 'High', 'Critical'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">First Found Date</label>
                <input className="input" type="date" value={findingForm.first_found_date} onChange={(e) => setFindingForm({ ...findingForm, first_found_date: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={findingForm.description} onChange={(e) => setFindingForm({ ...findingForm, description: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary">Add</button>
              <button type="button" onClick={() => setShowFindingModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
