import { useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, History, LocateFixed, MapPin, X } from 'lucide-react'
import { RECENT, searchPlaces, type Place } from '../data/places'
import { MONTHS_CAP, sameDay, startOfDay } from '../data/format'
import { useRouter } from '../state/router'
import { isComplete, useStore } from '../state/store'
import { Button, Screen, TabBar } from '../ui/kit'
import iconDate from '../assets/icon-date.png'
import './shared.css'

export type PlaceTarget = 'search-from' | 'search-to' | 'publish-from' | 'publish-to'

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
  const results = useMemo(() => searchPlaces(query), [query])

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
            {target !== 'publish-to' && target !== 'search-to' && (
              <button className="row" onClick={() => pick({ label: '65 Rue Ordener', sub: '65 Rue Ordener, Paris' })}>
                <span className="row-icon"><LocateFixed size={22} /></span>
                <span className="row-text"><span className="row-title picker-strong">Utiliser ma position actuelle</span></span>
                <ChevronRight className="row-chev" size={22} />
              </button>
            )}
            {RECENT.map(p => (
              <PlaceRow key={p.sub + p.label} p={p} icon={<History size={22} />} onClick={() => pick(p)} />
            ))}
          </>
        ) : (
          <>
            {results.map(p => (
              <PlaceRow key={p.sub + p.label} p={p} onClick={() => pick(p)} />
            ))}
            {results.length === 0 && (
              <PlaceRow p={{ label: q.trim(), sub: 'Utiliser cette adresse' }} icon={<MapPin size={22} />} onClick={() => pick({ label: q.trim(), sub: 'France' })} />
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
export function Calendar({ selected, onPick, min }: { selected: Date[]; onPick: (d: Date) => void; min?: Date }) {
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
                return (
                  <button
                    key={i}
                    className={`cal-day${on ? ' cal-day--on' : ''}${sameDay(d, today) ? ' cal-day--today' : ''}`}
                    disabled={past}
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
  const min = mode === 'return' ? s.search.date : mode === 'publish-return' ? s.draft.dates[0] : undefined

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
      <Calendar selected={dates} onPick={toggle} min={min} />
    </Screen>
  )
}
