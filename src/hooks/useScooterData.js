import { useState, useEffect, useCallback } from 'react'
import { getScooters, getActivityLog } from '../storage'
import { supabase } from '../supabaseClient'

export function useScooterData() {
  const [scooters, setScooters] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const s = await getScooters()
      const l = await getActivityLog()
      setScooters(s)
      setActivityLog(l)
    } catch (err) {
      console.error('Error fetching data from Supabase:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initData = async () => {
      await refresh()
    }
    initData()

    // Subscribe to changes in public.scooters
    const scootersSubscription = supabase
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
    const logSubscription = supabase
      .channel('activity-log-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_log' },
        () => {
          refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(scootersSubscription)
      supabase.removeChannel(logSubscription)
    }
  }, [refresh])

  return { scooters, activityLog, loading, refresh }
}
