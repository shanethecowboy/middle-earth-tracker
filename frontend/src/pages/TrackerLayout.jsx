import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function TrackerLayout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/tracker')
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <nav className="border-b border-slate-800 bg-[#111018]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/tracker" className="text-amber-400 font-bold text-base tracking-wide whitespace-nowrap">
              ⚔ Middle Earth
            </Link>
            <div className="hidden sm:flex items-center gap-5">
              <Link to="/tracker/lotr" className="text-slate-400 hover:text-slate-100 text-sm transition-colors">
                Lord of the Rings
              </Link>
              <Link to="/tracker/hobbit" className="text-slate-400 hover:text-slate-100 text-sm transition-colors">
                The Hobbit
              </Link>
              <Link to="/tracker/community" className="text-slate-400 hover:text-slate-100 text-sm transition-colors">
                Leaderboard
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {auth ? (
              <>
                <span className="text-slate-400 text-sm hidden sm:block">{auth.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/tracker/login"
                className="text-sm bg-amber-500 hover:bg-amber-400 text-black font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 text-center text-slate-600 text-xs py-4">
        fellowshipofthecode.com
      </footer>
    </div>
  )
}
