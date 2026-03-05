import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import AssessmentNav from '../../../components/AssessmentNav'
import { getChecklist, updateChecklistItem } from '../../../services/api'

// ── Status config ─────────────────────────────────────────────────────────────
// Maps UI actions → existing backend status values
const ACTIONS = [
  {
    key: 'Completed',
    label: 'Pass',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    activeClass: 'bg-green-100 text-green-700 border-green-300',
    hoverClass: 'hover:bg-green-50 hover:text-green-600 hover:border-green-200',
  },
  {
    key: 'Issue Found',
    label: 'Fail',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    activeClass: 'bg-red-100 text-red-700 border-red-300',
    hoverClass: 'hover:bg-red-50 hover:text-red-600 hover:border-red-200',
  },
  {
    key: 'Not Applicable',
    label: 'N/A',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
        <path strokeLinecap="round" strokeWidth={2} d="M9 12h6" />
      </svg>
    ),
    activeClass: 'bg-blue-100 text-blue-700 border-blue-300',
    hoverClass: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200',
  },
]

const STATUS_BADGE = {
  Completed: 'badge-green',
  'Issue Found': 'badge-red',
  'Not Applicable': 'badge-blue',
  Pending: 'badge-gray',
}

// ── Single checklist item ─────────────────────────────────────────────────────
function ChecklistItem({ item, assessmentId, onUpdate }) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState(item.notes || '')
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef(null)

  // Sync note text if item changes externally
  useEffect(() => { setNoteText(item.notes || '') }, [item.notes])

  const setStatus = async (newStatus) => {
    // Toggle off → Pending if clicking the already-active status
    const target = item.status === newStatus ? 'Pending' : newStatus

    // Optimistic update
    onUpdate(item.id, { status: target })

    try {
      await updateChecklistItem(assessmentId, item.id, { status: target, notes: item.notes })
    } catch {
      // Revert on failure
      onUpdate(item.id, { status: item.status })
    }
  }

  const saveNote = async (text) => {
    setSaving(true)
    try {
      await updateChecklistItem(assessmentId, item.id, { status: item.status, notes: text })
      onUpdate(item.id, { notes: text })
    } finally {
      setSaving(false)
    }
  }

  const handleNoteChange = (e) => {
    const val = e.target.value
    setNoteText(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveNote(val), 700)
  }

  return (
    <div className={`px-4 py-3 border-b last:border-0 transition-colors ${
      item.status !== 'Pending' ? 'bg-white' : 'bg-white'
    }`}>
      <div className="flex items-start gap-3">
        {/* Mandatory indicator */}
        <div className="w-3 flex-shrink-0 pt-0.5">
          {item.mandatory && (
            <span className="text-red-400 text-xs font-bold" title="Mandatory">*</span>
          )}
        </div>

        {/* Test info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="font-medium text-gray-900 text-sm">{item.test_name}</span>
              {item.description && (
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.description}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {ACTIONS.map((action) => {
                const isActive = item.status === action.key
                return (
                  <button
                    key={action.key}
                    onClick={() => setStatus(action.key)}
                    title={action.label}
                    className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium transition-all ${
                      isActive
                        ? action.activeClass
                        : `border-gray-200 text-gray-400 bg-white ${action.hoverClass}`
                    }`}
                  >
                    {action.icon}
                    {isActive && <span className="hidden sm:inline">{action.label}</span>}
                  </button>
                )
              })}

              {/* Notes toggle */}
              <button
                onClick={() => setNoteOpen((o) => !o)}
                title="Add note"
                className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium transition-all ${
                  noteOpen || item.notes
                    ? 'border-amber-300 bg-amber-50 text-amber-600'
                    : 'border-gray-200 text-gray-400 bg-white hover:bg-amber-50 hover:text-amber-500 hover:border-amber-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Inline note editor */}
          {(noteOpen || item.notes) && (
            <div className="mt-2">
              <textarea
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-gray-700 placeholder-gray-300"
                rows={2}
                placeholder="Add a note…"
                value={noteText}
                onChange={handleNoteChange}
                onClick={() => setNoteOpen(true)}
              />
              {saving && <p className="text-xs text-gray-400 mt-0.5">Saving…</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ChecklistPage() {
  const { query } = useRouter()
  const id = query.id
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!id) return
    getChecklist(id).then((r) => setItems(r.data))
  }, [id])

  // Optimistic local update — merges partial fields into a single item
  const handleUpdate = (itemId, patch) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ...patch } : i))
    )
  }

  const grouped = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || []
    acc[item.category].push(item)
    return acc
  }, {})

  const total = items.length
  const done = items.filter((i) => i.status !== 'Pending').length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  // Counts per status for summary
  const counts = {
    Completed: items.filter((i) => i.status === 'Completed').length,
    'Issue Found': items.filter((i) => i.status === 'Issue Found').length,
    'Not Applicable': items.filter((i) => i.status === 'Not Applicable').length,
    Pending: items.filter((i) => i.status === 'Pending').length,
  }

  return (
    <Layout>
      <AssessmentNav assessmentId={id} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Checklist</h2>
          <p className="text-sm text-gray-500 mt-0.5">{done}/{total} items actioned ({pct}%)</p>
        </div>
        {/* Summary counts */}
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-700">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {counts.Completed} pass
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {counts['Issue Found']} fail
          </span>
          <span className="flex items-center gap-1 text-blue-600">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="M9 12h6" />
            </svg>
            {counts['Not Applicable']} n/a
          </span>
          <span className="text-gray-400">{counts.Pending} pending</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div className="bg-brand-600 h-2 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>

      {/* Categories */}
      {Object.entries(grouped).map(([category, categoryItems]) => {
        const catDone = categoryItems.filter((i) => i.status !== 'Pending').length
        return (
          <div key={category} className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{category}</h3>
              <span className="text-xs text-gray-400">{catDone}/{categoryItems.length}</span>
            </div>
            <div className="card p-0 overflow-hidden">
              {categoryItems.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  assessmentId={id}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          </div>
        )
      })}

      {items.length === 0 && (
        <p className="text-center text-gray-400 py-12">No checklist items found.</p>
      )}
    </Layout>
  )
}
