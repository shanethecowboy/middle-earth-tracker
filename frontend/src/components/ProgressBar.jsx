export default function ProgressBar({ completed, total, label }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-medium">
          {completed}/{total}
          <span className="text-slate-500 font-normal ml-1">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-700 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
