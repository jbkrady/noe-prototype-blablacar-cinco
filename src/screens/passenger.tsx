import { useMemo, useState } from 'react'
import {
  ArrowUpDown, Bus, Car, ChevronLeft, ChevronRight, CigaretteOff, MessageCircle, Music, PawPrint, Snowflake, Star, Users, Zap,
} from 'lucide-react'
import { useRouter } from '../state/router'
import { useStore } from '../state/store'
import { DRIVERS, OFFERS, inShowcase, passengerBadge, showcase, type Driver, type Offer } from '../data/drivers'
import { shortDate } from '../data/format'
import { cityOf } from '../data/places'
import { Avatar, BackBar, Button, CheckDot, Screen, Sheet, Stepper, TabBar } from '../ui/kit'
import logo from '../assets/logo.png'
import train from '../assets/train.png'
import './passenger.css'

export function Home() {
  const router = useRouter()
  const { s, setSearch } = useStore()
  const [paxOpen, setPaxOpen] = useState(false)
  const { from, to, date, passengers } = s.search

  const search = () => {
    if (!from) return router.push('search-from')
    if (!to) return router.push('search-to')
    router.push('results')
  }

  return (
    <Screen footer={<TabBar active="search" />}>
      <div className="home-hero">
        <p className="home-hello"><img src={logo} alt="" width={26} /> Bonjour, {s.firstName} !</p>
        <h1 className="home-title">Bus, train, covoiturage : BlaBlaCar vous emmène où vous voulez.</h1>
      </div>
      <div className="search-card">
        <button className="sf" onClick={() => router.push('search-from')}>
          <span className="sf-label">De</span>
          <span className={from ? 'sf-value' : 'sf-ph'}>{from ? from.label : 'Ville, gare, lieu'}</span>
        </button>
        <button
          className="sf-swap"
          aria-label="Inverser départ et arrivée"
          onClick={() => setSearch({ from: to, to: from })}
        >
          <ArrowUpDown size={22} />
        </button>
        <button className="sf" onClick={() => router.push('search-to')}>
          <span className="sf-label">Vers</span>
          <span className={to ? 'sf-value' : 'sf-ph'}>{to ? to.label : 'Ville, gare, lieu'}</span>
        </button>
        <div className="sf-split">
          <button className="sf" onClick={() => router.push('search-date')}>
            <span className="sf-label">Départ</span>
            <span className="sf-value">{shortDate(date)}</span>
          </button>
          <button className="sf" onClick={() => router.push('search-return')}>
            <span className="sf-label">Retour</span>
            {s.search.returnDate
              ? <span className="sf-value">{shortDate(s.search.returnDate)}</span>
              : <span className="sf-ph">Date</span>}
          </button>
        </div>
        <button className="sf sf--last" onClick={() => setPaxOpen(true)}>
          <span className="sf-label">Passagers</span>
          <span className="sf-value">{passengers} adulte{passengers > 1 ? 's' : ''} (27 à 59 ans), aucune carte</span>
        </button>
        <button className="search-btn" onClick={search}>Rechercher</button>
      </div>

      <button className="promo">
        <div>
          <p className="promo-title">Buongiorno Trenitalia</p>
          <p className="promo-text">Paris, Lyon, Marseille, Milan : les trains italiens pour ces destinations sont arrivés.</p>
        </div>
        <img src={train} alt="" width={78} />
      </button>

      {paxOpen && (
        <Sheet onClose={() => setPaxOpen(false)}>
          <h2 className="sheet-title">Nombre de passagers</h2>
          <Stepper value={passengers} min={1} max={8} onChange={v => setSearch({ passengers: v })} className="stepper--sheet" />
          <div style={{ marginTop: 20 }}><Button onClick={() => setPaxOpen(false)}>Valider</Button></div>
        </Sheet>
      )}
    </Screen>
  )
}

const TABS = [
  { key: 'all', label: 'Tout', count: 115 },
  { key: 'car', label: 'Covoiturage', count: 81 },
  { key: 'bus', label: 'Bus', count: 10 },
  { key: 'train', label: 'Train', count: 24 },
]

export function Results() {
  const router = useRouter()
  const { s } = useStore()
  const [tab, setTab] = useState('car')
  const { date, passengers } = s.search
  const from = s.search.from ?? { label: 'Paris', sub: 'France' }
  const to = s.search.to ?? { label: 'Lyon', sub: 'France' }
  // C1 : le tirage est refait à chaque recherche, stable tant qu'on reste sur la page
  const newbies = useMemo(() => showcase(OFFERS.map(o => o.driver)), [])
  // classement principal inchangé (heure de départ) ; les newbies de l'encart n'y figurent pas en double
  const mainOffers = OFFERS.filter(o => !inShowcase(DRIVERS[o.driver])).sort((a, b) => a.dep.localeCompare(b.dep))

  return (
    <Screen
      tone="surface"
      footer={<TabBar active="search" />}
      header={
        <div className="res-head">
          <div className="res-query">
            <button className="icon-btn icon-btn--dark" aria-label="Retour" onClick={router.back}><ChevronLeft size={22} /></button>
            <div className="res-query-text">
              <p className="res-route">{cityOf(from)}, France <span className="arrow">→</span> {cityOf(to)}, France</p>
              <p className="res-sub">{shortDate(date)}{s.search.returnDate ? ` – retour ${shortDate(s.search.returnDate)}` : ''}, {passengers} adulte{passengers > 1 ? 's' : ''} (27 à 59 ans), aucune carte</p>
            </div>
            <button className="res-filter">Filtrer</button>
          </div>
          <div className="res-tabs" role="tablist">
            {TABS.map(t => (
              <button key={t.key} role="tab" aria-selected={tab === t.key} className={`res-tab${tab === t.key ? ' res-tab--on' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
                <small>{t.count}</small>
              </button>
            ))}
          </div>
        </div>
      }
    >
      {tab === 'bus' || tab === 'train' ? (
        <div className="res-empty">
          <Bus size={40} />
          <p>Les offres {tab === 'bus' ? 'bus' : 'train'} ne font pas partie du prototype.</p>
          <Button variant="secondary" full={false} onClick={() => setTab('car')}>Voir le covoiturage</Button>
        </div>
      ) : (
        <div className="res-list">
          {newbies.length > 0 && (
            <section className="newbies" aria-label="Nouveaux conducteurs vérifiés">
              <h2>Ils rejoignent la communauté des conducteurs</h2>
              <p>C’est leur premier trajet sur BlaBlaCar !</p>
              <div className="newbies-card">
                {newbies.map(d => {
                  const o = OFFERS.find(x => x.driver === d.id)!
                  return (
                    <button key={d.id} className="newbie" onClick={() => router.push('driver', { id: d.id, offer: o })}>
                      <Avatar src={d.photo} size={40} verified={!d.framed} />
                      <span className="newbie-id">
                        <span className="newbie-name">{d.name}</span>
                        <span className="chip chip--new"><Star size={12} fill="currentColor" /> Nouveau</span>
                      </span>
                      <span className="newbie-price">
                        {o.price} €<small>{o.dep} <span className="arrow">→</span> {o.arr}</small>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}
          {mainOffers.map(o => (
            <OfferCard key={o.driver} o={o} from={cityOf(from)} to={cityOf(to)} onClick={() => router.push('driver', { id: o.driver, offer: o })} />
          ))}
          <div className="res-alert">
            <Button variant="secondary" full={false}>Créer une alerte</Button>
          </div>
        </div>
      )}
    </Screen>
  )
}

/** C3 : « N Trajets Passager », sinon « ★ Nouveau » (jamais « 0 Trajets Passager ») */
export function HistoryBadge({ d }: { d: Driver }) {
  const badge = passengerBadge(d.passengerTrips)
  if (!d.newbie) return null
  if (!badge) return <span className="chip chip--new"><Star size={12} fill="currentColor" /> Nouveau</span>
  return <span className="chip chip--history"><Users size={12} /> {badge}</span>
}

function OfferCard({ o, from, to, onClick }: { o: Offer; from: string; to: string; onClick: () => void }) {
  const d = DRIVERS[o.driver]
  return (
    <button className="offer" onClick={onClick}>
      <span className="offer-top">
        <span className="offer-times"><b>{o.dep}</b><b>{o.arr}</b></span>
        <span className="offer-line" aria-hidden />
        <span className="offer-cities">
          <span><b>{from}</b><small>{o.fromSub}</small></span>
          <span><b>{to}</b><small>{o.toSub}</small></span>
        </span>
        <span className="offer-price">{o.price} €</span>
      </span>
      <span className="offer-bottom">
        <Car size={20} className="muted" />
        <Avatar src={d.photo} letter={d.name[0]} size={36} verified={d.verified && !d.framed} />
        <span className="offer-driver">
          <span>{d.name}</span>
          {d.rating && <small><Star size={12} fill="currentColor" /> {d.rating.toString().replace('.', ',')}</small>}
        </span>
        {d.superDriver && <span className="chip chip--blue">Super Driver</span>}
        {/* C3 : badge d'historique passager des newbies, dans la liste principale */}
        {d.newbie && <HistoryBadge d={d} />}
        <span className="offer-icons">
          {o.instant && <Zap size={18} />}
          {o.eco && <Snowflake size={18} />}
          {o.backSeats && <Users size={18} />}
        </span>
      </span>
    </button>
  )
}

const PREFS = {
  chat: { icon: <MessageCircle size={20} />, label: 'J’aime bien discuter quand je me sens à l’aise' },
  music: { icon: <Music size={20} />, label: 'Musique tout le long !' },
  nosmoke: { icon: <CigaretteOff size={20} />, label: 'Pas de cigarette, svp' },
  pets: { icon: <PawPrint size={20} />, label: 'Les animaux sont les bienvenus' },
}

export function DriverProfile({ id }: { id: string }) {
  const d = DRIVERS[id]
  const badge = passengerBadge(d.passengerTrips)
  return (
    <Screen header={<BackBar />} footer={<TabBar active="search" />}>
      <div className="dp-head">
        {d.framed
          ? <Avatar src={d.photo} size={100} />
          : <span className="dp-ring"><Avatar src={d.photo} letter={d.name[0]} size={92} verified={d.verified} /></span>}
        <div>
          <h1 className="dp-name">{d.name}</h1>
          <p className="dp-age">{d.age} ans</p>
          {d.newbie && badge && <span className="chip chip--history"><Users size={12} /> {badge}</span>}
          {d.superDriver && <span className="chip chip--blue">Super Driver</span>}
        </div>
      </div>
      <div className="list">
        {d.newbie && !badge && (
          <div className="dp-line dp-line--new"><Star size={20} fill="currentColor" /> Nouveau</div>
        )}
        {d.rating && (
          <button className="dp-line">
            <Star size={20} fill="currentColor" className="muted" /> <b>{d.rating.toString().replace('.', ',')}/5 - {d.reviews} avis</b>
            <ChevronRight size={20} className="muted push" />
          </button>
        )}
        {d.driverTrips && <div className="dp-line"><Car size={20} className="muted" /> <b>{d.driverTrips} trajets conducteur</b></div>}
        {!d.newbie && d.passengerTrips > 0 && <div className="dp-line"><Users size={20} className="muted" /> <b>{d.passengerTrips} trajets passager</b></div>}
      </div>
      <hr className="divider" />
      <section className="dp-section">
        <h2>{d.name} {d.verified ? 'a un Profil Vérifié' : 'n’a pas encore vérifié son profil'}</h2>
        {d.verified && (
          <ul className="dp-checks">
            <li><CheckDot /> Pièce d’identité vérifiée</li>
            <li><CheckDot /> Adresse e-mail vérifiée</li>
            {d.phoneVerified && <li><CheckDot /> Numéro de téléphone vérifié</li>}
          </ul>
        )}
      </section>
      <hr className="divider divider--thick" />
      <section className="dp-section">
        <h2>Faites connaissance avec {d.name}</h2>
        <ul className="dp-prefs">
          {d.prefs.map(p => <li key={p}>{PREFS[p].icon} {PREFS[p].label}</li>)}
        </ul>
      </section>
    </Screen>
  )
}
