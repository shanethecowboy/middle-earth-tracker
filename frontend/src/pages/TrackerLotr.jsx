import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { fetchMedia, fetchProgress } from '../api'
import MediaCard from '../components/MediaCard'

function SectionHeader({ children }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <h2 className="text-slate-400 font-semibold text-xs uppercase tracking-widest whitespace-nowrap">{children}</h2>
      <div className="flex-1 h-px bg-slate-800/80" />
    </div>
  )
}

export default function TrackerLotr() {
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
  const items = (auth ? progress : media)?.filter(i => i.series === 'lotr') ?? []

  const books  = items.filter(i => i.type === 'book')
  const movies = items.filter(i => i.type === 'movie')

  if (isLoading) {
    return <p className="text-slate-500 text-center py-16">Loading…</p>
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-amber-400 mb-2 font-cinzel tracking-wide">Lord of the Rings</h1>
        <p className="text-slate-500">3 books · 3 movies</p>
      </div>

      <section className="mb-10">
        <SectionHeader>Books</SectionHeader>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map(item => <MediaCard key={item.media_id ?? item.id} item={item} />)}
        </div>
      </section>

      <section>
        <SectionHeader>Movies</SectionHeader>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map(item => <MediaCard key={item.media_id ?? item.id} item={item} />)}
        </div>
      </section>
    </div>
  )
}
