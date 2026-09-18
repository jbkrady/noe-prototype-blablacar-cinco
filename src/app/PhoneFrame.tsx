import { useEffect, useState, type ReactNode } from 'react'
import { BatteryFull, SignalHigh, Wifi } from 'lucide-react'
import { useRouter } from '../state/router'
import './PhoneFrame.css'

const W = 360
const H = 800

/** Sur ordinateur : téléphone Android 360×800 avec barres système. Sur mobile : l'app occupe l'écran. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    const t = setInterval(() => setNow(new Date()), 20000)
    return () => {
      window.removeEventListener('resize', onResize)
      clearInterval(t)
    }
  }, [])

  const bare = vp.w < 600
  if (bare) return <div className="device--bare">{children}</div>

  const scale = Math.min(1, (vp.h - 40) / (H + 24))
  return (
    <div className="device-slot" style={{ width: (W + 24) * scale, height: (H + 24) * scale }}>
      <div className="device" style={{ transform: `scale(${scale})` }}>
        <div className="device-screen">
          <div className="statusbar">
            <span>{now.getHours()}:{String(now.getMinutes()).padStart(2, '0')}</span>
            <span className="statusbar-icons"><Wifi size={14} /><SignalHigh size={14} /><BatteryFull size={16} /></span>
          </div>
          <div className="device-app">{children}</div>
          <div className="sysnav">
            <button aria-label="Applications récentes">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#4a4a4a" strokeWidth="1.8" strokeLinecap="round">
                <path d="M5 4.5v11M10 4.5v11M15 4.5v11" />
              </svg>
            </button>
            <button aria-label="Accueil" onClick={() => router.resetTo('home')}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#4a4a4a" strokeWidth="1.8">
                <rect x="3.5" y="3.5" width="13" height="13" rx="4.5" />
              </svg>
            </button>
            <button aria-label="Retour système" onClick={router.back}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#4a4a4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.5 4.5 7 10l5.5 5.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
