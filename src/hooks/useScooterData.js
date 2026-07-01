import { useState, useEffect, useCallback } from 'react'
import { getScooters, getActivityLog } from '../storage'
import { supabase } from '../supabaseClient'

export function useScooterData() {
  const [scooters, setScooters] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const s = await getScooters()
      const l = await getActivityLog()
      setScooters(s)
      setActivityLog(l)
    } catch (err) {
      console.error('Error fetching data from Supabase:', err)
      setError(err.message || 'Gagal menyinkronkan data dengan Supabase.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initData = async () => {
      await refresh()
    }
    initData()

    let scootersSubscription
    let logSubscription

    try {
      // Subscribe to changes in public.scooters
      scootersSubscription = supabase
        .channel('scooters-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'scooters' },
          () => {
            refresh()
          }
        )
        .subscribe()

      // Subscribe to changes in public.activity_log
      logSubscription = supabase
        .channel('activity-log-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'activity_log' },
          () => {
            refresh()
          }
        )
        .subscribe()
    } catch (err) {
      console.warn('Realtime subscription failed:', err.message)
    }

    return () => {
      try {
        if (scootersSubscription) supabase.removeChannel(scootersSubscription)
        if (logSubscription) supabase.removeChannel(logSubscription)
      } catch (err) {
        console.warn('Failed to clean up realtime subscription channels:', err.message)
      }
    }
  }, [refresh])

  return { scooters, activityLog, loading, error, refresh }
}
