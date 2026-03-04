import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../../components/Layout'
import AssessmentNav from '../../../components/AssessmentNav'
import { StatusBadge } from '../../../components/StatusBadge'
import { getAssessment, getProduct, updateAssessment, getChecklist, getBlockers, getEndpoints } from '../../../services/api'

export default function AssessmentOverview() {
  const { query } = useRouter()
  const id = query.id

  const [assessment, setAssessment] = useState(null)
  const [product, setProduct] = useState(null)
  const [stats, setStats] = useState({ total: 0, completed: 0, endpoints: 0, tested: 0, blockers: 0 })

  useEffect(() => {
    if (!id) return
    getAssessment(id).then((r) => {
      setAssessment(r.data)
      getProduct(r.data.product_id).then((pr) => setProduct(pr.data))
    })
    Promise.all([getChecklist(id), getEndpoints(id), getBlockers(id)]).then(([cl, ep, bl]) => {
      const items = cl.data
      setStats({
        total: items.length,
        completed: items.filter((i) => i.status !== 'Pending').length,
        endpoints: ep.data.length,
        tested: ep.data.filter((e) => e.tested_status).length,
        blockers: bl.data.filter((b) => !b.resolved).length,
      })
    })
  }, [id])

  const changeStatus = async (status) => {
    try {
      const { data } = await updateAssessment(id, { status })
      setAssessment(data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Cannot change status')
    }
  }

  if (!assessment) return <Layout><p className="text-gray-500 p-4">Loading…</p></Layout>

  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <Layout>
      <div className="mb-2">
        <Link href="/assessments" className="text-sm text-brand-600 hover:underline">← Assessments</Link>
      </div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">{product?.product_name || '…'}</h1>
          <p className="text-gray-500 text-sm">{assessment.environment} · Started {assessment.start_date}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge value={assessment.status} />
          {assessment.status === 'Active' && (
            <button onClick={() => changeStatus('On Hold')} className="btn-secondary text-xs">Hold</button>
          )}
          {assessment.status === 'On Hold' && (
            <button onClick={() => changeStatus('Active')} className="btn-secondary text-xs">Resume</button>
          )}
          {assessment.status !== 'Completed' && (
            <button onClick={() => changeStatus('Completed')} className="btn-primary text-xs">Complete</button>
          )}
        </div>
      </div>

      <AssessmentNav assessmentId={id} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-brand-600">{pct}%</div>
          <div className="text-sm text-gray-500 mt-1">Checklist done</div>
          <div className="text-xs text-gray-400">{stats.completed}/{stats.total} items</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-brand-600">{stats.tested}</div>
          <div className="text-sm text-gray-500 mt-1">Endpoints tested</div>
          <div className="text-xs text-gray-400">of {stats.endpoints} total</div>
        </div>
        <div className="card text-center">
          <div className={`text-3xl font-bold ${stats.blockers > 0 ? 'text-red-500' : 'text-green-500'}`}>{stats.blockers}</div>
          <div className="text-sm text-gray-500 mt-1">Open blockers</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-600">{assessment.estimated_effort_days || '—'}</div>
          <div className="text-sm text-gray-500 mt-1">Effort (days)</div>
        </div>
      </div>

      {/* Quick links */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Assessment Sections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: `/assessments/${id}/scope`, label: 'Scope', icon: '🎯' },
            { href: `/assessments/${id}/endpoints`, label: 'Endpoints', icon: '🔌' },
            { href: `/assessments/${id}/checklist`, label: 'Checklist', icon: '✅' },
            { href: `/assessments/${id}/findings`, label: 'Findings', icon: '🔍' },
            { href: `/assessments/${id}/blockers`, label: 'Blockers', icon: '🚧' },
            { href: `/assessments/${id}/custom-tests`, label: 'Custom Tests', icon: '🧪' },
            { href: `/assessments/${id}/summary`, label: 'Summary', icon: '📋' },
          ].map((s) => (
            <Link key={s.href} href={s.href} className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-colors text-sm font-medium">
              <span>{s.icon}</span> {s.label}
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}
