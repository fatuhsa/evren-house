import { useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { ImageUp } from 'lucide-react'

export default function QRImageUploader({ onScan, onError }) {
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const qr = new Html5Qrcode('qr-image-reader')
    try {
      const result = await qr.scanFile(file, true)
      onScan(result.trim())
    } catch {
      onError?.('QR code tidak terdeteksi pada gambar ini.')
    } finally {
      try { await qr.clear() } catch {}
      e.target.value = ''
    }
  }

  return (
    <div>
      <div id="qr-image-reader" className="hidden" />

      <button
        onClick={() => inputRef.current?.click()}
        className="flex w-full cursor-pointer items-center justify-center gap-2
          rounded-xl border-2 border-dashed border-[var(--color-border-2)]
          bg-[var(--color-surface-3)] px-4 py-4 text-[13px] font-medium
          text-[var(--color-muted)] transition-colors
          hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        <ImageUp size={16} />
        Pilih Gambar dari Galeri
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
