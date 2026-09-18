import { useState } from 'react'
import {
  ArrowLeft, Armchair, BadgeCheck, Bell, Check, ChevronDown, ChevronLeft, CircleCheck, CirclePlus, Smile, Star, Users, Venus, Zap,
} from 'lucide-react'
import { useRouter } from '../state/router'
import { boostEligible, isComplete, newDraft, useStore, type Trip } from '../state/store'
import { cityOf, type Place } from '../data/places'
import { addMinutes, hhmm } from '../data/format'
import { Avatar, BackBar, Button, CheckDot, Checkbox, Dialog, Fab, Radio, Row, Screen, Stepper, Title } from '../ui/kit'
import mapParis from '../assets/map-paris.png'
import mapRoute from '../assets/map-route.png'
import illuResa from '../assets/illu-resa.png'
import illuRetour from '../assets/illu-retour.png'
import illuAssurance from '../assets/illu-assurance.png'
import yamina from '../assets/avatar-yamina.png'
import laetitia from '../assets/avatar-laetitia.png'
import './publish.css'

const FabZone = ({ onNext, disabled }: { onNext: () => void; disabled?: boolean }) => (
  <div className="fab-zone"><Fab onClick={onNext} disabled={disabled} /></div>
)

/** Points de rendez-vous suggérés, positionnés sur la carte (coordonnées dans l'image 360×474) */
function meetingPoints(from?: Place): { label: string; sub: string; walk: string; x: number; y: number }[] {
  const city = from ? cityOf(from) : 'Paris'
  if (city === 'Paris')
    return [
      { label: 'Métro Marx Dormoy', sub: 'Sortie 1, Rue Ordener, 75018 Paris', walk: '3 min à pied', x: 214, y: 268 },
      { label: 'Porte de la Chapelle', sub: 'Arrêt de bus, Bd Ney, 75018 Paris', walk: '9 min à pied', x: 240, y: 170 },
      { label: 'Gare de l’Est', sub: 'Rue du 8 Mai 1945, 75010 Paris', walk: '18 min à pied', x: 222, y: 426 },
    ]
  return [
    { label: `Gare de ${city}`, sub: `Parvis de la gare, ${city}`, walk: '6 min à pied', x: 214, y: 268 },
    { label: `Centre-ville de ${city}`, sub: `Place principale, ${city}`, walk: '10 min à pied', x: 240, y: 170 },
    { label: `Parking relais de ${city}`, sub: `Sortie de ville, ${city}`, walk: '4 min en voiture', x: 222, y: 426 },
  ]
}

/** Icône « point de rendez-vous » (flèches convergentes) */
const MeetingIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 4l5 5M9 5v4H5M20 4l-5 5M15 5v4h4M4 20l5-5M9 19v-4H5M20 20l-5-5M15 19v-4h4" />
  </svg>
)

/** GEOLOC : on confirme le point de rendez-vous exact sur la carte */
export function PublishMap() {
  const router = useRouter()
  const { s, setDraft } = useStore()
  const [typed] = useState(s.draft.from)
  const [show, setShow] = useState(false)
  const points = meetingPoints(typed)
  const from = s.draft.from
  const selected = points.find(p => p.label === from?.label)

  const toggle = (p: (typeof points)[number]) =>
    setDraft({ from: selected?.label === p.label ? typed : { label: p.label, sub: p.sub } })

  return (
    <div className="scr">
      <div className="map-full">
        <div className="map-canvas" style={{ backgroundImage: `url(${mapParis})` }}>
          {show && points.map(p => {
            const on = selected?.label === p.label
            return (
              <button
                key={p.label}
                className={`meet${on ? ' meet--on' : ''}`}
                style={{ left: `${(p.x / 360) * 100}%`, top: `${(p.y / 474) * 100}%` }}
                onClick={() => toggle(p)}
                aria-pressed={on}
                aria-label={`Point de rendez-vous : ${p.label}`}
              >
                <MeetingIcon />
                {on && <span className="meet-label"><b>{p.label}</b><small>{p.walk}</small></span>}
              </button>
            )
          })}
        </div>
        <div className="picker-bar map-bar">
          <div className="picker-field picker-field--float">
            <button className="picker-back" aria-label="Retour" onClick={router.back}><ChevronLeft size={22} /></button>
            <span className="map-address">{from ? from.sub.includes(',') ? from.sub : `${from.label}, ${from.sub}` : ''}</span>
          </div>
        </div>
        <button className="map-chip" onClick={() => { if (show && selected) setDraft({ from: typed }); setShow(!show) }}>
          {show ? 'Masquer les suggestions' : 'Voir les suggestions'}
        </button>
        <div className="map-fab"><Fab onClick={() => router.push('publish-to')} /></div>
      </div>
    </div>
  )
}

const ROUTES = [
  { min: 443, km: 760, road: 'A10', label: 'Péages' },
  { min: 487, km: 769, road: 'A63', label: 'Péages' },
  { min: 576, km: 774, road: 'A20', label: 'Sans péages' },
]
const dur = (m: number) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`

export function PublishRoute() {
  const router = useRouter()
  const { s, setDraft } = useStore()
  return (
    <Screen footer={<FabZone onNext={() => router.push('publish-stops')} />}>
      <div className="route-map" style={{ backgroundImage: `url(${mapRoute})` }}>
        <button className="icon-btn route-back" aria-label="Retour" onClick={router.back}>
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
      </div>
      <Title className="route-title">Quelle route prenez-vous ?</Title>
      <div className="list">
        {ROUTES.map((r, i) => (
          <Radio
            key={r.road}
            checked={s.draft.route === i}
            onChange={() => setDraft({ route: i })}
            label={`${dur(r.min)} - ${r.label}`}
            sub={`${r.km} km - ${r.road}`}
          />
        ))}
      </div>
    </Screen>
  )
}

const STOP_OPTIONS = ['Noisy-le-Grand', 'Versailles', 'Évry-Courcouronnes', 'Orléans', 'Tours', 'Poitiers', 'Niort', 'Bordeaux']

/** Étapes de la maquette pour un départ parisien ; sinon, étapes génériques sur le trajet saisi */
function stopOptions(from?: Place, to?: Place): string[] {
  const f = from ? cityOf(from) : 'Paris'
  if (f === 'Paris') return STOP_OPTIONS
  return [`Sortie de ${f}`, 'Aire de covoiturage (mi-parcours)', `Entrée de ${to?.label ?? 'destination'}`]
}
const stopAddress = (c: string): [string, string] => STOP_ADDRESSES[c] ?? [`Parking relais, ${c}`, c.replace(/^(Sortie|Entrée) de /, '')]
const STOP_ADDRESSES: Record<string, [string, string]> = {
  'Noisy-le-Grand': ['Gare RER Noisy-Champs, 93160 Noisy-le-Grand', 'Noisy-le-Grand'],
  Versailles: ['Gare de Versailles-Chantiers, 78000 Versailles', 'Versailles'],
  'Évry-Courcouronnes': ['Gare d’Évry-Courcouronnes, 91000 Évry-Courcouronnes', 'Évry-Courcouronnes'],
  Orléans: ['Gare des Aubrais, 45400 Fleury-les-Aubrais', 'Orléans'],
  Tours: ['Parking du Vinci, 37000 Tours', 'Tours'],
  Poitiers: ['Rocade Ouest, 86000 Poitiers, France', 'Poitiers'],
  Niort: ['Aire de covoiturage Niort-Est, 79000 Niort', 'Niort'],
  Bordeaux: ['Gare Saint-Jean, 33800 Bordeaux', 'Bordeaux'],
}

export function PublishStops() {
  const router = useRouter()
  const { s, setDraft } = useStore()
  const options = stopOptions(s.draft.from, s.draft.to)
  const selected = s.draft.stops.filter(x => options.includes(x))
  const toggle = (c: string, on: boolean) =>
    setDraft({ stops: options.filter(x => (x === c ? on : selected.includes(x))) })
  const next = () => {
    setDraft({ stops: selected })
    router.push(selected.length ? 'publish-stops-detail' : 'publish-date')
  }
  return (
    <Screen header={<BackBar />} footer={<FabZone onNext={next} />}>
      <Title>Ajoutez des étapes pour trouver plus de passagers</Title>
      <div className="list list--top">
        {options.map(c => (
          <Checkbox key={c} checked={selected.includes(c)} onChange={v => toggle(c, v)} label={c} />
        ))}
      </div>
    </Screen>
  )
}

export function PublishStopsDetail() {
  const router = useRouter()
  const { s } = useStore()
  const { from, to, stops } = s.draft
  return (
    <Screen header={<BackBar />} footer={<FabZone onNext={() => router.push('publish-date')} />}>
      <Title>Voici les meilleurs endroits pour s’arrêter. OK pour vous ?</Title>
      <ol className="timeline">
        <li className="tl-end">{from ? from.sub.includes(',') ? from.sub : `${from.label}, ${from.sub}` : ''}</li>
        {stops.map(c => (
          <li key={c} className="tl-stop">
            <button>
              <span>
                <b>{stopAddress(c)[0]}</b>
                <small>{stopAddress(c)[1]}</small>
              </span>
              <ChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </li>
        ))}
        <li className="tl-end">{to ? `${to.label}, ${to.sub}` : ''}</li>
      </ol>
    </Screen>
  )
}

export function PublishTime() {
  const router = useRouter()
  const { s, setDraft } = useStore()
  const [open, setOpen] = useState(false)
  return (
    <Screen header={<BackBar />} footer={<FabZone onNext={() => router.push('publish-seats')} />}>
      <Title>À quelle heure allez-vous récupérer vos passagers ?</Title>
      <button className="time-field" onClick={() => setOpen(true)} aria-label={`Heure de départ : ${s.draft.time}. Modifier`}>
        <span>{s.draft.time}</span>
        <ChevronDown size={24} />
      </button>
      {open && (
        <TimeDialog
          value={s.draft.time}
          onCancel={() => setOpen(false)}
          onOk={t => {
            setDraft({ time: t })
            setOpen(false)
          }}
        />
      )}
    </Screen>
  )
}

/** Horloge Android : cadran des heures (anneau 1-12 / 13-24) puis des minutes */
function TimeDialog({ value, onOk, onCancel }: { value: string; onOk: (t: string) => void; onCancel: () => void }) {
  const [h0, m0] = value.split(':').map(Number)
  const [h, setH] = useState(h0)
  const [m, setM] = useState(m0)
  const [mode, setMode] = useState<'h' | 'm'>('h')
  const R_OUT = 104
  const R_IN = 68
  const pos = (i: number, r: number) => ({
    left: `calc(50% + ${Math.sin((i / 12) * 2 * Math.PI) * r}px)`,
    top: `calc(50% - ${Math.cos((i / 12) * 2 * Math.PI) * r}px)`,
  })
  // Glisser sur le cadran : angle → valeur (anneau intérieur = 13-24 h)
  const fromPointer = (e: React.PointerEvent<HTMLDivElement>, commit: boolean) => {
    const r = e.currentTarget.getBoundingClientRect()
    const scale = r.width / 256
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI
    const a = (deg + 360) % 360
    if (mode === 'h') {
      const i = Math.round(a / 30) % 12
      const inner = Math.hypot(dx, dy) < ((R_OUT + R_IN) / 2) * scale
      setH(inner ? (i === 0 ? 0 : i + 12) : i === 0 ? 12 : i)
      if (commit) setMode('m')
    } else {
      setM(Math.round(a / 6) % 60)
    }
  }
  const selIndex = mode === 'h' ? h % 12 : m / 5
  const selR = mode === 'h' ? (h === 0 || h > 12 ? R_IN : R_OUT) : R_OUT
  const angle = (selIndex / 12) * 360

  return (
    <Dialog onClose={onCancel}>
      <div className="clock-head">
        <button className={`clock-seg${mode === 'h' ? ' clock-seg--on' : ''}`} onClick={() => setMode('h')}>{String(h).padStart(2, '0')}</button>
        <span>:</span>
        <button className={`clock-seg${mode === 'm' ? ' clock-seg--on' : ''}`} onClick={() => setMode('m')}>{String(m).padStart(2, '0')}</button>
      </div>
      <div
        className="clock"
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e, false) }}
        onPointerMove={e => { if (e.buttons) fromPointer(e, false) }}
        onPointerUp={e => fromPointer(e, true)}
      >
        <span className="clock-hand" style={{ height: selR, transform: `rotate(${angle}deg)` }} />
        <span className="clock-center" />
        {mode === 'h' ? (
          <>
            {Array.from({ length: 12 }, (_, i) => {
              const v = i === 0 ? 12 : i
              return <button key={`o${v}`} className={`clock-n${h === v ? ' clock-n--on' : ''}`} style={pos(i, R_OUT)} onClick={() => { setH(v); setMode('m') }}>{v}</button>
            })}
            {Array.from({ length: 12 }, (_, i) => {
              const v = i === 0 ? 0 : i + 12
              return <button key={`i${v}`} className={`clock-n clock-n--in${h === v ? ' clock-n--on' : ''}`} style={pos(i, R_IN)} onClick={() => { setH(v); setMode('m') }}>{i === 0 ? '00' : v}</button>
            })}
          </>
        ) : (
          Array.from({ length: 12 }, (_, i) => (
            <button key={i} className={`clock-n${m === i * 5 ? ' clock-n--on' : ''}`} style={pos(i, R_OUT)} onClick={() => setM(i * 5)}>{i * 5}</button>
          ))
        )}
      </div>
      <div className="clock-actions">
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button onClick={() => onOk(hhmm(h, m))}>OK</Button>
      </div>
    </Dialog>
  )
}

export function PublishSeats() {
  const router = useRouter()
  const { s, setDraft } = useStore()
  const d = s.draft
  return (
    <Screen header={<BackBar />} footer={<FabZone onNext={() => router.push('publish-instant')} />}>
      <Title>Combien de passagers BlaBlaCar pouvez-vous accepter ?</Title>
      <Stepper value={d.seats} min={1} max={8} onChange={v => setDraft({ seats: v })} className="seats" />
      <hr className="divider divider--thick" />
      <h2 className="section-title section-title--sm">Options passagers</h2>
      <div className="list">
        <Checkbox checked={d.backSeats} onChange={v => setDraft({ backSeats: v })} label="Max. 2 à l’arrière" sub="Le confort, c’est important ! Laissez un siège libre à l’arrière" icon={<Users size={22} />} />
        <Checkbox checked={d.womenOnly} onChange={v => setDraft({ womenOnly: v })} label="Entre Femmes" sub="Rendez votre trajet visible uniquement par les femmes" icon={<Venus size={22} />} />
      </div>
    </Screen>
  )
}

export function PublishInstant() {
  const router = useRouter()
  const { setDraft } = useStore()
  const next = (instant: boolean) => {
    setDraft({ instant })
    router.push('publish-price')
  }
  return (
    <Screen header={<BackBar />}>
      <img className="illu" src={illuResa} alt="" />
      <Title>Activez la réservation instantanée pour vos passagers</Title>
      <ul className="benefits">
        <li><Bell size={22} /><div><b>Plus pratique</b><p>Plus besoin de consulter chaque demande de passager avant qu’elle n’expire</p></div></li>
        <li><Zap size={22} /><div><b>Attirez plus de passagers</b><p>Ils préfèrent une réponse immédiate</p></div></li>
      </ul>
      <div className="list list--top">
        <Row title="Activer la réservation instantanée" link strong onClick={() => next(true)} />
        <Row title="Consulter chaque demande de passager avant qu’elle n’expire" onClick={() => next(false)} />
      </div>
    </Screen>
  )
}

const SIMILAR = [
  { dep: '9:00', arr: '16:40', price: 35, name: 'Yamina', rating: '4.67', photo: yamina },
  { dep: '8:00', arr: '17:40', price: 33, name: 'Abdoulaye', rating: '1.44', photo: null },
  { dep: '8:00', arr: '16:40', price: 35, name: 'Laetitia', rating: '5.0', photo: laetitia },
]

export function PublishPrice() {
  const router = useRouter()
  const { s, setDraft } = useStore()
  const p = s.draft.price
  const [lo, hi] = [29, 31]
  const state = p < lo ? 'low' : p > hi ? 'high' : 'ok'
  const from = s.draft.from ? cityOf(s.draft.from) : 'Paris'
  const to = s.draft.to?.label ?? 'Capbreton'
  return (
    <Screen header={<BackBar />} footer={<div className="btn-zone"><Button onClick={() => router.push('publish-zen')}>Confirmer le prix</Button></div>}>
      <Title>Fixez votre prix par place</Title>
      <Stepper
        value={p}
        min={5}
        max={90}
        onChange={v => setDraft({ price: v })}
        className={`price price--${state}`}
        render={v => <>{v} €</>}
      />
      <div className="price-advice pad">
        <span className={`price-chip price-chip--${state}`}>Prix conseillé : {lo} € - {hi} €</span>
        <p>
          {state === 'ok' && 'Vous aurez des passagers en un rien de temps.'}
          {state === 'low' && 'Pensez à augmenter le prix pour un meilleur partage des frais sur ce trajet. Vous aurez des passagers en un rien de temps !'}
          {state === 'high' && 'Les passagers trouveront probablement des trajets moins chers que le vôtre.'}
        </p>
      </div>
      <hr className="divider divider--thick" />
      <h2 className="section-title section-title--sm">Prix de trajets similaires</h2>
      <div className="similar">
        {SIMILAR.map(t => (
          <div key={t.name} className="offer offer--static">
            <span className="offer-top">
              <span className="offer-times"><b>{t.dep}</b><b>{t.arr}</b></span>
              <span className="offer-line" aria-hidden />
              <span className="offer-cities"><span><b>{from}</b></span><span><b>{to}</b></span></span>
              <span className="offer-price">{t.price}<sup>00</sup> €</span>
            </span>
            <span className="offer-bottom">
              <Avatar src={t.photo} letter={t.name[0]} size={36} />
              <span className="offer-driver"><span>{t.name}</span><small><Star size={12} fill="currentColor" /> {t.rating}</small></span>
            </span>
          </div>
        ))}
      </div>
    </Screen>
  )
}

export function PublishZen() {
  const router = useRouter()
  const { s, setDraft } = useStore()
  return (
    <Screen header={<BackBar />} footer={<FabZone onNext={() => router.push('publish-return')} />}>
      <Title>Nouveau : économisez jusqu’à 3 fois plus sur ces trajets</Title>
      <p className="lead">Avec Zen, recevez des demandes de trajet porte-à-porte de la part de passagers prêts à payer plus pour le confort d’un trajet porte-à-porte.</p>
      <div className="pad" style={{ marginTop: 16 }}>
        <span className="zen-chip">Zen</span>
        <div className={`zen-card${s.draft.zen ? ' zen-card--on' : ''}`}>
          <Radio checked={s.draft.zen} onChange={() => setDraft({ zen: true })} label="Activez Zen sur ces trajets (gratuit)" />
          <ul className="zen-list">
            <li><Armchair size={20} /> Une seule réservation pour remplir toutes vos places libres (jusqu’à {s.draft.seats})</li>
            <li><Users size={20} /> Une seule personne avec qui vous coordonner du début à la fin, pour un trajet plus fluide</li>
            <li><Check size={20} /> Une liberté totale d’accepter ou de refuser chaque demande selon votre emploi du temps</li>
          </ul>
        </div>
        <div className={`zen-card zen-card--off${!s.draft.zen ? ' zen-card--on' : ''}`}>
          <Radio checked={!s.draft.zen} onChange={() => setDraft({ zen: false })} label="Ne pas activer Zen" />
        </div>
      </div>
    </Screen>
  )
}

export function PublishReturn() {
  const router = useRouter()
  const { s, setDraft } = useStore()
  const next = () => router.push(isComplete(s) ? 'publish-insurance' : 'publish-reminder')
  return (
    <Screen header={<BackBar />}>
      <img className="illu illu--center" src={illuRetour} alt="" />
      <Title>Vous faites aussi le voyage retour ? Publiez votre trajet maintenant</Title>
      <div className="list list--top">
        <Row title="OK !" link strong onClick={() => router.push('publish-return-date')} />
        <Row title="Non, merci" onClick={() => { setDraft({ returnDate: undefined }); next() }} />
      </div>
    </Screen>
  )
}

/** A1 — étape de rappel dans la publication : tous les éléments manquants, non bloquant */
export function PublishReminder() {
  const router = useRouter()
  const { s } = useStore()
  const missing = [
    !s.photo && { key: 'photo', title: 'Ajouter une photo', sub: 'Quelques secondes', go: () => router.push('photo-intro', { origin: 'publish-reminder' }) },
    s.identity !== 'verified' && { key: 'id', title: 'Vérifier une pièce d’identité', sub: 'Environ 2 minutes', go: () => router.push('id-intro', { origin: 'publish-reminder' }) },
  ].filter(Boolean) as { key: string; title: string; sub: string; go: () => void }[]

  return (
    <Screen header={<BackBar />} footer={<div className="btn-zone"><Button onClick={() => router.push('publish-insurance')}>Continuer</Button></div>}>
      <Title>{missing.length ? <>Boostez votre premier trajet <span aria-hidden>🚀</span></> : 'Votre profil est complet !'}</Title>
      <p className="lead">
        {missing.length
          ? 'Les premiers trajets de conducteurs avec des profils complets sont mis en avant dans la recherche.'
          : 'Votre trajet bénéficiera de la mise en avant des nouveaux conducteurs.'}
      </p>
      {s.photo && (
        <div className="online pad-x">
          <Avatar src={s.photo} size={30} /> <span>Votre photo est en ligne</span> <CircleCheck size={22} className="online-ok" />
        </div>
      )}
      {missing.length > 0 && <h2 className="section-title section-title--sm reminder-h">Complétez votre profil</h2>}
      <div className="pad reminder-cards">
        {missing.map(m => (
          <button key={m.key} className="reminder-card" onClick={m.go}>
            <CirclePlus size={24} />
            <span><b>{m.title}</b><small>{m.sub}</small></span>
            <ChevronLeft size={22} style={{ transform: 'rotate(180deg)' }} />
          </button>
        ))}
      </div>
      <ul className="done-list pad">
        {s.photo && <li><CheckDot /> Photo de profil</li>}
        {s.identity === 'verified' && <li><CheckDot /> Pièce d’identité vérifiée</li>}
        <li><CheckDot /> {s.email}</li>
        <li><CheckDot /> {s.phone}</li>
      </ul>
    </Screen>
  )
}

export function PublishInsurance() {
  const router = useRouter()
  const { setDraft } = useStore()
  const next = (insurance: boolean) => {
    setDraft({ insurance })
    router.push('publish-description')
  }
  return (
    <Screen header={<BackBar />}>
      <img className="illu" src={illuAssurance} alt="" />
      <Title>Assurez vos trajets pour un covoiturage en toute sérénité</Title>
      <ul className="ticks pad">
        <li><Check size={20} /> Rien à avancer, 2,50 € seront déduits du montant reçu après le trajet</li>
        <li><Check size={20} /> Franchise remboursée jusqu’à 1500 €</li>
        <li><Check size={20} /> Assistance et remorquage vers le garage le plus proche en cas de problème</li>
      </ul>
      <div className="list">
        <Row title="Assurer mes trajets moyennant 2,50 € par trajet" link onClick={() => next(true)} />
        <Row title="Non, merci" onClick={() => next(false)} />
      </div>
    </Screen>
  )
}

/** B1 — placeholder, mot pour mot */
export const DESCRIPTION_PLACEHOLDER =
  "Vous ne pouvez accepter qu'un bagage cabine et un sac à dos ?\nVous êtes flexible sur l'heure de départ ?\nVous ne faites pas de détour de plus de 10 min ?"

/** B1 + B2 — description du trajet (publication, ou modification depuis « Vos trajets ») */
export function PublishDescription({ tripId }: { tripId?: string }) {
  const router = useRouter()
  const { s, set, setDraft } = useStore()
  const trip = tripId ? s.trips.find(t => t.id === tripId) : undefined
  const [text, setText] = useState(trip ? trip.description : s.draft.description)
  const [focused, setFocused] = useState(false)

  const publish = () => {
    const d = { ...s.draft, description: text.trim() }
    const route = ROUTES[d.route]
    const dates = d.dates.length ? d.dates : [new Date(Date.now() + 86400000)]
    const [hh, mm] = d.time.split(':').map(Number)
    const created: Trip[] = dates.map((day, i) => {
      const dep = new Date(day)
      dep.setHours(hh, mm, 0, 0)
      return {
        id: `p${Date.now()}${i}`,
        from: d.from ?? { label: 'Paris', sub: 'France' },
        to: d.to ?? { label: 'Capbreton', sub: 'France' },
        stops: d.stops,
        departure: dep,
        durationMin: route.min + 47,
        price: d.price,
        seats: d.seats,
        passengers: 0,
        description: d.description,
      }
    })
    if (d.returnDate) {
      const back = new Date(d.returnDate)
      back.setHours(hh, mm, 0, 0)
      created.push({ ...created[0], id: `r${Date.now()}`, from: created[0].to, to: created[0].from, stops: [...d.stops].reverse(), departure: back })
    }
    const eligible = boostEligible(s)
    set(prev => ({ trips: [...prev.trips, ...created], draft: newDraft(), boostSeen: prev.boostSeen || eligible }))
    if (eligible) router.resetTo('boost', { tripId: created[0].id })
    else {
      router.resetTo('trips')
    }
  }

  const save = () => {
    set(prev => ({ trips: prev.trips.map(t => (t.id === tripId ? { ...t, description: text.trim() } : t)) }))
    router.back()
  }

  return (
    <Screen header={<BackBar />}>
      <Title>Informez vos passagers des détails utiles pour leur trajet</Title>
      <div className="pad desc">
        <textarea
          className="desc-field"
          value={text}
          onChange={e => {
            setText(e.target.value)
            if (!trip) setDraft({ description: e.target.value })
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // B1 : le placeholder s'efface dès le clic, pas à la première frappe
          placeholder={focused ? '' : DESCRIPTION_PLACEHOLDER}
          rows={5}
          aria-label="Description du trajet"
        />
        {/* B2 : message toujours affiché sous le champ, non cliquable */}
        <p className="desc-hint">
          <Smile size={30} strokeWidth={1.6} />
          <span>Ce message rassure les passagers et évite les malentendus le jour J</span>
        </p>
        <div className="desc-cta">
          {trip ? <Button full={false} onClick={save}>Enregistrer</Button> : <Button full={false} onClick={publish}>Publier le trajet</Button>}
        </div>
        {!trip && (
          <p className="legal">
            Dans le cadre d’un trajet en covoiturage, vous êtes soumis(e) aux dispositions des <u>articles 1101 et suivants du code civil</u>. En publiant cette offre vous reconnaissez être non-professionnel(le). Dans le cas contraire, vous encourez les sanctions prévues à l’article L132-2 du Code de la consommation.
          </p>
        )}
      </div>
    </Screen>
  )
}

/** C2 — message de boost (écran créé : aucune maquette Figma) */
export function Boost({ tripId }: { tripId?: string }) {
  const router = useRouter()
  const { s } = useStore()
  const t = s.trips.find(x => x.id === tripId) ?? s.trips[s.trips.length - 1]
  return (
    <Screen footer={<div className="btn-zone"><Button onClick={() => router.resetTo('trips')}>Voir mon trajet</Button></div>}>
      <div className="boost-hero" aria-hidden>
        <div className="boost-halo" />
        <span className="boost-rocket">🚀</span>
      </div>
      <Title>Votre trajet est publié et boosté !</Title>
      <p className="lead">Votre photo et votre pièce d’identité sont vérifiées : pour vos premiers trajets, votre profil est mis en avant dans les résultats de recherche.</p>
      <div className="pad boost-card">
        <p className="boost-label">Ce que voient les passagers</p>
        <div className="newbies">
          <h2>Ils rejoignent la communauté des conducteurs</h2>
          <p>C’est leur premier trajet sur BlaBlaCar !</p>
          <div className="newbies-card">
            <div className="newbie newbie--me">
              <Avatar src={s.photo} size={40} verified />
              <span className="newbie-id"><span className="newbie-name">{s.firstName}</span><span className="chip chip--new"><Star size={12} fill="currentColor" /> Nouveau</span></span>
              <span className="newbie-price">{t.price} €<small>{hhmm(t.departure.getHours(), t.departure.getMinutes())} <span className="arrow">→</span> {addMinutes(hhmm(t.departure.getHours(), t.departure.getMinutes()), t.durationMin)}</small></span>
            </div>
          </div>
        </div>
      </div>
      <ul className="ticks pad">
        <li><BadgeCheck size={20} /> Attendez-vous à des demandes de réservation rapides.</li>
        <li><Zap size={20} /> Répondez vite pour garder votre avantage.</li>
      </ul>
    </Screen>
  )
}
