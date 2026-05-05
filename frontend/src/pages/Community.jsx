import { useQuery } from '@tanstack/react-query'
import { fetchCommunity } from '../api'

const RANK_STYLES = [
  'bg-amber-950/40 border-l-2 border-amber-600/50',
  'bg-slate-800/30 border-l-2 border-slate-500/40',
  'bg-orange-950/30 border-l-2 border-orange-700/40',
]
const medals = ['🥇', '🥈', '🥉']

export default function Community() {
  const { data: entries, isLoading } = useQuery({
    queryKey: ['community'],
    queryFn: fetchCommunity,
  })

  if (isLoading) {
    return <p className="text-slate-500 text-center py-16">Loading…</p>
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">No one has signed up yet. Be the first!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-amber-400 mb-2 font-cinzel tracking-wide">Leaderboard</h1>
        <p className="text-slate-500">Who's furthest through the saga?</p>
      </div>

      <div className="bg-gradient-to-br from-[#1c1a2e] to-[#161424] border border-slate-800/80 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 px-5 py-2.5 border-b border-slate-800/60 text-xs uppercase tracking-widest text-slate-500">
          <span>#</span>
          <span>User</span>
          <span className="text-amber-400/60 text-right">In Progress</span>
          <span className="text-green-400/60 text-right">Completed</span>
        </div>

        {entries.map((entry, i) => (
          <div
            key={entry.user_id}
            className={`grid grid-cols-[auto_1fr_auto_auto] gap-x-4 px-5 py-4 border-b border-slate-800/40 last:border-0 items-center ${
              RANK_STYLES[i] ?? 'hover:bg-slate-800/20 transition-colors'
            }`}
          >
            <span className="text-sm w-6 text-center">
              {medals[i] ?? <span className="text-slate-600">{i + 1}</span>}
            </span>
            <span className={`font-medium ${i === 0 ? 'text-amber-300' : 'text-slate-100'}`}>
              {entry.username}
            </span>
            <span className="text-amber-400 text-sm text-right">
              {entry.in_progress > 0 ? entry.in_progress : <span className="text-slate-700">—</span>}
            </span>
            <div className="text-right">
              <span className="text-green-400 font-semibold">{entry.completed}</span>
              <span className="text-slate-600 text-sm">/{entry.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
