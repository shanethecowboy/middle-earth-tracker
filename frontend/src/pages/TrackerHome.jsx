import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { fetchProgress, fetchCommunity } from '../api'
import ProgressBar from '../components/ProgressBar'

export default function TrackerHome() {
  const { auth } = useAuth()

  const { data: progress } = useQuery({
    queryKey: ['progress', auth?.token],
    queryFn: () => fetchProgress(auth.token),
    enabled: !!auth,
  })

  const { data: community } = useQuery({
    queryKey: ['community'],
    queryFn: fetchCommunity,
  })

  const lotrCompleted  = progress?.filter(p => p.series === 'lotr'   && p.status === 'completed').length ?? 0
  const hobbitCompleted = progress?.filter(p => p.series === 'hobbit' && p.status === 'completed').length ?? 0
  const totalCompleted  = (progress ?? []).filter(p => p.status === 'completed').length

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-5xl sm:text-6xl font-bold text-amber-400 mb-4 font-cinzel tracking-wide">
          Middle Earth
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
          Track your journey through J.R.R. Tolkien's complete saga — books and films.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-700/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-600/70" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-700/50" />
        </div>
      </div>

      {auth ? (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-[#1c1a2e] to-[#161424] border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-slate-100 font-semibold text-base mb-5">
              Your Progress, <span className="text-amber-400">{auth.username}</span>
            </h2>
            <div className="space-y-4">
              <ProgressBar label="Overall" completed={totalCompleted} total={10} />
              <ProgressBar label="Lord of the Rings" completed={lotrCompleted} total={6} />
              <ProgressBar label="The Hobbit" completed={hobbitCompleted} total={4} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              to="/tracker/lotr"
              className="bg-gradient-to-br from-[#1c1a2e] to-[#161424] border border-slate-800/80 rounded-xl p-5 hover:border-amber-700/50 hover:shadow-xl hover:shadow-amber-950/30 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="h-px bg-sky-500/40 rounded-full mb-4" />
              <div className="text-xl mb-2">💍</div>
              <h3 className="text-slate-100 font-semibold group-hover:text-amber-300 transition-colors">Lord of the Rings</h3>
              <p className="text-slate-500 text-sm mt-1">3 books · 3 movies</p>
              <p className="text-amber-400 text-sm mt-3 font-medium">{lotrCompleted}/6 completed →</p>
            </Link>
            <Link
              to="/tracker/hobbit"
              className="bg-gradient-to-br from-[#1c1a2e] to-[#161424] border border-slate-800/80 rounded-xl p-5 hover:border-amber-700/50 hover:shadow-xl hover:shadow-amber-950/30 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="h-px bg-violet-500/40 rounded-full mb-4" />
              <div className="text-xl mb-2">🐉</div>
              <h3 className="text-slate-100 font-semibold group-hover:text-amber-300 transition-colors">The Hobbit</h3>
              <p className="text-slate-500 text-sm mt-1">1 book · 3 movies</p>
              <p className="text-amber-400 text-sm mt-3 font-medium">{hobbitCompleted}/4 completed →</p>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              to="/tracker/lotr"
              className="bg-gradient-to-br from-[#1c1a2e] to-[#161424] border border-slate-800/80 rounded-xl p-5 hover:border-amber-700/50 hover:shadow-xl hover:shadow-amber-950/30 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="h-px bg-sky-500/40 rounded-full mb-4" />
              <div className="text-xl mb-2">💍</div>
              <h3 className="text-slate-100 font-semibold group-hover:text-amber-300 transition-colors">Lord of the Rings</h3>
              <p className="text-slate-500 text-sm mt-1">3 books · 3 movies</p>
            </Link>
            <Link
              to="/tracker/hobbit"
              className="bg-gradient-to-br from-[#1c1a2e] to-[#161424] border border-slate-800/80 rounded-xl p-5 hover:border-amber-700/50 hover:shadow-xl hover:shadow-amber-950/30 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="h-px bg-violet-500/40 rounded-full mb-4" />
              <div className="text-xl mb-2">🐉</div>
              <h3 className="text-slate-100 font-semibold group-hover:text-amber-300 transition-colors">The Hobbit</h3>
              <p className="text-slate-500 text-sm mt-1">1 book · 3 movies</p>
            </Link>
          </div>

          <div className="text-center bg-gradient-to-br from-[#1c1a2e] to-[#161424] border border-slate-800/80 rounded-2xl p-10">
            <p className="text-slate-300 text-base mb-5">Sign in to track your journey through the saga.</p>
            <Link
              to="/tracker/login"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-7 py-2.5 rounded-lg transition-colors tracking-wide"
            >
              Get started
            </Link>
          </div>
        </div>
      )}

      {community && community.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-200 font-semibold">Community Leaderboard</h2>
            <Link to="/tracker/community" className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
              View all →
            </Link>
          </div>
          <div className="bg-gradient-to-br from-[#1c1a2e] to-[#161424] border border-slate-800/80 rounded-xl divide-y divide-slate-800/60">
            {community.slice(0, 5).map((entry, i) => (
              <div key={entry.user_id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-sm w-5">{i + 1}</span>
                  <span className="text-slate-200">{entry.username}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {entry.in_progress > 0 && (
                    <span className="text-amber-400">{entry.in_progress} in progress</span>
                  )}
                  <span className="text-green-400 font-medium">{entry.completed}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
