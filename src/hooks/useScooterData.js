import { useState, useEffect, useCallback } from 'react'
import { getScooters, getActivityLog, saveScooters, saveActivityLog } from '../storage'

export function useScooterData() {
  const [scooters, setScooters] = useState([])
  const [activityLog, setActivityLog] = useState([])

  const refresh = useCallback(() => {
    setScooters(getScooters())
    setActivityLog(getActivityLog())
  }, [])

  useEffect(() => {
    refresh()
    // sync across tabs
    const handler = () => refresh()
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [refresh])

  return { scooters, activityLog, refresh }
}
