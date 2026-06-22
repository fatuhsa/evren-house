import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QrCode, ShieldAlert, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useScooterData } from '../hooks/useScooterData'
import { formatDistanceToNow, format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export default function MonitorPage() {
  const { scooters, activityLog, loading } = useScooterData()
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Filter grid scooters
  const filteredScooters = scooters.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    const matchesType = typeFilter === 'all' || s.type === typeFilter
    return matchesStatus && matchesType
  })

  // Get status color configs
  const statusConfigs = {
    available: {
      bg: 'bg-[var(--color-green-subtle)]',
      border: 'border-[var(--color-green-ring)]',
      dot: 'bg-[var(--color-green)]',
      text: 'text-[var(--color-green)]',
      label: 'Tersedia'
    },
    'in-use': {
      bg: 'bg-[var(--color-red-subtle)]',
      border: 'border-[var(--color-red-ring)]',
      dot: 'bg-[var(--color-red)] dot-pulse',
      text: 'text-[var(--color-red)]',
      label: 'Disewakan'
    },
    maintenance: {
      bg: 'bg-[var(--color-warning-subtle)]',
      border: 'border-[var(--color-warning-ring)]',
      dot: 'bg-[var(--color-warning)]',
      text: 'text-[var(--color-warning)]',
      label: 'Maintenance'
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <h1 className="text-[20px] font-bold text-[var(--color-text)]">Live Monitor Lapangan</h1>
          </div>
          <p className="mt-0.5 text-[13px] text-[var(--color-muted)]">
            Tampilan khusus pemantauan status dan log aktivitas secara real-time
          </p>
        </div>
        <Link to="/scan">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer shadow-lg shadow-[var(--color-accent-subtle)]">
            <QrCode size={16} />
            Scan QR Lapangan
          </button>
        </Link>
      </div>

      {loading && scooters.length === 0 ? (
        <div className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-accent)] border-t-transparent mb-4" />
          <h3 className="text-[14px] font-semibold text-[var(--color-text)]">Menghubungkan ke Database Supabase...</h3>
          <p className="mt-1 text-[12px] text-[var(--color-muted)]">Menyiapkan koneksi real-time untuk petugas lapangan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left Column: Grid Scooter */}
          <div className="space-y-4">
            {/* Quick Filter Buttons (Tappable for Field Operators) */}
            <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-subtle)]">Filter Status</p>
                <div className="flex flex-wrap gap-2">
                  <FilterTab label="Semua Status" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} count={scooters.length} />
                  <FilterTab label="Tersedia" active={statusFilter === 'available'} onClick={() => setStatusFilter('available')} colorClass="text-[var(--color-green)]" count={scooters.filter(s => s.status === 'available').length} />
                  <FilterTab label="Disewakan" active={statusFilter === 'in-use'} onClick={() => setStatusFilter('in-use')} colorClass="text-[var(--color-red)]" count={scooters.filter(s => s.status === 'in-use').length} />
                  <FilterTab label="Maintenance" active={statusFilter === 'maintenance'} onClick={() => setStatusFilter('maintenance')} colorClass="text-[var(--color-warning)]" count={scooters.filter(s => s.status === 'maintenance').length} />
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-subtle)]">Filter Jenis</p>
                <div className="flex gap-2">
                  <FilterTab label="Semua Jenis" active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
                  <FilterTab label="Dewasa (SD)" active={typeFilter === 'sd'} onClick={() => setTypeFilter('sd')} count={scooters.filter(s => s.type === 'sd').length} />
                  <FilterTab label="Jumbo (SJ)" active={typeFilter === 'sj'} onClick={() => setTypeFilter('sj')} count={scooters.filter(s => s.type === 'sj').length} />
                </div>
              </div>
            </div>

            {/* Grid list */}
            {filteredScooters.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center text-[var(--color-muted)]">
                Tidak ada unit scooter yang cocok dengan filter aktif.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {filteredScooters.map((scooter) => {
                  const conf = statusConfigs[scooter.status] || statusConfigs.available
                  const timeAgo = (() => {
                    try {
                      return formatDistanceToNow(new Date(scooter.lastUpdated), {
                        addSuffix: true, locale: localeId
                      })
                    } catch { return '-' }
                  })()

                  return (
                    <div
                      key={scooter.id}
                      className={`relative flex flex-col gap-3 rounded-xl border p-4 bg-[var(--color-surface)] transition-all ${conf.border}`}
                    >
                      {/* Top badge & ID */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[15px] font-bold text-[var(--color-text)]">
                          {scooter.id}
                        </span>
                        <span className="rounded bg-[var(--color-surface-3)] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-[var(--color-muted)]">
                          {scooter.type.toUpperCase()}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 ${conf.bg}`}>
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${conf.dot}`} />
                        <span className={`text-[12px] font-bold uppercase tracking-wider ${conf.text}`}>
                          {conf.label}
                        </span>
                      </div>

                      {/* Maintenance Note if applicable */}
                      {scooter.status === 'maintenance' && scooter.maintenanceNote && (
                        <div className="flex gap-1.5 rounded-lg bg-[var(--color-surface-3)] p-2 text-[11px] text-[var(--color-muted)] italic leading-normal border border-[var(--color-border)]">
                          <ShieldAlert size={13} className="shrink-0 text-[var(--color-warning)]" />
                          <span>{scooter.maintenanceNote}</span>
                        </div>
                      )}

                      {/* Footer time */}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--color-muted)]">
                        <Clock size={12} className="text-[var(--color-subtle)]" />
                        <span>Update: {timeAgo}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Column: Real-time Live Log Feed */}
          <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="border-b border-[var(--color-border)] p-4">
              <h2 className="text-[12px] font-semibold uppercase tracking-widest text-[var(--color-subtle)] flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Aktivitas Lapangan Terkini
              </h2>
              <p className="text-[11px] text-[var(--color-muted)] mt-0.5">Memantau transaksi keluar/masuk scooter</p>
            </div>

            <div className="divide-y divide-[var(--color-border)] overflow-y-auto max-h-[600px] flex-1">
              {activityLog.length === 0 ? (
                <p className="p-8 text-center text-[12px] text-[var(--color-muted)]">Belum ada aktivitas hari ini.</p>
              ) : (
                activityLog.slice(0, 30).map((entry) => {
                  const isCheckout = entry.action === 'checkout'
                  const timeStr = (() => {
                    try {
                      return format(new Date(entry.timestamp), 'HH:mm:ss', { locale: localeId })
                    } catch { return '-' }
                  })()
                  const timeAgo = (() => {
                    try {
                      return formatDistanceToNow(new Date(entry.timestamp), {
                        addSuffix: true, locale: localeId
                      })
                    } catch { return '-' }
                  })()

                  return (
                    <div key={entry.id} className="p-3.5 flex items-start gap-3 hover:bg-[var(--color-surface-3)] transition-colors">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isCheckout ? 'bg-[var(--color-red-subtle)] text-[var(--color-red)]' : 'bg-[var(--color-green-subtle)] text-[var(--color-green)]'
                      }`}>
                        {isCheckout ? <ArrowUpRight size={15} /> : <ArrowDownLeft size={15} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[13px] font-bold text-[var(--color-accent)]">{entry.scooterId}</span>
                          <span className="text-[11px] text-[var(--color-muted)] font-mono">{timeStr}</span>
                        </div>
                        <p className="text-[11px] text-[var(--color-muted)] mt-0.5">
                          Unit {entry.scooterType === 'sd' ? 'Dewasa (SD)' : 'Jumbo (SJ)'} {isCheckout ? 'di-checkout (disewa)' : 'di-return (dikembalikan)'}
                        </p>
                        <p className="text-[10px] text-[var(--color-subtle)] mt-0.5">{timeAgo}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterTab({ label, active, onClick, colorClass = '', count = null }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
        active
          ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] text-[var(--color-accent)]'
          : 'bg-[var(--color-surface-3)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-subtle)]'
      }`}
    >
      <span className={active ? '' : colorClass}>{label}</span>
      {count !== null && (
        <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
          active ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-border-2)] text-[var(--color-muted)]'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}
