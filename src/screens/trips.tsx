import { AlarmClock, ChevronRight, CirclePlus, MessagesSquare } from 'lucide-react'
import { useRouter } from '../state/router'
import { needsPreDepartureReminder, useStore, type Trip } from '../state/store'
import { addMinutes, durationLabel, hhmm, longDate } from '../data/format'
import { cityOf } from '../data/places'
import { Button, CheckDot, Screen, TabBar } from '../ui/kit'
import pompe from '../assets/pompe.png'
import './trips.css'

export function Trips() {
  const { s } = useStore()
  const upcoming = [...s.trips].filter(t => t.departure.getTime() > Date.now()).sort((a, b) => a.departure.getTime() - b.departure.getTime())
  return (
    <Screen footer={<TabBar active="trips" />}>
      <h1 className="title trips-title">Vos trajets</h1>
      <div className="fuel">
        <img src={pompe} alt="" width={38} />
        <div>
          <b>L’essence à prix abordable</b>
          <p>Utilisez notre outil pour trouver l’essence la moins chère sur votre trajet</p>
        </div>
        <Button variant="secondary" >Comparer les prix</Button>
      </div>
      <div className="trips">
        {upcoming.map(t => <TripCard key={t.id} t={t} />)}
      </div>
      <button className="archived">
        Trajets archivés <ChevronRight size={22} />
      </button>
    </Screen>
  )
}

/** A2 (maquette MES TRAJETS V2) : bandeau, contour orange et critères si profil incomplet + départ < 24 h + 0 passager */
function TripCard({ t }: { t: Trip }) {
  const router = useRouter()
  const { s } = useStore()
  const alert = needsPreDepartureReminder(s, t)
  const hours = Math.max(1, Math.round((t.departure.getTime() - Date.now()) / 3600000))
  const dep = hhmm(t.departure.getHours(), t.departure.getMinutes())

  // US A2 : identité, photo, description par ordre de priorité ; un critère non rempli remonte au-dessus des critères remplis
  const criteria = [
    { key: 'id', done: s.identity === 'verified', todo: 'Vérifier mon identité', ok: 'Identité vérifiée', go: () => router.push('id-intro', { origin: 'trips' }) },
    { key: 'photo', done: !!s.photo, todo: 'Ajouter une photo de profil', ok: 'Photo de profil', go: () => router.push('photo-intro', { origin: 'trips' }) },
    { key: 'desc', done: !!t.description, todo: 'Ajouter une description', ok: 'Description', go: () => router.push('publish-description', { tripId: t.id }) },
  ].sort((a, b) => Number(a.done) - Number(b.done))

  return (
    <article className={`trip${alert ? ' trip--alert' : ''}`}>
      {alert && <p className="trip-alert-head"><AlarmClock size={18} /> Votre trajet approche. Départ dans {hours}h</p>}
      <div className="trip-body">
        <div className="trip-date">
          <h2>{longDate(t.departure)}</h2>
          <span className="trip-pax">{t.passengers} passager{t.passengers > 1 ? 's' : ''}</span>
        </div>
        <div className="trip-route">
          <span className="trip-times"><b>{dep}</b><small>{durationLabel(t.durationMin)}</small><b>{addMinutes(dep, t.durationMin)}</b></span>
          <span className="offer-line" aria-hidden />
          <span className="trip-cities"><b>{cityOf(t.from)}</b><b>{cityOf(t.to)}</b></span>
        </div>
        {alert && (
          <>
            <p className="trip-alert-lead">Augmentez vos chances de trouver des passagers</p>
            <ul className="criteria">
              {criteria.map(c => (
                <li key={c.key}>
                  {c.done ? (
                    <span className="crit crit--done"><CheckDot size={22} /> {c.ok}</span>
                  ) : (
                    <button className="crit crit--todo" onClick={c.go}><CirclePlus size={22} /> {c.todo}</button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </article>
  )
}

export function Messages() {
  return (
    <Screen footer={<TabBar active="messages" />}>
      <h1 className="title trips-title">Messages</h1>
      <div className="empty">
        <MessagesSquare size={56} strokeWidth={1.4} />
        <p>Vos conversations avec les passagers apparaîtront ici.</p>
      </div>
    </Screen>
  )
}
