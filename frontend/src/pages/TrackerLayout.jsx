import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavLink({ to, exact, children }) {
  const { pathname } = useLocation()
  const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')
  return (
    <Link
      to={to}
      className={`text-sm transition-colors ${
        active ? 'text-amber-400 font-medium' : 'text-slate-400 hover:text-slate-100'
      }`}
    >
      {children}
    </Link>
  )
}

export default function TrackerLayout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/tracker')
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <nav className="border-b border-slate-800/70 bg-[#0f0e18]/85 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-7">
            <Link to="/tracker" className="text-amber-400 font-bold text-sm tracking-widest uppercase whitespace-nowrap font-cinzel">
              Middle Earth
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              <NavLink to="/tracker/lotr">Lord of the Rings</NavLink>
              <NavLink to="/tracker/hobbit">The Hobbit</NavLink>
              <NavLink to="/tracker/community">Leaderboard</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {auth ? (
              <>
                <span className="text-slate-500 text-sm hidden sm:block">{auth.username}</span>
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
                className="text-sm bg-amber-500 hover:bg-amber-400 text-black font-semibold px-3.5 py-1.5 rounded-lg transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800/50 text-center text-slate-600 text-xs py-4">
        fellowshipofthecode.com
      </footer>
    </div>
  )
}
