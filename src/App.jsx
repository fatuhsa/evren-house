import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import ScanPage from './pages/ScanPage'
import ManagePage from './pages/ManagePage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"       element={<DashboardPage />} />
        <Route path="/scan"   element={<ScanPage />}      />
        <Route path="/manage" element={<ManagePage />}    />
        <Route path="*"       element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}
