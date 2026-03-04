import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import AssessmentNav from '../../../components/AssessmentNav'
import Modal from '../../../components/Modal'
import { SeverityBadge, StatusBadge } from '../../../components/StatusBadge'
import {
  getAssessment, getFindings, getVerifications, createVerification, updateVerification,
} from '../../../services/api'

export default function FindingsPage() {
  const { query } = useRouter()
  const id = query.id

  const [assessment, setAssessment] = useState(null)
  const [findings, setFindings] = useState([])
  const [verifications, setVerifications] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [verifyForm, setVerifyForm] = useState({ finding_id: '', status: 'Reproduced', reason: '' })

  useEffect(() => {
    if (!id) return
    getAssessment(id).then(async (r) => {
      setAssessment(r.data)
      const [fRes, vRes] = await Promise.all([
        getFindings(r.data.product_id),
        getVerifications(id),
      ])
      setFindings(fRes.data)
      setVerifications(vRes.data)
    })
  }, [id])

  const getVerification = (findingId) => verifications.find((v) => v.finding_id === findingId)

  const handleVerify = async (e) => {
    e.preventDefault()
    const existing = getVerification(verifyForm.finding_id)
    if (existing) {
      await updateVerification(id, existing.id, { status: verifyForm.status, reason: verifyForm.reason })
    } else {
      await createVerification(id, verifyForm)
    }
    const vRes = await getVerifications(id)
    setVerifications(vRes.data)
    setShowModal(false)
    setVerifyForm({ finding_id: '', status: 'Reproduced', reason: '' })
  }

  const openVerify = (finding) => {
    const existing = getVerification(finding.id)
    setVerifyForm({
      finding_id: finding.id,
      status: existing?.status || 'Reproduced',
      reason: existing?.reason || '',
    })
    setShowModal(true)
  }

  const VERIFICATION_BADGE = { Reproduced: 'badge-orange', Fixed: 'badge-green', 'Not Applicable': 'badge-gray' }

  return (
    <Layout>
      <AssessmentNav assessmentId={id} />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Previous Findings</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {verifications.length}/{findings.length} verified
          </p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2 font-medium">Title</th>
              <th className="pb-2 font-medium">Severity</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Verification</th>
              <th className="pb-2 font-medium">Reason</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => {
              const v = getVerification(f.id)
              return (
                <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 font-medium">{f.title}</td>
                  <td className="py-2"><SeverityBadge value={f.severity} /></td>
                  <td className="py-2"><StatusBadge value={f.status} /></td>
                  <td className="py-2">
                    {v ? <span className={VERIFICATION_BADGE[v.status] || 'badge-gray'}>{v.status}</span> : <span className="badge-gray">Unverified</span>}
                  </td>
                  <td className="py-2 text-gray-500 text-xs">{v?.reason || '—'}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => openVerify(f)} className="text-brand-600 hover:text-brand-800 text-xs">
                      {v ? 'Update' : 'Verify'}
                    </button>
                  </td>
                </tr>
              )
            })}
            {findings.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-gray-400">No previous findings for this product.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Verify Finding" onClose={() => setShowModal(false)}>
          <form onSubmit={handleVerify} className="space-y-3">
            <div>
              <label className="label">Verification Status *</label>
              <select className="input" value={verifyForm.status} onChange={(e) => setVerifyForm({ ...verifyForm, status: e.target.value })}>
                {['Reproduced', 'Fixed', 'Not Applicable'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Reason / Notes</label>
              <textarea className="input" rows={3} value={verifyForm.reason} onChange={(e) => setVerifyForm({ ...verifyForm, reason: e.target.value })} placeholder="Patched in v2.3, endpoint removed, etc." />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
