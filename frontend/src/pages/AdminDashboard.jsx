import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  adminFetchUsers,
  adminFetchUserProgress,
  adminUpdateProgress,
  adminDeleteUser,
} from '../api'
import StarRating from '../components/StarRating'

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [userProgress, setUserProgress] = useState({})
  const [edits, setEdits] = useState({})
  const [saving, setSaving] = useState({})
  const [savedKeys, setSavedKeys] = useState({})

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    adminFetchUsers(token)
      .then(setUsers)
      .catch(() => { localStorage.removeItem('admin_token'); navigate('/login') })
      .finally(() => setLoading(false))
  }, [])

  async function handleExpand(userId) {
    if (expandedId === userId) { setExpandedId(null); return }
    setExpandedId(userId)
    if (!userProgress[userId]) {
      const items = await adminFetchUserProgress(token, userId)
      setUserProgress(prev => ({ ...prev, [userId]: items }))
      const init = {}
      items.forEach(item => {
        init[`${userId}-${item.media_id}`] = {
          status: item.status,
          rating: item.rating ?? null,
          review: item.review ?? '',
        }
      })
      setEdits(prev => ({ ...prev, ...init }))
    }
  }

  function setEdit(userId, mediaId, field, value) {
    const key = `${userId}-${mediaId}`
    setEdits(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  async function handleSave(userId, mediaId) {
    const key = `${userId}-${mediaId}`
    const edit = edits[key]
    setSaving(prev => ({ ...prev, [key]: true }))
    try {
      await adminUpdateProgress(token, userId, mediaId, {
        status: edit.status,
        rating: edit.rating,
        review: edit.review || null,
      })
      setSavedKeys(prev => ({ ...prev, [key]: true }))
      setTimeout(() => setSavedKeys(prev => ({ ...prev, [key]: false })), 2000)
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  async function handleDelete(userId, username) {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
    await adminDeleteUser(token, userId)
    setUsers(prev => prev.filter(u => u.id !== userId))
    if (expandedId === userId) setExpandedId(null)
  }

  function handleLogout() {
    localStorage.removeItem('admin_token')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#111018] flex items-center justify-center text-slate-400">
        Loading…
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#111018] text-slate-100">
      <nav className="border-b border-slate-800 bg-[#111018]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-amber-400 font-bold">⚔ Admin Dashboard</span>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          Tracker Users{' '}
          <span className="text-slate-500 text-lg font-normal">({users.length})</span>
        </h1>

        <div className="space-y-3">
          {users.length === 0 && (
            <p className="text-slate-500 text-center py-12">No users yet.</p>
          )}

          {users.map(user => (
            <div key={user.id} className="bg-[#1a1928] border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-slate-100">{user.username}</span>
                  <span className="text-slate-500 text-sm ml-3">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-sm">
                  <span className="text-green-400">{user.completed} completed</span>
                  <span className="text-amber-400">{user.in_progress} in progress</span>
                </div>
                <button
                  onClick={() => handleExpand(user.id)}
                  className="text-sm bg-slate-700 hover:bg-slate-600 text-slate-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  {expandedId === user.id ? 'Close' : 'Manage'}
                </button>
                <button
                  onClick={() => handleDelete(user.id, user.username)}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Delete
                </button>
              </div>

              {expandedId === user.id && (
                <div className="border-t border-slate-800 px-5 py-4">
                  {!userProgress[user.id] ? (
                    <p className="text-slate-500 text-sm">Loading…</p>
                  ) : (
                    <div className="space-y-3">
                      {userProgress[user.id].map(item => {
                        const key = `${user.id}-${item.media_id}`
                        const edit = edits[key] ?? { status: item.status, rating: null, review: '' }
                        return (
                          <div key={item.media_id} className="bg-[#111018] rounded-lg p-4">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <span className="font-medium text-slate-100">{item.title}</span>
                                <span className={`ml-2 text-xs uppercase px-1.5 py-0.5 rounded ${
                                  item.type === 'book'
                                    ? 'bg-sky-900/50 text-sky-400'
                                    : 'bg-purple-900/50 text-purple-400'
                                }`}>
                                  {item.type}
                                </span>
                              </div>
                              <button
                                onClick={() => handleSave(user.id, item.media_id)}
                                disabled={saving[key]}
                                className="text-sm bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 disabled:text-amber-600 text-black font-semibold px-3 py-1 rounded-lg transition-colors whitespace-nowrap"
                              >
                                {saving[key] ? 'Saving…' : savedKeys[key] ? '✓ Saved' : 'Save'}
                              </button>
                            </div>

                            <div className="flex gap-2 flex-wrap mb-3">
                              {STATUS_OPTIONS.map(opt => (
                                <button
                                  key={opt.value}
                                  onClick={() => setEdit(user.id, item.media_id, 'status', opt.value)}
                                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                    edit.status === opt.value
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

                            <div className="flex items-center gap-3 mb-3">
                              <StarRating
                                value={edit.rating}
                                onChange={v => setEdit(user.id, item.media_id, 'rating', v)}
                              />
                              {edit.rating && (
                                <button
                                  onClick={() => setEdit(user.id, item.media_id, 'rating', null)}
                                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                  Clear
                                </button>
                              )}
                            </div>

                            <textarea
                              value={edit.review}
                              onChange={e => setEdit(user.id, item.media_id, 'review', e.target.value)}
                              rows={2}
                              placeholder="Review…"
                              className="w-full bg-[#1a1928] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-600 transition-colors resize-none text-sm"
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
