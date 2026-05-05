import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser, registerUser } from '../api'

export default function TrackerLogin() {
  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'register') {
        const data = await registerUser(username, password)
        login(data.token, data.username)
        navigate('/tracker')
      } else {
        const data = await loginUser(username, password)
        login(data.token, data.username)
        navigate('/tracker')
      }
    } catch (err) {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-400 mb-1 font-cinzel tracking-wide">
          {tab === 'login' ? 'Welcome Back' : 'Join the Journey'}
        </h1>
        <p className="text-slate-500 text-sm">
          {tab === 'login' ? 'Continue your Middle Earth saga' : 'Begin your Middle Earth saga'}
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#1c1a2e] to-[#161424] border border-slate-800/80 rounded-2xl p-6">
        <div className="flex bg-slate-800/60 rounded-lg p-1 mb-6">
          <button
            onClick={() => { setTab('login'); setError('') }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === 'login' ? 'bg-[#1a1928] text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setTab('register'); setError('') }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === 'register' ? 'bg-[#1a1928] text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-widest mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full bg-[#0f0e18]/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-600/70 transition-colors"
              placeholder="your username"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-[#0f0e18]/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-600/70 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-900/40 disabled:text-amber-700 text-black font-bold py-2.5 rounded-lg transition-colors tracking-wide mt-2"
          >
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>

      <div className="text-center mt-4">
        <Link
          to="/login"
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          Admin Login
        </Link>
      </div>
    </div>
  )
}
