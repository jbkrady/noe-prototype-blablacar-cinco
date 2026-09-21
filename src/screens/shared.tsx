import { useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, History, LocateFixed, MapPin, X } from 'lucide-react'
import { cityOf, sameCity, searchPlaces, type Place } from '../data/places'
import { MONTHS_CAP, sameDay, startOfDay } from '../data/format'
import { useRouter } from '../state/router'
import { isComplete, useStore } from '../state/store'
import { Button, Screen, TabBar } from '../ui/kit'
import iconDate from '../assets/icon-date.png'
import './shared.css'

export type PlaceTarget = 'search-from' | 'search-to' | 'publish-from' | 'publish-to'

const CURRENT_POSITION: Place = { label: '65 Rue Ordener', sub: '65 Rue Ordener, Paris' }
const SUGGESTIONS: Record<PlaceTarget, Place[]> = {
  'search-from': [{ label: 'Paris', sub: 'France' }],
  'search-to': [{ label: 'Lyon', sub: 'France' }],
  'publish-from': [{ label: 'Paris', sub: 'France' }],
  'publish-to': [{ label: 'Capbreton', sub: 'France' }],
}

/** Saisie d'adresse avec suggestions (maquettes SUGG ADRESSE / DESTINATION) */
export function PlacePicker({ target }: { target: PlaceTarget }) {
  const router = useRouter()
  const { s, setSearch, setDraft } = useStore()
  const initialValue =
    target === 'search-from' ? s.search.from : target === 'search-to' ? s.search.to : target === 'publish-from' ? s.draft.from : s.draft.to
  const [q, setQ] = useState(initialValue ? `${initialValue.label}, ${initialValue.sub}` : '')
  const [touched, setTouched] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const query = touched ? q : ''
  // l'autre extrémité du trajet : on ne propose pas la même ville au départ et à l'arrivée
  const other =
    target === 'search-from' ? s.search.to : target === 'search-to' ? s.search.from : target === 'publish-from' ? s.draft.to : s.draft.from
  const allowed = (p: Place) => !sameCity(p, other)
  // recherche passager : on ne propose que des villes (pas de rue ni de gare)
  const isSearch = target.startsWith('search')
  const found = useMemo(() => searchPlaces(query).filter(p => !isSearch || !p.sub.includes(',')), [query, isSearch])
  const results = found.filter(allowed)
  const typed: Place = { label: q.trim(), sub: 'France' }
  const blocked = !!query && results.length === 0 && (found.length > 0 || sameCity(typed, other))
  const otherRole = target.endsWith('to') ? 'votre départ' : 'votre arrivée'

  const pick = (p: Place) => {
    if (target === 'search-from') setSearch({ from: p })
    if (target === 'search-to') setSearch({ to: p })
    if (target === 'publish-from') setDraft({ from: p })
    if (target === 'publish-to') setDraft({ to: p })
    if (target === 'publish-from') router.push('publish-map')
    else if (target === 'publish-to') router.push('publish-route')
    else router.back()
  }

  const isRoot = target === 'publish-from' && router.depth === 1
  const placeholder = target.endsWith('to') ? 'Où allez-vous ?' : 'Saisissez l’adresse précise'

  return (
    <Screen
      footer={isRoot ? <TabBar active="publish" /> : undefined}
      header={
        <div className="picker-bar">
          <div className="picker-field">
            {!isRoot && (
              <button className="picker-back" aria-label="Retour" onClick={router.back}>
                <ChevronLeft size={22} />
              </button>
            )}
            <input
              ref={input}
              autoFocus
              value={q}
              placeholder={placeholder}
              onChange={e => {
                setQ(e.target.value)
                setTouched(true)
              }}
              onFocus={e => e.target.select()}
              aria-label={placeholder}
            />
            {q && (
              <button
                className="picker-clear"
                aria-label="Effacer"
                onClick={() => {
                  setQ('')
                  setTouched(true)
                  input.current?.focus()
                }}
              >
                <X size={22} strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="list">
        {!query ? (
          <>
            {/* départ : position actuelle + Paris ; arrivée : Lyon (recherche) ou Capbreton (publication) — saisie libre au-dessus */}
            {target.endsWith('from') && allowed(CURRENT_POSITION) && (
              <button className="row" onClick={() => pick(CURRENT_POSITION)}>
                <span className="row-icon"><LocateFixed size={22} /></span>
                <span className="row-text">
                  <span className="row-title picker-strong">Utiliser ma position actuelle</span>
                  <span className="row-sub">{CURRENT_POSITION.sub}</span>
                </span>
                <ChevronRight className="row-chev" size={22} />
              </button>
            )}
            {(SUGGESTIONS[target] ?? []).filter(allowed).map(p => (
              <PlaceRow key={p.sub + p.label} p={p} icon={<History size={22} />} onClick={() => pick(p)} />
            ))}
          </>
        ) : (
          <>
            {results.map(p => (
              <PlaceRow key={p.sub + p.label} p={p} onClick={() => pick(p)} />
            ))}
            {blocked && other && (
              <p className="picker-warning">
                {cityOf(other)} est déjà {otherRole}. Choisissez une autre ville.
              </p>
            )}
            {results.length === 0 && !blocked && (
              <PlaceRow p={{ label: q.trim(), sub: 'Utiliser cette adresse' }} icon={<MapPin size={22} />} onClick={() => pick(typed)} />
            )}
          </>
        )}
      </div>
    </Screen>
  )
}

function PlaceRow({ p, icon, onClick }: { p: Place; icon?: React.ReactNode; onClick: () => void }) {
  return (
    <button className="row" onClick={onClick}>
      {icon && <span className="row-icon">{icon}</span>}
      <span className="row-text">
        <span className="row-title">{p.label}</span>
        <span className="row-sub">{p.sub}</span>
      </span>
      <ChevronRight className="row-chev" size={22} />
    </button>
  )
}

const WEEK = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.']

/** Calendrier sur 4 mois, jours passés désactivés */
export function Calendar({ selected, onPick, min, busy = [] }: { selected: Date[]; onPick: (d: Date) => void; min?: Date; busy?: Date[] }) {
  const today = startOfDay(new Date())
  const first = min && min > today ? startOfDay(min) : today
  const months = Array.from({ length: 4 }, (_, i) => new Date(today.getFullYear(), today.getMonth() + i, 1))
  return (
    <div className="cal">
      <div className="cal-week">
        {WEEK.map(d => <span key={d}>{d}</span>)}
      </div>
      {months.map(m => {
        const offset = (m.getDay() + 6) % 7
        const count = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate()
        return (
          <section key={m.getTime()} className="cal-month">
            <h3>{MONTHS_CAP[m.getMonth()]} {m.getFullYear()}</h3>
            <div className="cal-grid">
              {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
              {Array.from({ length: count }, (_, i) => {
                const d = new Date(m.getFullYear(), m.getMonth(), i + 1)
                const past = d < first
                const on = selected.some(x => sameDay(x, d))
                const taken = busy.some(x => sameDay(x, d))
                return (
                  <button
                    key={i}
                    className={`cal-day${on ? ' cal-day--on' : ''}${sameDay(d, today) ? ' cal-day--today' : ''}${taken ? ' cal-day--busy' : ''}`}
                    disabled={past || taken}
                    aria-label={taken ? `${i + 1} : vous avez déjà un trajet ce jour-là` : undefined}
                    onClick={() => onPick(d)}
                    aria-pressed={on}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

/** Choix de date — une seule (recherche) ou jusqu'à 20 (publication, maquette DATE DEPART) */
export function DatePicker({ mode }: { mode: 'search' | 'return' | 'publish' | 'publish-return' }) {
  const router = useRouter()
  const { s, setSearch, setDraft, showToast } = useStore()
  const multi = mode === 'publish'
  const initial = {
    search: [s.search.date],
    return: s.search.returnDate ? [s.search.returnDate] : [],
    publish: s.draft.dates,
    'publish-return': s.draft.returnDate ? [s.draft.returnDate] : [],
  }[mode]
  const [dates, setDates] = useState<Date[]>(initial)
  // le retour ne peut pas précéder l'aller
  const tomorrow = new Date(Date.now() + 86400000)
  const min = mode === 'return' ? s.search.date : mode === 'publish-return' ? s.draft.dates[0] : mode === 'publish' ? tomorrow : undefined
  // un conducteur ne peut pas publier deux trajets le même jour (ni un retour le jour de l'aller)
  const busy =
    mode === 'publish' ? s.trips.map(t => t.departure)
    : mode === 'publish-return' ? [...s.trips.map(t => t.departure), ...s.draft.dates]
    : []

  const toggle = (d: Date) => {
    if (!multi) return setDates([d])
    if (dates.some(x => sameDay(x, d))) return setDates(dates.filter(x => !sameDay(x, d)))
    if (dates.length >= 20) return showToast('Vous pouvez sélectionner 20 dates au maximum.')
    setDates([...dates, d].sort((a, b) => a.getTime() - b.getTime()))
  }

  const confirm = () => {
    if (mode === 'search') {
      setSearch({ date: dates[0] })
      router.back()
    } else if (mode === 'return') {
      setSearch({ returnDate: dates[0] })
      router.back()
    } else if (mode === 'publish-return') {
      setDraft({ returnDate: dates[0] })
      router.push(isComplete(s) ? 'publish-insurance' : 'publish-reminder')
    } else {
      setDraft({ dates })
      router.push('publish-time')
    }
  }

  const label = multi
    ? dates.length === 0
      ? 'Sélectionnez vos dates'
      : `${dates.length} date${dates.length > 1 ? 's' : ''} sélectionnée${dates.length > 1 ? 's' : ''}`
    : 'Sélectionnez la date'

  return (
    <Screen
      header={
        <div>
          <div className="backbar"><button className="icon-btn" aria-label="Retour" onClick={router.back}><ChevronLeft size={26} /></button></div>
          <h1 className="title">{mode === 'return' || mode === 'publish-return' ? 'Quand revenez-vous ?' : 'Quand partez-vous ?'}</h1>
          {multi && (
            <div className="info-card">
              <img src={iconDate} alt="" width={22} />
              <p>Vous faites souvent ce trajet ? Vous pouvez maintenant sélectionner jusqu’à 20 dates en une seule fois !</p>
            </div>
          )}
        </div>
      }
      footer={
        <div className="btn-zone">
          <Button onClick={confirm} disabled={dates.length === 0}>{label}</Button>
          {mode === 'return' && s.search.returnDate && (
            <Button variant="ghost" onClick={() => { setSearch({ returnDate: undefined }); router.back() }}>Aller simple</Button>
          )}
        </div>
      }
    >
      {busy.length > 0 && (
        <p className="cal-legend"><span className="cal-legend-dot" /> Jours où vous avez déjà un trajet</p>
      )}
      <Calendar selected={dates} onPick={toggle} min={min} busy={busy} />
    </Screen>
  )
}
