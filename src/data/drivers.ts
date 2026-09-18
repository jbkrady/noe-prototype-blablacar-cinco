import feroze from '../assets/avatar-feroze.png'
import nicolas from '../assets/avatar-nicolas.png'
import jules from '../assets/avatar-jules.png'
import yamina from '../assets/avatar-yamina.png'

export interface Driver {
  id: string
  name: string
  age: number
  photo?: string
  /** photo issue de Figma, déjà cerclée de bleu avec la coche « vérifié » */
  framed?: boolean
  /** pièce d'identité vérifiée */
  verified: boolean
  phoneVerified: boolean
  /** newbie = aucun trajet conducteur effectué avec passager */
  newbie: boolean
  rating?: number
  reviews?: number
  driverTrips?: number
  passengerTrips: number
  superDriver?: boolean
  prefs: ('chat' | 'music' | 'nosmoke' | 'pets')[]
  /** distance du point de départ à celui de la recherche (C1 : tri par proximité) */
  distanceKm: number
}

export const DRIVERS: Record<string, Driver> = {
  feroze: { id: 'feroze', name: 'Feroze', age: 26, photo: feroze, framed: true, verified: true, phoneVerified: true, newbie: true, passengerTrips: 0, prefs: ['chat', 'music'], distanceKm: 1.2 },
  yamina: { id: 'yamina', name: 'Yamina', age: 29, photo: yamina, verified: true, phoneVerified: true, newbie: true, passengerTrips: 0, prefs: ['chat', 'pets'], distanceKm: 1.9 },
  nicolas: { id: 'nicolas', name: 'Nicolas', age: 43, photo: nicolas, framed: true, verified: true, phoneVerified: true, newbie: true, rating: 4.7, reviews: 13, passengerTrips: 13, prefs: ['chat', 'music', 'nosmoke'], distanceKm: 2.8 },
  ines: { id: 'ines', name: 'Inès', age: 31, verified: false, phoneVerified: true, newbie: true, passengerTrips: 4, prefs: ['music'], distanceKm: 0.6 },
  jules: { id: 'jules', name: 'Jules', age: 34, photo: jules, framed: true, verified: true, phoneVerified: true, newbie: false, rating: 4.7, reviews: 56, driverTrips: 82, passengerTrips: 6, superDriver: true, prefs: ['chat', 'music', 'nosmoke'], distanceKm: 3 },
  ludovic: { id: 'ludovic', name: 'Ludovic', age: 52, verified: true, phoneVerified: true, newbie: false, rating: 4.9, reviews: 31, driverTrips: 40, passengerTrips: 2, prefs: ['chat'], distanceKm: 4 },
  akram: { id: 'akram', name: 'Akram', age: 29, verified: true, phoneVerified: true, newbie: false, rating: 5, reviews: 8, driverTrips: 12, passengerTrips: 20, prefs: ['music'], distanceKm: 6 },
  herve: { id: 'herve', name: 'Hervé', age: 61, verified: true, phoneVerified: true, newbie: false, rating: 4.5, reviews: 102, driverTrips: 210, passengerTrips: 0, prefs: ['nosmoke'], distanceKm: 20 },
  erwan: { id: 'erwan', name: 'Erwan', age: 24, verified: false, phoneVerified: false, newbie: false, rating: 4.2, reviews: 3, driverTrips: 3, passengerTrips: 5, prefs: [], distanceKm: 5 },
}

/** C3 : libellé du badge d'historique passager (null = « ★ Nouveau ») */
export function passengerBadge(n: number): string | null {
  if (n <= 0) return null
  if (n > 99) return '99+ Trajets Passager'
  return n === 1 ? '1 Trajet Passager' : `${n} Trajets Passager`
}

/**
 * C1 : l'encart ne montre que les vrais nouveaux — aucun trajet passager — avec photo,
 * pièce d'identité et numéro vérifiés. 3 max tirés au hasard, triés par proximité.
 * Les newbies ayant voyagé comme passagers restent dans la liste principale avec leur badge (C3).
 */
export const inShowcase = (d: Driver) => d.newbie && d.passengerTrips === 0 && !!d.photo && d.verified && d.phoneVerified

export function showcase(ids: string[]): Driver[] {
  const eligible = ids.map(id => DRIVERS[id]).filter(inShowcase)
  const picked = eligible.length > 3 ? [...eligible].sort(() => Math.random() - 0.5).slice(0, 3) : eligible
  return picked.sort((a, b) => a.distanceKm - b.distanceKm)
}

export interface Offer {
  driver: string
  dep: string
  arr: string
  fromSub: string
  toSub: string
  price: number
  instant?: boolean
  backSeats?: boolean
  eco?: boolean
  night?: boolean
}

/** Résultats de recherche (repris de la maquette « Trajet ») */
export const OFFERS: Offer[] = [
  { driver: 'feroze', dep: '10:30', arr: '16:00', fromSub: 'Porte Maillot', toSub: 'Part-Dieu', price: 30 },
  { driver: 'yamina', dep: '09:15', arr: '14:50', fromSub: 'Gare de Lyon', toSub: 'Part-Dieu', price: 29 },
  { driver: 'nicolas', dep: '10:45', arr: '16:20', fromSub: 'Bercy', toSub: 'Perrache', price: 30, instant: true },
  { driver: 'ines', dep: '11:00', arr: '16:25', fromSub: 'Gare de Lyon', toSub: 'Part-Dieu', price: 29 },
  { driver: 'jules', dep: '10:30', arr: '16:00', fromSub: 'Porte Maillot', toSub: 'Part-Dieu', price: 30, instant: true, backSeats: true },
  { driver: 'ludovic', dep: '11:15', arr: '17:05', fromSub: 'Bercy', toSub: 'Part-Dieu', price: 30, backSeats: true },
  { driver: 'akram', dep: '11:30', arr: '17:20', fromSub: 'Porte d’Italie', toSub: 'Perrache', price: 30, instant: true },
  { driver: 'herve', dep: '12:00', arr: '18:10', fromSub: 'Roissy-en-Brie', toSub: 'Vaise', price: 30, eco: true },
  { driver: 'erwan', dep: '20:00', arr: '02:00', fromSub: 'Bercy', toSub: 'Part-Dieu', price: 30, backSeats: true, night: true },
]
