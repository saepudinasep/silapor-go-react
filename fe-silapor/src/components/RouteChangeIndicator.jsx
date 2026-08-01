import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { beginRequest, endRequest } from '../utils/loadingStore.js'

// Tidak me-render apapun — cuma "mendengarkan" perpindahan route dan
// memicu TopLoadingBar sekilas. Ini melengkapi loading dari axios: kalau
// halaman baru langsung fetch data, bar-nya akan tetap nyala sampai fetch
// selesai; kalau halaman tidak fetch apa-apa (misal halaman statis),
// tetap ada kedipan singkat sebagai feedback perpindahan halaman.
export default function RouteChangeIndicator() {
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    beginRequest('route')
    const timer = setTimeout(() => endRequest('route'), 260)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return null
}
