import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('tracker_token')
    const username = localStorage.getItem('tracker_username')
    return token ? { token, username } : null
  })

  function login(token, username) {
    localStorage.setItem('tracker_token', token)
    localStorage.setItem('tracker_username', username)
    setAuth({ token, username })
  }

  function logout() {
    localStorage.removeItem('tracker_token')
    localStorage.removeItem('tracker_username')
    setAuth(null)
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
