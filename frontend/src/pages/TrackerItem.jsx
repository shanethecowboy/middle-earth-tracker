import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { fetchMediaDetail, fetchProgress, updateProgress } from '../api'
import StatusBadge from '../components/StatusBadge'
import StarRating from '../components/StarRating'

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
]

export default function TrackerItem() {
  const { id } = useParams()
  const { auth } = useAuth()
  const queryClient = useQueryClient()

  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: ['media', id],
    queryFn: () => fetchMediaDetail(id),
  })

  const { data: progress } = useQuery({
    queryKey: ['progress', auth?.token],
    queryFn: () => fetchProgress(auth.token),
    enabled: !!auth,
  })

  const userProgress = progress?.find(p => String(p.media_id) === String(id))

  const [status, setStatus] = useState('not_started')
  const [rating, setRating] = useState(null)
  const [review, setReview] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (userProgress) {
      setStatus(userProgress.status ?? 'not_started')
      setRating(userProgress.rating ?? null)
      setReview(userProgress.review ?? '')
    }
  }, [userProgress])

  const mutation = useMutation({
    mutationFn: () => updateProgress(auth.token, id, { status, rating, review: review || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  if (itemLoading) {
    return <p className="text-slate-500 text-center py-16">Loading…</p>
  }
  if (!item) {
    return <p className="text-red-400 text-center py-16">Item not found.</p>
  }

  const backPath = item.series === 'lotr' ? '/tracker/lotr' : '/tracker/hobbit'
  const backLabel = item.series === 'lotr' ? 'Lord of the Rings' : 'The Hobbit'

  return (
    <div className="max-w-xl">
      <Link to={backPath} className="text-slate-500 hover:text-slate-300 text-sm transition-colors mb-6 inline-block">
        ← {backLabel}
      </Link>

      <div className="mb-2 flex items-center gap-2">
        <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
          item.type === 'book'
            ? 'bg-sky-900/50 text-sky-400'
            : 'bg-purple-900/50 text-purple-400'
        }`}>
          {item.type}
        </span>
        <span className="text-slate-500 text-sm">{item.year}</span>
      </div>

      <h1 className="text-3xl font-bold text-slate-100 mb-6">{item.title}</h1>

      {!auth ? (
        <div className="bg-[#1a1928] border border-slate-800 rounded-xl p-6 text-center">
          <p className="text-slate-400 mb-4">Sign in to track your progress.</p>
          <Link
            to="/tracker/login"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <div className="bg-[#1a1928] border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-slate-400 text-sm mb-3">Status</label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    status === opt.value
                      ? opt.value === 'completed'   ? 'bg-green-900/60 text-green-300 border-green-700'
                      : opt.value === 'in_progress' ? 'bg-amber-900/60 text-amber-300 border-amber-700'
                      :                               'bg-slate-700 text-slate-200 border-slate-600'
                      : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-3">Rating</label>
            <StarRating value={rating} onChange={setRating} />
            {rating && (
              <button
                onClick={() => setRating(null)}
                className="text-xs text-slate-600 hover:text-slate-400 mt-1 transition-colors"
              >
                Clear rating
              </button>
            )}
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-3">Review</label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              rows={4}
              placeholder="Write your thoughts…"
              className="w-full bg-[#111018] border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-600 transition-colors resize-none"
            />
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 disabled:text-amber-600 text-black font-semibold py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? 'Saving…' : saved ? '✓ Saved' : 'Save progress'}
          </button>

          {mutation.isError && (
            <p className="text-red-400 text-sm text-center">{mutation.error.message}</p>
          )}
        </div>
      )}
    </div>
  )
}
