// Seed data for initial scooters
const INITIAL_SCOOTERS = [
  { id: 'SC001', type: 'sd', status: 'available', lastUpdated: new Date().toISOString() },
  { id: 'SC002', type: 'sd', status: 'available', lastUpdated: new Date().toISOString() },
  { id: 'SC003', type: 'sd', status: 'available', lastUpdated: new Date().toISOString() },
  { id: 'SC004', type: 'sj', status: 'available', lastUpdated: new Date().toISOString() },
  { id: 'SC005', type: 'sj', status: 'available', lastUpdated: new Date().toISOString() },
  { id: 'SC006', type: 'sj', status: 'available', lastUpdated: new Date().toISOString() },
]

const SCOOTERS_KEY = 'trackscooter_scooters'
const LOG_KEY      = 'trackscooter_log'

// ── Scooters ──────────────────────────────────────────────
export function getScooters() {
  try {
    const data = localStorage.getItem(SCOOTERS_KEY)
    if (!data) {
      localStorage.setItem(SCOOTERS_KEY, JSON.stringify(INITIAL_SCOOTERS))
      return INITIAL_SCOOTERS
    }
    return JSON.parse(data)
  } catch { return INITIAL_SCOOTERS }
}

export function saveScooters(scooters) {
  localStorage.setItem(SCOOTERS_KEY, JSON.stringify(scooters))
}

export function addScooter({ id, type }) {
  const scooters = getScooters()
  let finalId = id ? id.trim().toUpperCase() : ''

  if (finalId) {
    const exists = scooters.some(s => s.id.toUpperCase() === finalId)
    if (exists) {
      throw new Error(`ID "${finalId}" sudah terdaftar di sistem.`)
    }
  } else {
    // Generate next ID
    const nums = scooters
      .map(s => parseInt(s.id.replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n))
    const next = nums.length ? Math.max(...nums) + 1 : 1
    finalId = `SC${String(next).padStart(3, '0')}`
  }

  const scooter = { id: finalId, type, status: 'available', lastUpdated: new Date().toISOString() }
  saveScooters([...scooters, scooter])
  return scooter
}

export function deleteScooter(id) {
  const scooters = getScooters().filter(s => s.id !== id)
  saveScooters(scooters)
}

export function updateScooter(id, fields) {
  const scooters = getScooters().map(s =>
    s.id === id ? { ...s, ...fields, lastUpdated: new Date().toISOString() } : s
  )
  saveScooters(scooters)
}

// ── Activity log ──────────────────────────────────────────
export function getActivityLog() {
  try {
    const data = localStorage.getItem(LOG_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

export function saveActivityLog(log) {
  localStorage.setItem(LOG_KEY, JSON.stringify(log))
}

// ── Toggle status ─────────────────────────────────────────
export function toggleScooterStatus(scooterId, forceMaintenance = false) {
  const scooters = getScooters()
  const idx = scooters.findIndex(s => s.id === scooterId)
  if (idx === -1) return { success: false, message: `Scooter "${scooterId}" tidak ditemukan.` }

  const scooter = scooters[idx]

  // Check if scooter is in maintenance and we are not forcing it
  if (scooter.status === 'maintenance' && !forceMaintenance) {
    const noteText = scooter.maintenanceNote ? `\nCatatan Perbaikan: "${scooter.maintenanceNote}"` : ''
    return {
      success: false,
      requiresConfirmation: true,
      message: `Apakah Anda yakin akan menyewakan unit ${scooter.id} yang sedang dalam maintenance?${noteText}`
    }
  }

  const wasAvailable = scooter.status === 'available' || scooter.status === 'maintenance'
  const nextStatus = wasAvailable ? 'in-use' : 'available'
  
  // Clear maintenance notes when taken out of maintenance
  const updatedScooter = { ...scooter, status: nextStatus, lastUpdated: new Date().toISOString() }
  if (nextStatus === 'in-use') {
    delete updatedScooter.maintenanceNote
  }
  scooters[idx] = updatedScooter
  saveScooters(scooters)

  const log = getActivityLog()
  const entry = {
    id:          `log-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    scooterId,
    scooterType: scooter.type,
    action:      wasAvailable ? 'checkout' : 'return',
    timestamp:   new Date().toISOString(),
  }
  log.unshift(entry)
  saveActivityLog(log.slice(0, 500))

  const typeLabel = scooter.type === 'sd' ? 'Dewasa (SD)' : 'Jumbo (SJ)'
  return {
    success: true,
    scooter: scooters[idx],
    action:  entry.action,
    message: wasAvailable
      ? `Scooter ${scooter.id} (${typeLabel}) sekarang sedang digunakan.`
      : `Scooter ${scooter.id} (${typeLabel}) telah dikembalikan.`,
  }
}

// ── QR download ───────────────────────────────────────────
export async function downloadScooterQR(scooter) {
  const QRCode = (await import('qrcode')).default
  const dataUrl = await QRCode.toDataURL(scooter.id, {
    width: 400,
    margin: 2,
    color: { dark: '#0d1017', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })
  const a = document.createElement('a')
  a.href = dataUrl
  const typeLabel = scooter.type.toUpperCase()
  a.download = `QR-${scooter.id}-${typeLabel}.png`
  a.click()
}

// ── JSON export ───────────────────────────────────────────
export function exportData() {
  const data = { scooters: getScooters(), activityLog: getActivityLog(), exportedAt: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `trackscooter-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
