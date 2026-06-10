import { useEffect, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QRScanner({ onScan, onError }) {
  const qrRef = useRef(null)

  const startScanner = useCallback(async () => {
    if (qrRef.current) return
    try {
      const cameras = await Html5Qrcode.getCameras()
      if (!cameras || cameras.length === 0) {
        onError?.('Kamera tidak ditemukan.')
        return
      }
      const qr = new Html5Qrcode('qr-reader')
      qrRef.current = qr
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => onScan(text.trim()),
        () => {}
      )
    } catch (err) {
      onError?.('Tidak bisa mengakses kamera: ' + err.message)
    }
  }, [onScan, onError])

  useEffect(() => {
    startScanner()
    return () => {
      if (qrRef.current) {
        qrRef.current.stop().catch(() => {}).finally(() => { qrRef.current = null })
      }
    }
  }, [startScanner])

  return (
    <div className="w-full overflow-hidden rounded-xl bg-black" id="qr-reader" />
  )
}
