import { useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { PhoneFrame } from './app/PhoneFrame'
import { DemoPanel } from './app/DemoPanel'
import { renderRoute } from './app/routes'
import { RouterProvider, useRouter } from './state/router'
import { StoreProvider, useStore } from './state/store'
import './App.css'

function Prototype() {
  const router = useRouter()
  const { toast, reset } = useStore()
  const [panelOpen, setPanelOpen] = useState(false)
  const r = router.current
  // accès de test en développement uniquement
  if (import.meta.env.DEV) (window as unknown as { __router: typeof router }).__router = router

  return (
    <div className="stage">
      <PhoneFrame>
        <div key={`${router.depth}-${r.name}`} className={`page page--${router.direction}`}>
          {renderRoute(r)}
        </div>
        {toast && (
          <div className="toast" role="status"><CircleCheck size={20} /> {toast}</div>
        )}
      </PhoneFrame>

      <div className={`panel-wrap${panelOpen ? ' panel-wrap--open' : ''}`} onClick={() => setPanelOpen(false)}>
        <div onClick={e => e.stopPropagation()}>
          <DemoPanel
            current={r.name}
            onStart={route => {
              // chaque parcours de démo repart de zéro : conductrice sans photo ni pièce d'identité
              reset()
              router.resetTo(route)
              setPanelOpen(false)
            }}
            onReset={() => {
              reset()
              router.resetTo('home')
              setPanelOpen(false)
            }}
          />
        </div>
      </div>
      <button className="panel-fab" onClick={() => setPanelOpen(o => !o)} aria-label="Menu de démo">☰</button>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <RouterProvider initial="home">
        <Prototype />
      </RouterProvider>
    </StoreProvider>
  )
}
