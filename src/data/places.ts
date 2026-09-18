export interface Place {
  label: string
  sub: string
}

export const PLACES: Place[] = [
  { label: 'Paris', sub: 'France' },
  { label: 'Lyon', sub: 'France' },
  { label: 'Marseille', sub: 'France' },
  { label: 'Bordeaux', sub: 'France' },
  { label: 'Capbreton', sub: 'France' },
  { label: 'Lille', sub: 'France' },
  { label: 'Nantes', sub: 'France' },
  { label: 'Toulouse', sub: 'France' },
  { label: 'Rennes', sub: 'France' },
  { label: 'Montpellier', sub: 'France' },
  { label: 'Poitiers', sub: 'France' },
  { label: 'Tours', sub: 'France' },
  { label: 'Orléans', sub: 'France' },
  { label: 'Biarritz', sub: 'France' },
  { label: 'Strasbourg', sub: 'France' },
  { label: '65 Rue Ordener', sub: '65 Rue Ordener, Paris' },
  { label: 'Gare de Lyon', sub: 'Place Louis-Armand, Paris' },
]

export const RECENT: Place[] = [
  { label: '65 Rue Ordener', sub: '65 Rue Ordener, Paris' },
  { label: 'Paris', sub: 'France' },
  { label: 'Lyon', sub: 'France' },
  { label: 'Capbreton', sub: 'France' },
]

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function searchPlaces(q: string): Place[] {
  const n = norm(q.trim())
  if (!n) return []
  return PLACES.filter(p => norm(p.label).includes(n) || norm(p.sub).includes(n)).slice(0, 6)
}

/** Ville courte pour les cartes de trajet (« 65 Rue Ordener » → « Paris ») */
/** Même ville ? (un trajet ne peut pas partir et arriver au même endroit) */
export const sameCity = (a?: Place, b?: Place) => !!a && !!b && norm(cityOf(a)) === norm(cityOf(b))

export const cityOf = (p: Place) =>
  p.sub.includes(',') ? p.sub.split(',').pop()!.trim().replace(/^\d{5}\s+/, '') : p.label
