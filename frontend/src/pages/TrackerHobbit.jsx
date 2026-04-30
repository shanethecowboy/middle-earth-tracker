import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { fetchMedia, fetchProgress } from '../api'
import MediaCard from '../components/MediaCard'

export default function TrackerHobbit() {
  const { auth } = useAuth()

  const { data: media, isLoading: mediaLoading } = useQuery({
    queryKey: ['media'],
    queryFn: fetchMedia,
    enabled: !auth,
  })

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['progress', auth?.token],
    queryFn: () => fetchProgress(auth.token),
    enabled: !!auth,
  })

  const isLoading = auth ? progressLoading : mediaLoading
  const items = (auth ? progress : media)?.filter(i => i.series === 'hobbit') ?? []

  const books  = items.filter(i => i.type === 'book')
  const movies = items.filter(i => i.type === 'movie')

  if (isLoading) {
    return <p className="text-slate-500 text-center py-16">Loading…</p>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-400 mb-1">The Hobbit</h1>
        <p className="text-slate-500">1 book · 3 movies</p>
      </div>

      <section className="mb-8">
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-widest mb-4">Books</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map(item => <MediaCard key={item.media_id ?? item.id} item={item} />)}
        </div>
      </section>

      <section>
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-widest mb-4">Movies</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map(item => <MediaCard key={item.media_id ?? item.id} item={item} />)}
        </div>
      </section>
    </div>
  )
}
