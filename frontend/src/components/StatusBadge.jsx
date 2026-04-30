const STYLES = {
  completed:   'bg-green-900/50 text-green-400 border border-green-800',
  in_progress: 'bg-amber-900/50 text-amber-400 border border-amber-800',
  not_started: 'bg-slate-800 text-slate-400 border border-slate-700',
}
const LABELS = {
  completed:   'Completed',
  in_progress: 'In Progress',
  not_started: 'Not Started',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STYLES[status] ?? STYLES.not_started}`}>
      {LABELS[status] ?? 'Not Started'}
    </span>
  )
}
