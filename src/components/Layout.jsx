import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-full bg-[var(--color-bg)]">

      {/* Mobile overlay */}
      {open && (
        <div
          className="sidebar-overlay fixed inset-0 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — fixed on desktop, slide-over on mobile */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col
          w-[var(--sidebar-width)] border-r border-[var(--color-border)]
          bg-[var(--color-surface)] transition-transform duration-200
          lg:translate-x-0
          ${open ? 'translate-x-0 sidebar-slide-enter' : '-translate-x-full'}
        `}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </aside>

      {/* Main content — offset on desktop */}
      <div className="flex min-h-full flex-1 flex-col lg:ml-[var(--sidebar-width)]">

        {/* Top bar (mobile only) */}
        <header className="flex h-14 items-center border-b border-[var(--color-border)]
          bg-[var(--color-surface)] px-4 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center rounded-lg p-2
              text-[var(--color-muted)] hover:bg-[var(--color-surface-3)]
              hover:text-[var(--color-text)] transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="ml-3 text-[15px] font-semibold text-[var(--color-text)]">
            TrackScooter
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
