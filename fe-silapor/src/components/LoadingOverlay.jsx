import { useSyncExternalStore } from 'react'
import { subscribe, getSnapshot } from '../utils/loadingStore.js'

// Overlay penuh layar yang muncul khusus saat ada aksi tambah/ubah/hapus
// (POST/PUT/PATCH/DELETE) sedang diproses ke server. Tujuannya mencegah
// user mengklik tombol berkali-kali sambil menunggu respons.
export default function LoadingOverlay() {
  const { mutating } = useSyncExternalStore(subscribe, getSnapshot)

  if (mutating === 0) return null

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-overlay-card">
        <span className="loading-spinner"></span>
        <span>Memproses...</span>
      </div>
    </div>
  )
}
