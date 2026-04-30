import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      const fn = tab === 'login' ? loginUser : registerUser
      const data = await fn(username, password)
      login(data.token, data.username)
      navigate('/tracker')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-6 text-center">
        {tab === 'login' ? 'Welcome back' : 'Join the journey'}
      </h1>

      <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
        <button
          onClick={() => { setTab('login'); setError('') }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === 'login' ? 'bg-[#1a1928] text-slate-100' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => { setTab('register'); setError('') }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === 'register' ? 'bg-[#1a1928] text-slate-100' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1.5">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            className="w-full bg-[#1a1928] border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-600 transition-colors"
            placeholder="your username"
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-[#1a1928] border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-600 transition-colors"
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
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 disabled:text-amber-600 text-black font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Please wait…' : tab === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
