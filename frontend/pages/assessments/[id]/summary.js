import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import AssessmentNav from '../../../components/AssessmentNav'
import { getSummary, createSummary, updateSummary, getChecklist, getVerifications, getAssessment, getFindings } from '../../../services/api'

export default function SummaryPage() {
  const { query } = useRouter()
  const id = query.id

  const [summary, setSummary] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ end_date: '', total_findings: 0, reproduced_findings: 0, new_findings: 0, summary_notes: '', report_link: '' })
  const [readiness, setReadiness] = useState({ checklistPct: 0, verifiedCount: 0, totalFindings: 0 })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return

    getSummary(id).then((r) => {
      setSummary(r.data)
      setForm({ ...r.data })
    }).catch(() => setEditing(true))

    // Load readiness stats
    Promise.all([getChecklist(id), getAssessment(id)]).then(async ([clRes, aRes]) => {
      const cl = clRes.data
      const total = cl.length
      const done = cl.filter((i) => i.status !== 'Pending').length
      const [fRes, vRes] = await Promise.all([
        getFindings(aRes.data.product_id),
        getVerifications(id),
      ])
      setReadiness({
        checklistPct: total > 0 ? Math.round((done / total) * 100) : 0,
        verifiedCount: vRes.data.length,
        totalFindings: fRes.data.length,
      })
    })
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.report_link) delete payload.report_link
      if (summary) {
        const { data } = await updateSummary(id, payload)
        setSummary(data)
        setEditing(false)
      } else {
        const { data } = await createSummary(id, payload)
        setSummary(data)
        setEditing(false)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save summary')
    } finally {
      setSaving(false)
    }
  }

  const ready = readiness.checklistPct === 100 && readiness.verifiedCount >= readiness.totalFindings

  return (
    <Layout>
      <AssessmentNav assessmentId={id} />
      <h2 className="text-xl font-semibold mb-4">Assessment Summary</h2>

      {/* Readiness checklist */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Completion Readiness</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ReadinessItem
            label="Checklist Progress"
            ok={readiness.checklistPct === 100}
            value={`${readiness.checklistPct}%`}
          />
          <ReadinessItem
            label="Findings Verified"
            ok={readiness.verifiedCount >= readiness.totalFindings}
            value={`${readiness.verifiedCount}/${readiness.totalFindings}`}
          />
          <ReadinessItem
            label="Ready to Submit"
            ok={ready}
            value={ready ? 'Yes' : 'No'}
          />
        </div>
      </div>

      {/* Summary form / view */}
      {!editing && summary ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Summary Details</h3>
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Edit</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
            <div><span className="text-gray-500">End Date:</span><br /><strong>{summary.end_date}</strong></div>
            <div><span className="text-gray-500">Total Findings:</span><br /><strong>{summary.total_findings}</strong></div>
            <div><span className="text-gray-500">Reproduced:</span><br /><strong>{summary.reproduced_findings}</strong></div>
            <div><span className="text-gray-500">New Findings:</span><br /><strong>{summary.new_findings}</strong></div>
          </div>
          {summary.summary_notes && (
            <div className="mb-3"><span className="text-sm text-gray-500">Notes:</span><p className="mt-1 text-sm">{summary.summary_notes}</p></div>
          )}
          {summary.report_link && (
            <div><span className="text-sm text-gray-500">Report Link:</span><br />
              <a href={summary.report_link} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline text-sm break-all">{summary.report_link}</a>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <h3 className="font-semibold mb-4">{summary ? 'Edit Summary' : 'Create Summary & Submit Assessment'}</h3>
          {!ready && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 text-sm text-yellow-800">
              ⚠ Not all completion requirements are met. The server will reject submission if mandatory checks or finding verifications are incomplete.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="label">End Date *</label>
                <input className="input" type="date" required value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <div>
                <label className="label">Total Findings</label>
                <input className="input" type="number" min={0} value={form.total_findings} onChange={(e) => setForm({ ...form, total_findings: +e.target.value })} />
              </div>
              <div>
                <label className="label">Reproduced</label>
                <input className="input" type="number" min={0} value={form.reproduced_findings} onChange={(e) => setForm({ ...form, reproduced_findings: +e.target.value })} />
              </div>
              <div>
                <label className="label">New Findings</label>
                <input className="input" type="number" min={0} value={form.new_findings} onChange={(e) => setForm({ ...form, new_findings: +e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Summary Notes</label>
              <textarea className="input" rows={4} value={form.summary_notes || ''} onChange={(e) => setForm({ ...form, summary_notes: e.target.value })} placeholder="Key observations, overall risk assessment..." />
            </div>
            <div>
              <label className="label">Report Link (OneDrive / SharePoint)</label>
              <input className="input" type="url" value={form.report_link || ''} onChange={(e) => setForm({ ...form, report_link: e.target.value })} placeholder="https://..." />
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 rounded p-2">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : summary ? 'Update Summary' : 'Submit Assessment'}
              </button>
              {summary && <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>}
            </div>
          </form>
        </div>
      )}
    </Layout>
  )
}

function ReadinessItem({ label, ok, value }) {
  return (
    <div className={`rounded-lg p-3 border ${ok ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center gap-2">
        <span className={ok ? 'text-green-500' : 'text-gray-400'}>{ok ? '✓' : '○'}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className={`text-lg font-bold mt-1 ${ok ? 'text-green-700' : 'text-gray-600'}`}>{value}</div>
    </div>
  )
}
