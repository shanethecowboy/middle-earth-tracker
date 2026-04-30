import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import StarRating from './StarRating'

export default function MediaCard({ item }) {
  return (
    <Link
      to={`/tracker/item/${item.media_id ?? item.id}`}
      className="block bg-[#1a1928] border border-slate-800 rounded-xl p-4 hover:border-amber-800/60 hover:bg-[#1e1c30] transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
          item.type === 'book'
            ? 'bg-sky-900/50 text-sky-400'
            : 'bg-purple-900/50 text-purple-400'
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
        {item.rating && (
          <StarRating value={item.rating} readonly />
        )}
      </div>
    </Link>
  )
}
