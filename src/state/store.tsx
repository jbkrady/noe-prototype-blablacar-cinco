import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import type { Place } from '../data/places'
import photoCoralie from '../assets/photo-coralie.png'

export interface Trip {
  id: string
  from: Place
  to: Place
  stops: string[]
  departure: Date
  durationMin: number
  price: number
  seats: number
  passengers: number
  description: string
}

export interface Draft {
  from?: Place
  to?: Place
  route: number
  stops: string[]
  dates: Date[]
  time: string
  seats: number
  backSeats: boolean
  womenOnly: boolean
  instant: boolean
  price: number
  zen: boolean
  insurance: boolean
  description: string
  /** trajet retour publié en même temps (question « Vous faites aussi le voyage retour ? ») */
  returnDate?: Date
}

export interface Search {
  from?: Place
  to?: Place
  date: Date
  returnDate?: Date
  passengers: number
}

export type IdentityStatus = 'none' | 'verified'

/** reject-first : 1re photo refusée puis acceptées (comme le flow Figma) */
export type PhotoCheckMode = 'reject-first' | 'accepted' | 'timeout'

/** Coordonnées de démo de Coralie (anonymisées) */
export const CONTACT = { email: 'contact@blablacar-cinco.com', phone: '+33 6 79 37 XX XX' }

export type Pref = 'chat' | 'music' | 'pets' | 'nosmoke'
export interface Vehicle { brand: string; model: string; color: string }

export interface AppState {
  photo: string | null
  firstName: string
  lastName: string
  /** date de naissance au format AAAA-MM-JJ */
  birthDate: string
  email: string
  phone: string
  minibio: string
  prefs: Pref[]
  vehicle: Vehicle | null
  identity: IdentityStatus
  /** nombre de photos soumises : la 1re (lunettes de soleil) est refusée, comme dans Figma */
  photoAttempts: number
  trips: Trip[]
  draft: Draft
  search: Search
  boostSeen: boolean
  /** A3 : résultat simulé de la vérification photo (réglage du panneau de démo) */
  photoCheck: PhotoCheckMode
}

/** Prochain 08:00 : toujours dans moins de 24 h, pour illustrer l'US A2 */
const next8am = () => {
  const d = new Date()
  d.setHours(8, 0, 0, 0)
  if (d.getTime() <= Date.now() + 3600000) d.setDate(d.getDate() + 1)
  return d
}
const daysFromNow = (days: number, hour: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, 0, 0, 0)
  return d
}

export const newDraft = (): Draft => ({
  route: 0,
  stops: ['Versailles', 'Poitiers'],
  dates: [],
  time: '08:00',
  seats: 3,
  backSeats: false,
  womenOnly: false,
  instant: true,
  price: 30,
  zen: true,
  insurance: false,
  description: '',
})

const initial = (): AppState => ({
  photo: null,
  firstName: 'Coralie',
  lastName: 'Martin',
  birthDate: '1998-04-12',
  email: CONTACT.email,
  phone: CONTACT.phone,
  minibio: '',
  prefs: [],
  vehicle: null,
  identity: 'none',
  photoAttempts: 0,
  trips: [
    {
      id: 't1',
      from: { label: 'Paris', sub: 'France' },
      to: { label: 'Capbreton', sub: 'France' },
      stops: ['Versailles', 'Poitiers'],
      departure: next8am(),
      durationMin: 490,
      price: 30,
      seats: 3,
      passengers: 0,
      description: '',
    },
    {
      id: 't2',
      from: { label: 'Paris', sub: 'France' },
      to: { label: 'Capbreton', sub: 'France' },
      stops: [],
      departure: daysFromNow(7, 8),
      durationMin: 490,
      price: 30,
      seats: 3,
      passengers: 2,
      description: 'Départ de la porte de la Chapelle.',
    },
  ],
  draft: newDraft(),
  search: { date: new Date(), passengers: 1 },
  boostSeen: false,
  photoCheck: 'reject-first',
})

interface Ctx {
  s: AppState
  set: (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void
  setDraft: (patch: Partial<Draft>) => void
  setSearch: (patch: Partial<Search>) => void
  reset: () => void
  /** sortie d'un parcours : le profil repart de zéro (trajets, recherche, boost déjà vu et réglage de démo conservés) */
  resetProfile: () => void
  toast: string | null
  showToast: (msg: string) => void
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState(initial)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const set: Ctx['set'] = patch => setS(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))
  const setDraft = (patch: Partial<Draft>) => setS(prev => ({ ...prev, draft: { ...prev.draft, ...patch } }))
  const setSearch = (patch: Partial<Search>) => setS(prev => ({ ...prev, search: { ...prev.search, ...patch } }))
  const resetProfile = () =>
    setS(prev => {
      const blank = initial()
      return {
        ...prev,
        photo: blank.photo,
        identity: blank.identity,
        photoAttempts: 0,
        minibio: blank.minibio,
        prefs: blank.prefs,
        vehicle: blank.vehicle,
        firstName: blank.firstName,
        lastName: blank.lastName,
        birthDate: blank.birthDate,
        email: blank.email,
        phone: blank.phone,
        draft: newDraft(),
      }
    })
  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  return (
    <StoreContext.Provider value={{ s, set, setDraft, setSearch, reset: () => setS(prev => ({ ...initial(), photoCheck: prev.photoCheck })), resetProfile, toast, showToast }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore hors StoreProvider')
  return ctx
}

// ── Règles métier ────────────────────────────────────────────

/** Profil complet = photo + identité vérifiée (définition sponsor, US A1) */
export const isComplete = (s: AppState) => !!s.photo && s.identity === 'verified'

/** Étapes du profil (jauge « N étapes sur 6 complétées ») */
export const profileSteps = (s: AppState) => [
  { key: 'email', done: true },
  { key: 'phone', done: true },
  { key: 'photo', done: !!s.photo },
  { key: 'identity', done: s.identity === 'verified' },
  { key: 'minibio', done: !!s.minibio.trim() },
  { key: 'prefs', done: s.prefs.length > 0 },
]

/** A2 (MES TRAJETS V3) : infos manquantes pour améliorer le trajet (photo, étapes, description) */
export const tripMissingInfo = (s: AppState, t: Trip) => !s.photo || t.stops.length === 0 || !t.description

/** A2 : trajet à améliorer ET départ < 24 h ET aucun passager */
export const needsPreDepartureReminder = (s: AppState, t: Trip) => {
  const h = (t.departure.getTime() - Date.now()) / 3600000
  return tripMissingInfo(s, t) && h > 0 && h < 24 && t.passengers === 0
}

/** C2 : message de boost une seule fois, à la 1re publication avec photo ET identité */
export const boostEligible = (s: AppState) => isComplete(s) && !s.boostSeen

export const DEFAULT_PHOTO = photoCoralie
