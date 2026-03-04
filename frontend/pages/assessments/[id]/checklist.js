import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import AssessmentNav from '../../../components/AssessmentNav'
import { getChecklist, updateChecklistItem } from '../../../services/api'

const STATUS_OPTIONS = ['Pending', 'Completed', 'Not Applicable', 'Issue Found']
const STATUS_COLOR = {
  Pending: 'badge-gray',
  Completed: 'badge-green',
  'Not Applicable': 'badge-yellow',
  'Issue Found': 'badge-red',
}

export default function ChecklistPage() {
  const { query } = useRouter()
  const id = query.id
  const [items, setItems] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ status: '', notes: '' })

  const load = () => id && getChecklist(id).then((r) => setItems(r.data))
  useEffect(() => { load() }, [id])

  const grouped = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || []
    acc[item.category].push(item)
    return acc
  }, {})

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditForm({ status: item.status, notes: item.notes || '' })
  }

  const saveEdit = async (item) => {
    await updateChecklistItem(id, item.id, editForm)
    setEditingId(null)
    load()
  }

  const total = items.length
  const done = items.filter((i) => i.status !== 'Pending').length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <Layout>
      <AssessmentNav assessmentId={id} />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Checklist</h2>
          <p className="text-sm text-gray-500 mt-0.5">{done}/{total} items actioned ({pct}%)</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{category}</h3>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium w-8"></th>
                  <th className="pb-2 font-medium">Test</th>
                  <th className="pb-2 font-medium w-32">Status</th>
                  <th className="pb-2 font-medium">Notes</th>
                  <th className="pb-2 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {categoryItems.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 text-center">
                      {item.mandatory ? <span title="Mandatory" className="text-red-400">*</span> : ''}
                    </td>
                    <td className="py-2">
                      <div className="font-medium">{item.test_name}</div>
                      {item.description && <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>}
                    </td>
                    <td className="py-2">
                      {editingId === item.id ? (
                        <select className="input text-xs py-1" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={STATUS_COLOR[item.status] || 'badge-gray'}>{item.status}</span>
                      )}
                    </td>
                    <td className="py-2">
                      {editingId === item.id ? (
                        <input className="input text-xs py-1" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Notes..." />
                      ) : (
                        <span className="text-xs text-gray-500">{item.notes || '—'}</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {editingId === item.id ? (
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => saveEdit(item)} className="text-green-600 hover:text-green-800 text-xs font-medium">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(item)} className="text-brand-600 hover:text-brand-800 text-xs">Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </Layout>
  )
}
