async function req(path, options = {}) {
  const res = await fetch(path, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const fetchMedia = () => req('/api/tracker/media')

export const fetchMediaDetail = (id) => req(`/api/tracker/media/${id}`)

export const fetchProgress = (token) =>
  req('/api/tracker/progress', {
    headers: { Authorization: `Bearer ${token}` },
  })

export const fetchCommunity = () => req('/api/tracker/community')

export const updateProgress = (token, mediaId, body) =>
  req(`/api/tracker/progress/${mediaId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

export const registerUser = (username, password) =>
  req('/api/tracker/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

export const loginUser = (username, password) =>
  req('/api/tracker/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
