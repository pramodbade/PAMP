import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import { getDashboardMetrics, getDashboardCoverage, getDashboardHeatmap } from '../services/api'
import { StatusBadge } from '../components/StatusBadge'

function MetricCard({ label, value, sub, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 border-brand-100 text-brand-900',
    green: 'bg-green-50 border-green-100 text-green-900',
    amber: 'bg-amber-50 border-amber-100 text-amber-900',
    red: 'bg-red-50 border-red-100 text-red-900',
  }
  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  )
}

function CoveragePill({ pct }) {
  let cls = 'bg-gray-100 text-gray-500'
  if (pct >= 80) cls = 'bg-green-100 text-green-700'
  else if (pct >= 50) cls = 'bg-blue-100 text-blue-700'
  else if (pct > 0) cls = 'bg-amber-100 text-amber-700'
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {pct}%
    </span>
  )
}

function CoverageBar({ pct }) {
  let barColor = 'bg-gray-300'
  if (pct >= 80) barColor = 'bg-green-500'
  else if (pct >= 50) barColor = 'bg-blue-500'
  else if (pct > 0) barColor = 'bg-amber-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

function HeatmapCell({ assessment }) {
  const pct = assessment.endpoint_coverage_pct
  let bg = 'bg-gray-100 text-gray-500 border-gray-200'
  if (assessment.status === 'Completed') {
    if (pct >= 80) bg = 'bg-green-100 text-green-800 border-green-200'
    else if (pct >= 50) bg = 'bg-blue-100 text-blue-800 border-blue-200'
    else bg = 'bg-amber-100 text-amber-800 border-amber-200'
  } else if (assessment.status === 'Active') {
    bg = 'bg-brand-100 text-brand-900 border-brand-200'
  } else {
    bg = 'bg-orange-100 text-orange-800 border-orange-200'
  }

  return (
    <Link
      href={`/assessments/${assessment.id}`}
      title={`${assessment.environment} | Coverage: ${pct}% | Checklist: ${assessment.checklist_completion_pct}%`}
      className={`inline-flex flex-col items-center justify-center border rounded px-2 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${bg}`}
    >
      <span>{assessment.environment.slice(0, 4).toUpperCase()}</span>
      <span className="opacity-70">{pct}%</span>
    </Link>
  )
}

const RISK_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 }

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null)
  const [coverage, setCoverage] = useState([])
  const [heatmap, setHeatmap] = useState([])
  const [loading, setLoading] = useState(true)
  const [coverageSort, setCoverageSort] = useState({ col: 'start_date', dir: 'desc' })

  useEffect(() => {
    Promise.all([
      getDashboardMetrics(),
      getDashboardCoverage(),
      getDashboardHeatmap(),
    ]).then(([m, c, h]) => {
      setMetrics(m.data)
      setCoverage(c.data)
      setHeatmap(h.data.sort((a, b) => (RISK_ORDER[a.risk_level] ?? 4) - (RISK_ORDER[b.risk_level] ?? 4)))
      setLoading(false)
    })
  }, [])

  const sortedCoverage = [...coverage].sort((a, b) => {
    const { col, dir } = coverageSort
    let va = a[col] ?? ''
    let vb = b[col] ?? ''
    if (typeof va === 'number') return dir === 'asc' ? va - vb : vb - va
    return dir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
  })

  const toggleSort = (col) => {
    setCoverageSort((s) => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }))
  }

  const SortIcon = ({ col }) => {
    if (coverageSort.col !== col) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="ml-1">{coverageSort.dir === 'asc' ? '↑' : '↓'}</span>
  }

  if (loading) return <Layout><p className="text-gray-400">Loading dashboard…</p></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide coverage and assessment metrics</p>
      </div>

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Products" value={metrics.total_products} color="brand" />
        <MetricCard
          label="Assessments"
          value={metrics.total_assessments}
          sub={`${metrics.active_assessments} active · ${metrics.completed_assessments} completed`}
          color="brand"
        />
        <MetricCard
          label="Endpoint Coverage"
          value={`${metrics.endpoint_coverage_pct}%`}
          sub={`${metrics.tested_endpoints} / ${metrics.total_endpoints} tested`}
          color={metrics.endpoint_coverage_pct >= 80 ? 'green' : metrics.endpoint_coverage_pct >= 50 ? 'brand' : 'amber'}
        />
        <MetricCard
          label="Open Findings"
          value={metrics.open_findings}
          sub={`of ${metrics.total_findings} total`}
          color={metrics.open_findings > 0 ? 'red' : 'green'}
        />
      </div>

      {/* ── Product Heatmap ── */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Product Heatmap</h2>
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-brand-100 inline-block border border-brand-200" /> Active</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 inline-block border border-green-200" /> Completed ≥80%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 inline-block border border-amber-200" /> Low coverage</span>
          </div>
        </div>
        {heatmap.length === 0 ? (
          <p className="text-gray-400 text-sm">No products yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium w-48">Product</th>
                  <th className="pb-2 font-medium w-20">Risk</th>
                  <th className="pb-2 font-medium w-24">Team</th>
                  <th className="pb-2 font-medium">Assessments (newest → oldest)</th>
                </tr>
              </thead>
              <tbody>
                {heatmap.map((row) => (
                  <tr key={row.product_id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2">
                      <Link href={`/products/${row.product_id}`} className="font-medium text-brand-600 hover:underline">
                        {row.product_name}
                      </Link>
                    </td>
                    <td className="py-2">
                      <RiskBadge value={row.risk_level} />
                    </td>
                    <td className="py-2 text-gray-500 text-xs">{row.owner_team}</td>
                    <td className="py-2">
                      {row.assessments.length === 0 ? (
                        <span className="text-gray-300 text-xs">No assessments</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {row.assessments.map((a) => (
                            <HeatmapCell key={a.id} assessment={a} />
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Assessment Coverage Table ── */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Assessment Coverage</h2>
        {coverage.length === 0 ? (
          <p className="text-gray-400 text-sm">No assessments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs">
                  <th className="pb-2 font-medium cursor-pointer hover:text-gray-700" onClick={() => toggleSort('product_name')}>
                    Product <SortIcon col="product_name" />
                  </th>
                  <th className="pb-2 font-medium cursor-pointer hover:text-gray-700" onClick={() => toggleSort('environment')}>
                    Environment <SortIcon col="environment" />
                  </th>
                  <th className="pb-2 font-medium cursor-pointer hover:text-gray-700" onClick={() => toggleSort('status')}>
                    Status <SortIcon col="status" />
                  </th>
                  <th className="pb-2 font-medium cursor-pointer hover:text-gray-700" onClick={() => toggleSort('start_date')}>
                    Start <SortIcon col="start_date" />
                  </th>
                  <th className="pb-2 font-medium">Endpoint Coverage</th>
                  <th className="pb-2 font-medium">Checklist</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {sortedCoverage.map((row) => (
                  <tr key={row.assessment_id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 font-medium">{row.product_name}</td>
                    <td className="py-2 text-gray-600">{row.environment}</td>
                    <td className="py-2"><StatusBadge value={row.status} /></td>
                    <td className="py-2 text-gray-500">{row.start_date || '—'}</td>
                    <td className="py-2 w-40">
                      <CoverageBar pct={row.endpoint_coverage_pct} />
                      <span className="text-xs text-gray-400">{row.tested_endpoints}/{row.total_endpoints} endpoints</span>
                    </td>
                    <td className="py-2 w-24">
                      <CoveragePill pct={row.checklist_completion_pct} />
                      <div className="text-xs text-gray-400 mt-0.5">{row.completed_checks}/{row.total_checks} checks</div>
                    </td>
                    <td className="py-2">
                      <Link href={`/assessments/${row.assessment_id}`} className="text-xs text-brand-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

function RiskBadge({ value }) {
  const colors = {
    Critical: 'bg-red-100 text-red-700',
    High: 'bg-orange-100 text-orange-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-green-100 text-green-700',
  }
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colors[value] || 'bg-gray-100 text-gray-600'}`}>
      {value}
    </span>
  )
}
