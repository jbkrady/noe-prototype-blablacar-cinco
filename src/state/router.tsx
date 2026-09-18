import { createContext, useContext, useState, type ReactNode } from 'react'

export interface Route {
  name: string
  params?: Record<string, unknown>
}

interface Ctx {
  current: Route
  depth: number
  direction: 'forward' | 'back' | 'none'
  push: (name: string, params?: Record<string, unknown>) => void
  replace: (name: string, params?: Record<string, unknown>) => void
  back: () => void
  /** Revient à l'écran `name` le plus récent de la pile, sinon le pousse */
  backTo: (name: string) => void
  resetTo: (name: string, params?: Record<string, unknown>) => void
}

const RouterContext = createContext<Ctx | null>(null)

export function RouterProvider({ initial, children }: { initial: string; children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ name: initial }])
  const [direction, setDirection] = useState<'forward' | 'back' | 'none'>('none')

  const push: Ctx['push'] = (name, params) => {
    setDirection('forward')
    setStack(s => [...s, { name, params }])
  }
  const replace: Ctx['replace'] = (name, params) => {
    setDirection('forward')
    setStack(s => [...s.slice(0, -1), { name, params }])
  }
  const back = () => {
    setDirection('back')
    setStack(s => (s.length > 1 ? s.slice(0, -1) : s))
  }
  const backTo = (name: string) => {
    setDirection('back')
    setStack(s => {
      const i = s.map(r => r.name).lastIndexOf(name)
      return i >= 0 ? s.slice(0, i + 1) : [...s, { name }]
    })
  }
  const resetTo = (name: string, params?: Record<string, unknown>) => {
    setDirection('back')
    setStack([{ name, params }])
  }

  return (
    <RouterContext.Provider
      value={{ current: stack[stack.length - 1], depth: stack.length, direction, push, replace, back, backTo, resetTo }}
    >
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter hors RouterProvider')
  return ctx
}
