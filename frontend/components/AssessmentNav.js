import Link from 'next/link'
import { useRouter } from 'next/router'

const tabs = [
  { href: '', label: 'Overview' },
  { href: '/scope', label: 'Scope' },
  { href: '/endpoints', label: 'Endpoints' },
  { href: '/checklist', label: 'Checklist' },
  { href: '/findings', label: 'Findings' },
  { href: '/blockers', label: 'Blockers' },
  { href: '/custom-tests', label: 'Custom Tests' },
  { href: '/summary', label: 'Summary' },
]

export default function AssessmentNav({ assessmentId }) {
  const router = useRouter()
  const base = `/assessments/${assessmentId}`

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const href = base + tab.href
          const active = router.asPath === href
          return (
            <Link
              key={tab.href}
              href={href}
              className={`whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
