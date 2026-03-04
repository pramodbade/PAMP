import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import AssessmentNav from '../../../components/AssessmentNav'
import Modal from '../../../components/Modal'
import { getEndpoints, createEndpoint, updateEndpoint, deleteEndpoint } from '../../../services/api'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
const EMPTY = { path: '', method: 'GET', authentication_required: false, role_required: '', notes: '' }

const METHOD_COLOR = {
  GET: 'badge-green', POST: 'badge-blue', PUT: 'badge-yellow',
  PATCH: 'badge-orange', DELETE: 'badge-red', HEAD: 'badge-gray', OPTIONS: 'badge-gray',
}

// ── Burp paste parser ─────────────────────────────────────────────────────────
// Supported formats:
//
// 1. Burp "Save items" XML  →  <method>POST</method> + <path>/api/users</path>
// 2. HTTP request lines     →  POST /api/users HTTP/1.1
// 3. Full URLs              →  https://host.com/api/users   (defaults to GET)
//
// Returns array of { method, path } — deduplicated, existing entries excluded.

// Extensions and path prefixes that indicate static / non-API resources
const STATIC_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx',
  'css', 'scss', 'less', 'sass',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp', 'tiff', 'avif',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'pdf', 'zip', 'gz', 'tar', 'rar',
  'mp4', 'mp3', 'webm', 'ogg', 'avi', 'mov',
  'map',       // source maps
  'txt', 'xml', 'csv',
  'html', 'htm',
])

const STATIC_PATH_PREFIXES = [
  '/static/', '/assets/', '/public/', '/images/', '/img/', '/fonts/',
  '/media/', '/dist/', '/build/', '/_next/', '/chunks/', '/node_modules/',
  '/favicon', '/robots', '/sitemap', '/manifest',
]

function isStaticPath(path) {
  // Check extension
  const ext = path.split('.').pop()?.toLowerCase()
  if (ext && ext !== path && STATIC_EXTENSIONS.has(ext)) return true
  // Check known static prefixes
  const lower = path.toLowerCase()
  if (STATIC_PATH_PREFIXES.some((p) => lower.startsWith(p))) return true
  return false
}

function parseBurpText(text, existingEndpoints) {
  const existingKeys = new Set(existingEndpoints.map((e) => `${e.method}:${e.path}`))
  const seen = new Set()
  const parsed = []

  const addEntry = (method, path) => {
    if (!path || path === '/') return
    path = path.split('?')[0].split('#')[0]   // strip query / fragment
    if (!path) return
    if (isStaticPath(path)) return            // skip static files
    const key = `${method}:${path}`
    if (seen.has(key) || existingKeys.has(key)) return
    seen.add(key)
    parsed.push({ method, path })
  }

  // ── Format 1: Burp "Save items" XML ──────────────────────────────────────
  // Use DOMParser so CDATA sections are resolved automatically
  const looksLikeXml = text.trimStart().startsWith('<')
  if (looksLikeXml) {
    try {
      const doc = new DOMParser().parseFromString(text, 'text/xml')
      const items = doc.querySelectorAll('item')
      for (const item of items) {
        const method = item.querySelector('method')?.textContent?.trim().toUpperCase()
        const path   = item.querySelector('path')?.textContent?.trim()
        if (method && path) addEntry(method, path)
      }
      if (items.length > 0) return parsed
    } catch { /* fall through to line parser */ }
  }

  // ── Format 2 & 3: line-by-line (HTTP request lines or URLs) ──────────────
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue

    // HTTP request line: "METHOD /path HTTP/1.x"
    const httpReqMatch = line.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\/[^\s]*)\s+HTTP\/\d/i)
    if (httpReqMatch) {
      addEntry(httpReqMatch[1].toUpperCase(), httpReqMatch[2])
      continue
    }

    // Full URL: https://host/path
    if (line.startsWith('http')) {
      try {
        const url = new URL(line.split(/\s/)[0])
        addEntry('GET', url.pathname)
      } catch { /* skip */ }
      continue
    }

    // Bare path: /api/something
    if (line.startsWith('/')) {
      addEntry('GET', line.split(/[\s?#]/)[0])
    }
  }

  return parsed
}

export default function EndpointsPage() {
  const { query } = useRouter()
  const id = query.id
  const [endpoints, setEndpoints] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showBurpModal, setShowBurpModal] = useState(false)
  const [form, setForm] = useState(EMPTY)

  // Burp import state
  const [burpText, setBurpText] = useState('')
  const [burpPreview, setBurpPreview] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const load = () => id && getEndpoints(id).then((r) => setEndpoints(r.data))
  useEffect(() => { load() }, [id])

  // ── Single add ────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault()
    await createEndpoint(id, { ...form, authentication_required: !!form.authentication_required })
    setShowModal(false)
    setForm(EMPTY)
    load()
  }

  const toggleTested = async (ep) => {
    await updateEndpoint(id, ep.id, { tested_status: !ep.tested_status })
    load()
  }

  const handleDelete = async (epId) => {
    if (!confirm('Delete endpoint?')) return
    await deleteEndpoint(id, epId)
    load()
  }

  // ── Burp import ───────────────────────────────────────────────────────────
  const handleBurpParse = () => {
    const preview = parseBurpText(burpText, endpoints)
    setBurpPreview(preview)
    setImportResult(null)
  }

  // Read XML file in browser only — file never leaves the client
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      // Clear the input so the same file can be re-selected if needed
      e.target.value = ''
      const preview = parseBurpText(text, endpoints)
      setBurpPreview(preview)
      setBurpText('')
      setImportResult(null)
    }
    reader.readAsText(file)
  }

  const updatePreviewMethod = (index, method) => {
    setBurpPreview((prev) => prev.map((ep, i) => i === index ? { ...ep, method } : ep))
  }

  const removePreviewItem = (index) => {
    setBurpPreview((prev) => prev.filter((_, i) => i !== index))
  }

  const handleBurpImport = async () => {
    if (!burpPreview?.length) return
    setImporting(true)
    let added = 0
    for (const ep of burpPreview) {
      try {
        await createEndpoint(id, { method: ep.method, path: ep.path, authentication_required: false })
        added++
      } catch { /* skip */ }
    }
    setImportResult({ added, total: burpPreview.length })
    setImporting(false)
    setBurpPreview(null)
    setBurpText('')
    load()
  }

  const closeBurpModal = () => {
    setShowBurpModal(false)
    setBurpText('')
    setBurpPreview(null)
    setImportResult(null)
  }

  const tested = endpoints.filter((e) => e.tested_status).length

  return (
    <Layout>
      <AssessmentNav assessmentId={id} />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Endpoint Inventory</h2>
          <p className="text-sm text-gray-500 mt-0.5">{tested}/{endpoints.length} tested</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBurpModal(true)} className="btn-secondary">
            Import from Burp
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Endpoint</button>
        </div>
      </div>

      {/* Endpoint table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2 font-medium">Method</th>
              <th className="pb-2 font-medium">Path</th>
              <th className="pb-2 font-medium">Auth</th>
              <th className="pb-2 font-medium">Role</th>
              <th className="pb-2 font-medium">Tested</th>
              <th className="pb-2 font-medium">Notes</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep) => (
              <tr key={ep.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2"><span className={METHOD_COLOR[ep.method] || 'badge-gray'}>{ep.method}</span></td>
                <td className="py-2 font-mono text-xs">{ep.path}</td>
                <td className="py-2">{ep.authentication_required ? 'Yes' : '-'}</td>
                <td className="py-2 text-gray-500">{ep.role_required || '-'}</td>
                <td className="py-2">
                  <button
                    onClick={() => toggleTested(ep)}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${ep.tested_status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {ep.tested_status ? 'Tested' : 'Untested'}
                  </button>
                </td>
                <td className="py-2 text-gray-500 text-xs">{ep.notes || '-'}</td>
                <td className="py-2 text-right">
                  <button onClick={() => handleDelete(ep.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {endpoints.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-gray-400">No endpoints added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Single add modal */}
      {showModal && (
        <Modal title="Add Endpoint" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="label">Method *</label>
                <select className="input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  {METHODS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Path *</label>
                <input className="input font-mono" required placeholder="/api/users/{id}" value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Auth Required</label>
                <select className="input" value={form.authentication_required ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, authentication_required: e.target.value === 'yes' })}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="label">Role Required</label>
                <input className="input" value={form.role_required} onChange={(e) => setForm({ ...form, role_required: e.target.value })} placeholder="Admin, User..." />
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary">Add</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Burp import modal */}
      {showBurpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-semibold">Import from Burp Suite</h2>
                <p className="text-xs text-gray-500 mt-0.5">Duplicates are skipped automatically.</p>
              </div>
              <button onClick={closeBurpModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">

              {/* How to export hint */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-800">
                <p className="font-semibold mb-1">How to export from Burp (preserves HTTP method):</p>
                <p>HTTP History → select requests → right-click → <strong>Save items</strong> → upload the .xml file below</p>
              </div>

              {/* File upload — processed in browser, never sent to server */}
              {!burpPreview && !importResult && (
                <div>
                  <label className="label">Upload Burp XML file</label>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-colors">
                    <span className="text-sm text-gray-500">Click to select <strong>Save items</strong> .xml file</span>
                    <span className="text-xs text-gray-400 mt-1">Processed locally — file is never uploaded</span>
                    <input
                      type="file"
                      accept=".xml,text/xml,application/xml"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              )}

              {/* Divider */}
              {!burpPreview && !importResult && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">or paste text</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}

              {/* Text paste fallback */}
              {!burpPreview && !importResult && (
                <div>
                  <textarea
                    className="input font-mono text-xs"
                    rows={5}
                    value={burpText}
                    onChange={(e) => { setBurpText(e.target.value); setBurpPreview(null); setImportResult(null) }}
                    placeholder={"POST /api/login HTTP/1.1\nhttps://app.example.com/api/users/42\n..."}
                  />
                  <button
                    onClick={handleBurpParse}
                    disabled={!burpText.trim()}
                    className="btn-secondary w-full justify-center mt-2"
                  >
                    Parse Text
                  </button>
                </div>
              )}

              {/* Preview with editable methods */}
              {burpPreview && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">
                      {burpPreview.length > 0
                        ? <>{burpPreview.length} new endpoint{burpPreview.length !== 1 ? 's' : ''} <span className="text-gray-400 font-normal">(duplicates excluded)</span></>
                        : <span className="text-yellow-600">No new endpoints — all already exist.</span>
                      }
                    </p>
                    <button onClick={() => setBurpPreview(null)} className="text-xs text-gray-400 hover:text-gray-600">Re-parse</button>
                  </div>

                  {burpPreview.length > 0 && (
                    <>
                      <p className="text-xs text-gray-500 mb-2">You can change the method or remove rows before importing.</p>
                      <div className="border rounded-md overflow-auto max-h-64 mb-3">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 text-gray-500 text-left border-b sticky top-0">
                              <th className="px-3 py-1.5 font-medium w-28">Method</th>
                              <th className="px-3 py-1.5 font-medium">Path</th>
                              <th className="px-3 py-1.5 w-8"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {burpPreview.map((ep, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-3 py-1">
                                  <select
                                    className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white"
                                    value={ep.method}
                                    onChange={(e) => updatePreviewMethod(i, e.target.value)}
                                  >
                                    {METHODS.map((m) => <option key={m}>{m}</option>)}
                                  </select>
                                </td>
                                <td className="px-3 py-1 font-mono text-gray-700">{ep.path}</td>
                                <td className="px-3 py-1 text-center">
                                  <button onClick={() => removePreviewItem(i)} className="text-gray-300 hover:text-red-500 font-bold leading-none">&times;</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <button onClick={handleBurpImport} disabled={importing} className="btn-primary w-full justify-center">
                        {importing ? 'Importing...' : `Import ${burpPreview.length} Endpoint${burpPreview.length !== 1 ? 's' : ''}`}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Result */}
              {importResult && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-800 text-center">
                  Import complete — <strong>{importResult.added}</strong> endpoint{importResult.added !== 1 ? 's' : ''} added.
                  <div className="mt-3 flex gap-2 justify-center">
                    <button onClick={closeBurpModal} className="btn-primary text-sm">Done</button>
                    <button onClick={() => { setBurpText(''); setBurpPreview(null); setImportResult(null) }} className="btn-secondary text-sm">Import More</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
