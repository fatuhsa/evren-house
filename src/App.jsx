import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'

// Route-level code splitting — each page is loaded on demand
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ScanPage      = lazy(() => import('./pages/ScanPage'))
const ManagePage    = lazy(() => import('./pages/ManagePage'))
const MonitorPage   = lazy(() => import('./pages/MonitorPage'))

function PageLoader() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <div className="h-7 w-7 animate-spin rounded-full border-4 border-[var(--color-accent)] border-t-transparent" />
      <p className="text-[12px] text-[var(--color-muted)]">Memuat halaman...</p>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"        element={<DashboardPage />} />
          <Route path="/scan"    element={<ScanPage />}      />
          <Route path="/manage"  element={<ManagePage />}    />
          <Route path="/monitor" element={<MonitorPage />}   />
          <Route path="*"        element={<DashboardPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
