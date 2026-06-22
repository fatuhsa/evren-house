import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ImageUp, ArrowLeft, Hash } from 'lucide-react'
import { toggleScooterStatus } from '../storage'
import QRScanner from '../components/QRScanner'
import QRImageUploader from '../components/QRImageUploader'
import StatusToggleResult from '../components/StatusToggleResult'

export default function ScanPage() {
  const navigate = useNavigate()
  const [mode, setMode]       = useState(null)    // null | 'camera' | 'image'
  const [result, setResult]   = useState(null)
  const [scanning, setScanning] = useState(true)

  const handleScan = useCallback(async (scooterId) => {
    if (!scanning) return
    setScanning(false)

    try {
      const res = await toggleScooterStatus(scooterId)
      if (res.requiresConfirmation) {
        const confirmed = window.confirm(res.message)
        if (confirmed) {
          const forceRes = await toggleScooterStatus(scooterId, true)
          setResult(forceRes)
        } else {
          setScanning(true)
        }
      } else {
        setResult(res)
      }
    } catch (err) {
      setResult({ success: false, message: err.message || 'Gagal mengubah status scooter.' })
    }
  }, [scanning])

  const handleError = useCallback((msg) => {
    setResult({ success: false, message: msg })
  }, [])

  const handleClose = () => {
    setResult(null)
    setScanning(true)
    if (result?.success) navigate('/')
  }

  const reset = () => { setMode(null); setScanning(true) }

  return (
    <div className="mx-auto max-w-md px-6 py-6">

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex cursor-pointer items-center gap-1.5 border-none
            bg-transparent text-[12px] text-[var(--color-muted)]
            hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={13} />
          Kembali
        </button>
        <h1 className="text-[20px] font-bold text-[var(--color-text)]">Scan QR Scooter</h1>
        <p className="mt-0.5 text-[13px] text-[var(--color-muted)]">
          Pindai QR code untuk toggle status scooter
        </p>
      </div>

      {/* Mode picker */}
      {!mode && (
        <div className="flex flex-col gap-2.5">
          <ModeBtn
            icon={Camera}
            label="Gunakan Kamera"
            sub="Arahkan kamera ke QR code"
            onClick={() => setMode('camera')}
          />
          <ModeBtn
            icon={ImageUp}
            label="Upload dari Galeri"
            sub="Pilih gambar QR dari perangkat"
            onClick={() => setMode('image')}
          />
        </div>
      )}

      {/* Camera scanner */}
      {mode === 'camera' && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)]
            bg-[var(--color-surface)]">
            <div className="p-4">
              <QRScanner onScan={handleScan} onError={handleError} />
            </div>
            <div className="border-t border-[var(--color-border)] px-4 py-2.5">
              <p className="text-center text-[12px] text-[var(--color-muted)]">
                Arahkan kamera ke QR code scooter
              </p>
            </div>
          </div>
          <ResetBtn onClick={reset} />
        </div>
      )}

      {/* Image uploader */}
      {mode === 'image' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-[var(--color-border)]
            bg-[var(--color-surface)] p-4">
            <QRImageUploader onScan={handleScan} onError={handleError} />
          </div>
          <ResetBtn onClick={reset} />
        </div>
      )}

      {/* Manual input — always visible below mode */}
      <ManualInput onScan={handleScan} />

      <StatusToggleResult result={result} onClose={handleClose} />
    </div>
  )
}

function ModeBtn({ icon: Icon, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-4 rounded-xl
        border border-[var(--color-border)] bg-[var(--color-surface)]
        px-5 py-4 text-left transition-colors
        hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
        bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-[var(--color-text)]">{label}</p>
        <p className="text-[11px] text-[var(--color-muted)]">{sub}</p>
      </div>
    </button>
  )
}

function ResetBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center gap-1.5
        rounded-lg border border-[var(--color-border)] bg-transparent py-2.5
        text-[12px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
    >
      <ArrowLeft size={12} />
      Ganti metode scan
    </button>
  )
}

function ManualInput({ onScan }) {
  const [val, setVal]   = useState('')
  const [show, setShow] = useState(false)

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-1.5
          border-none bg-transparent text-[12px] text-[var(--color-subtle)]
          underline underline-offset-2 transition-colors hover:text-[var(--color-muted)]"
      >
        <Hash size={11} />
        Masukkan ID scooter manual
      </button>
    )
  }

  return (
    <div className="mt-5 space-y-2">
      <p className="text-[11px] font-medium text-[var(--color-muted)]">ID Scooter</p>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={e => setVal(e.target.value.toUpperCase())}
          placeholder="SC001"
          onKeyDown={e => e.key === 'Enter' && val && onScan(val)}
          className="flex-1 rounded-lg border border-[var(--color-border)]
            bg-[var(--color-surface)] px-3 py-2 font-mono text-[13px]
            text-[var(--color-text)] outline-none placeholder:text-[var(--color-subtle)]
            focus:border-[var(--color-accent)] transition-colors"
        />
        <button
          onClick={() => val && onScan(val)}
          disabled={!val}
          className="cursor-pointer rounded-lg bg-[var(--color-accent)] px-4 py-2
            text-[13px] font-semibold text-white transition-opacity
            hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          OK
        </button>
      </div>
    </div>
  )
}
