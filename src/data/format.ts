const DAYS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.']
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
export const MONTHS_CAP = MONTHS.map(m => m[0].toUpperCase() + m.slice(1))

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** « Jeu. 12 Août 2027 » */
export const longDate = (d: Date) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS_CAP[d.getMonth()]} ${d.getFullYear()}`

/** « Aujourd'hui », « Demain », sinon « jeu. 12 août » */
export function shortDate(d: Date) {
  const today = startOfDay(new Date())
  const diff = Math.round((startOfDay(d).getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Aujourd’hui'
  if (diff === 1) return 'Demain'
  return `${DAYS[d.getDay()].toLowerCase()} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export const hhmm = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

/** Ajoute une durée en minutes à « 08:00 » */
export function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number)
  const t = (h * 60 + m + minutes) % (24 * 60)
  return hhmm(Math.floor(t / 60), t % 60)
}

export const durationLabel = (min: number) => `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`
