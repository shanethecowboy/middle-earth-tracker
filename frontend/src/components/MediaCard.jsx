import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import StarRating from './StarRating'

export default function MediaCard({ item }) {
  const isBook = item.type === 'book'
  return (
    <Link
      to={`/tracker/item/${item.media_id ?? item.id}`}
      className="block bg-gradient-to-br from-[#1c1a2e] to-[#161424] border border-slate-800/80 rounded-xl p-4 hover:border-amber-700/50 hover:shadow-xl hover:shadow-amber-950/30 hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className={`h-px rounded-full mb-4 ${isBook ? 'bg-sky-500/40' : 'bg-violet-500/40'}`} />

      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
          isBook ? 'bg-sky-900/50 text-sky-400' : 'bg-purple-900/50 text-purple-400'
        }`}>
          {item.type}
        </span>
        <span className="text-slate-500 text-xs">{item.year}</span>
      </div>

      <h3 className="text-slate-100 font-medium leading-snug mb-3 group-hover:text-amber-300 transition-colors">
        {item.title}
      </h3>

      <div className="flex items-center justify-between">
        <StatusBadge status={item.status ?? 'not_started'} />
        {item.rating && <StarRating value={item.rating} readonly />}
      </div>
    </Link>
  )
}
