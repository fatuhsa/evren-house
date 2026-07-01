import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { formatDistanceToNow, differenceInSeconds } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export default function LiveTimer({ status, lastUpdated }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const date = new Date(lastUpdated)

  if (status === 'in-use') {
    const diffSecs = Math.max(0, differenceInSeconds(now, date))
    const hrs = Math.floor(diffSecs / 3600)
    const mins = Math.floor((diffSecs % 3600) / 60)
    const secs = diffSecs % 60

    const formattedTime = [
      String(hrs).padStart(2, '0'),
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].join(':')

    return (
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-red)]">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
        </span>
        <span>Durasi: {formattedTime}</span>
      </div>
    )
  }

  const relativeStr = (() => {
    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: localeId })
    } catch {
      return '-'
    }
  })()

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-subtle)]">
      <Clock size={11} />
      <span>Update: {relativeStr}</span>
    </div>
  )
}
