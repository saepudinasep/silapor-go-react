import { useSyncExternalStore } from 'react'
import { subscribe, getSnapshot } from '../utils/loadingStore.js'

// Bar tipis teal di paling atas layar. Muncul setiap ada request yang
// berjalan (fetch data saat berpindah halaman, maupun insert/edit/delete).
export default function TopLoadingBar() {
  const { active } = useSyncExternalStore(subscribe, getSnapshot)
  const visible = active > 0

  return (
    <div className={`top-loading-bar${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      <div className="top-loading-bar-inner"></div>
    </div>
  )
}
