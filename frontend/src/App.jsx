import { Routes, Route, Navigate } from 'react-router-dom'
import TrackerLayout from './pages/TrackerLayout'
import TrackerHome from './pages/TrackerHome'
import TrackerLogin from './pages/TrackerLogin'
import TrackerLotr from './pages/TrackerLotr'
import TrackerHobbit from './pages/TrackerHobbit'
import TrackerItem from './pages/TrackerItem'
import Community from './pages/Community'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/tracker" element={<TrackerLayout />}>
        <Route index element={<TrackerHome />} />
        <Route path="login" element={<TrackerLogin />} />
        <Route path="lotr" element={<TrackerLotr />} />
        <Route path="hobbit" element={<TrackerHobbit />} />
        <Route path="item/:id" element={<TrackerItem />} />
        <Route path="community" element={<Community />} />
      </Route>
      <Route path="*" element={<Navigate to="/tracker" replace />} />
    </Routes>
  )
}
