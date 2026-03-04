const SEVERITY_CLASS = {
  Critical: 'badge-red',
  High: 'badge-orange',
  Medium: 'badge-yellow',
  Low: 'badge-blue',
  Informational: 'badge-gray',
}

const STATUS_CLASS = {
  Active: 'badge-green',
  Completed: 'badge-blue',
  'On Hold': 'badge-yellow',
  Pending: 'badge-gray',
  'Issue Found': 'badge-red',
  'Not Applicable': 'badge-gray',
  Open: 'badge-red',
  Fixed: 'badge-green',
  Reproduced: 'badge-orange',
}

export function SeverityBadge({ value }) {
  return <span className={SEVERITY_CLASS[value] || 'badge-gray'}>{value}</span>
}

export function StatusBadge({ value }) {
  return <span className={STATUS_CLASS[value] || 'badge-gray'}>{value}</span>
}
