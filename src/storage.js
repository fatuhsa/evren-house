import { supabase } from './supabaseClient'

// ── Scooters ──────────────────────────────────────────────
export async function getScooters() {
  const { data, error } = await supabase
    .from('scooters')
    .select('*')
    .order('id', { ascending: true })
  
  if (error) throw error
  
  return (data || []).map(s => ({
    id: s.id,
    type: s.type,
    status: s.status,
    maintenanceNote: s.maintenance_note,
    lastUpdated: s.last_updated
  }))
}

export async function addScooter({ id, type }) {
  let finalId = id ? id.trim().toUpperCase() : ''

  if (finalId) {
    const { data: existing, error: checkError } = await supabase
      .from('scooters')
      .select('id')
      .eq('id', finalId)
      .maybeSingle()
    
    if (checkError) throw checkError
    if (existing) {
      throw new Error(`ID "${finalId}" sudah terdaftar di sistem.`)
    }
  } else {
    // Generate type-specific prefix (SD- or SJ-)
    const prefix = `${type.toUpperCase()}-`
    const { data: sameTypeScooters, error: listError } = await supabase
      .from('scooters')
      .select('id')
      .eq('type', type)
    
    if (listError) throw listError

    const nums = (sameTypeScooters || [])
      .map(s => {
        const numPart = s.id.replace(prefix, '')
        return parseInt(numPart, 10)
      })
      .filter(n => !isNaN(n))
    const next = nums.length ? Math.max(...nums) + 1 : 1
    finalId = `${prefix}${String(next).padStart(3, '0')}`
  }

  const { data, error } = await supabase
    .from('scooters')
    .insert([{
      id: finalId,
      type,
      status: 'available',
      last_updated: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  return {
    id: data.id,
    type: data.type,
    status: data.status,
    maintenanceNote: data.maintenance_note,
    lastUpdated: data.last_updated
  }
}

export async function deleteScooter(id) {
  const { error } = await supabase
    .from('scooters')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function updateScooter(id, fields) {
  const dbFields = {}
  if ('status' in fields) dbFields.status = fields.status
  if ('maintenanceNote' in fields) dbFields.maintenance_note = fields.maintenanceNote
  dbFields.last_updated = new Date().toISOString()

  const { error } = await supabase
    .from('scooters')
    .update(dbFields)
    .eq('id', id)
  
  if (error) throw error
}

// ── Activity log ──────────────────────────────────────────
export async function getActivityLog() {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(500)
  
  if (error) throw error

  return (data || []).map(entry => ({
    id: entry.id,
    scooterId: entry.scooter_id,
    scooterType: entry.scooter_type,
    action: entry.action,
    timestamp: entry.timestamp
  }))
}

// ── Toggle status ─────────────────────────────────────────
export async function toggleScooterStatus(scooterId, forceMaintenance = false) {
  const { data: scooter, error: getError } = await supabase
    .from('scooters')
    .select('*')
    .eq('id', scooterId)
    .maybeSingle()

  if (getError) return { success: false, message: `Gagal mengakses basis data: ${getError.message}` }
  if (!scooter) return { success: false, message: `Scooter "${scooterId}" tidak ditemukan.` }

  if (scooter.status === 'maintenance' && !forceMaintenance) {
    const noteText = scooter.maintenance_note ? `\nCatatan Perbaikan: "${scooter.maintenance_note}"` : ''
    return {
      success: false,
      requiresConfirmation: true,
      message: `Apakah Anda yakin akan menyewakan unit ${scooter.id} yang sedang dalam maintenance?${noteText}`
    }
  }

  const wasAvailable = scooter.status === 'available' || scooter.status === 'maintenance'
  const nextStatus = wasAvailable ? 'in-use' : 'available'

  const dbFields = {
    status: nextStatus,
    last_updated: new Date().toISOString()
  }
  if (nextStatus === 'in-use') {
    dbFields.maintenance_note = null
  }

  const { error: updateError } = await supabase
    .from('scooters')
    .update(dbFields)
    .eq('id', scooterId)

  if (updateError) return { success: false, message: `Gagal memperbarui status: ${updateError.message}` }

  const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const { error: logError } = await supabase
    .from('activity_log')
    .insert([{
      id: logId,
      scooter_id: scooterId,
      scooter_type: scooter.type,
      action: wasAvailable ? 'checkout' : 'return',
      timestamp: new Date().toISOString()
    }])

  if (logError) {
    console.error('Failed to write activity log:', logError.message)
  }

  const typeLabel = scooter.type === 'sd' ? 'Dewasa (SD)' : 'Jumbo (SJ)'
  const updatedScooterMapped = {
    id: scooter.id,
    type: scooter.type,
    status: nextStatus,
    maintenanceNote: nextStatus === 'in-use' ? null : scooter.maintenance_note,
    lastUpdated: dbFields.last_updated
  }

  return {
    success: true,
    scooter: updatedScooterMapped,
    action: wasAvailable ? 'checkout' : 'return',
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
export async function exportData() {
  try {
    const scooters = await getScooters()
    const activityLog = await getActivityLog()
    const data = { scooters, activityLog, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `trackscooter-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    alert('Gagal mengekspor data: ' + err.message)
  }
}
