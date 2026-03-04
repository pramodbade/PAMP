import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../components/Layout'
import { globalSearch } from '../services/api'
import { SeverityBadge, StatusBadge } from '../components/StatusBadge'

export default function SearchPage() {
  const router = useRouter()
  const { q: queryParam } = router.query

  const [query, setQuery] = useState(queryParam || '')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Sync from URL param on first load
  useEffect(() => {
    if (queryParam && queryParam.length >= 2) {
      setQuery(queryParam)
      doSearch(queryParam)
    }
  }, [queryParam])

  const doSearch = async (term) => {
    if (term.length < 2) { setResults(null); return }
    setLoading(true)
    setError(null)
    try {
      const res = await globalSearch(term)
      setResults(res.data)
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      router.replace({ pathname: '/search', query: val ? { q: val } : {} }, undefined, { shallow: true })
      doSearch(val)
    }, 300)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    router.replace({ pathname: '/search', query: query ? { q: query } : {} }, undefined, { shallow: true })
    doSearch(query)
  }

  const totalResults = results ? results.products.length + results.findings.length : 0

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search</h1>

        {/* Search input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search products, findings…"
              className="input pl-9 text-base w-full"
            />
            {loading && (
              <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">
                Searching…
              </span>
            )}
          </div>
        </form>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Results summary */}
        {results && !loading && (
          <p className="text-xs text-gray-400 mb-4">
            {totalResults === 0
              ? `No results for "${results.query}"`
              : `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${results.query}"`}
          </p>
        )}

        {results && (
          <div className="space-y-6">
            {/* Products */}
            {results.products.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Products ({results.products.length})
                </h2>
                <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
                  {results.products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        {p.subtitle && <p className="text-xs text-gray-500 mt-0.5">{p.subtitle}</p>}
                      </div>
                      <RiskBadge value={p.risk_level} />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Findings */}
            {results.findings.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Findings ({results.findings.length})
                </h2>
                <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
                  {results.findings.map((f) => (
                    <Link
                      key={f.id}
                      href={`/products/${f.product_id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{f.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Finding — view on product page</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <SeverityBadge value={f.subtitle} />
                        <StatusBadge value={f.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {totalResults === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg mb-1">No results found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}
          </div>
        )}

        {!results && !loading && query.length < 2 && (
          <p className="text-gray-400 text-sm text-center py-8">Type at least 2 characters to search</p>
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
  if (!value) return null
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colors[value] || 'bg-gray-100 text-gray-600'}`}>
      {value}
    </span>
  )
}
