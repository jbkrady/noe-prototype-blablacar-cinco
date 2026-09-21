import { JOURNEYS, NOTES } from './notes'
import { ROUTES } from './routes'
import { DEFAULT_PHOTO, useStore, type PhotoCheckMode } from '../state/store'
import './DemoPanel.css'

export function DemoPanel({ current, onStart, onReset }: { current: string; onStart: (route: string) => void; onReset: () => void }) {
  const { s, set } = useStore()
  const note = NOTES[current]
  return (
    <aside className="panel" lang="fr">
      <header>
        <p className="panel-kicker">Noé · BlaBlaCar · Newbie drivers</p>
        <h1 className="panel-title">Prototype interactif</h1>
        <p className="panel-disclaimer">
          Prototype réalisé dans le cadre de la formation Product Manager de Noé. Ce n’est pas une application officielle BlaBlaCar.
        </p>
      </header>

      <section className="panel-now" aria-live="polite">
        <p className="panel-label">Écran affiché</p>
        <p className="panel-screen">{ROUTES[current]?.title}</p>
        {note ? (
          <>
            {note.created && <div className="panel-tags"><span className="tag tag--created">Créé hors Figma</span></div>}
            <p className="panel-note">{note.note}</p>
          </>
        ) : (
          <p className="panel-note panel-note--muted">Étape inchangée de l’application.</p>
        )}
      </section>

      {JOURNEYS.map(j => (
        <section key={j.title}>
          <p className="panel-label">{j.title}</p>
          <p className="panel-sub">{j.subtitle}</p>
          {j.entries.map(e => (
            <button key={e.route} className="entry" onClick={() => onStart(e.route)}>
              <span>{e.label}</span>
            </button>
          ))}
        </section>
      ))}

      <section>
        <p className="panel-label">État de la démo</p>
        <label className="toggle">
          <input type="checkbox" checked={!!s.photo} onChange={e => set({ photo: e.target.checked ? DEFAULT_PHOTO : null })} />
          Photo de profil acceptée
        </label>
        <label className="toggle">
          <input type="checkbox" checked={s.identity === 'verified'} onChange={e => set({ identity: e.target.checked ? 'verified' : 'none' })} />
          Identité vérifiée
        </label>
        <label className="toggle">
          <input type="checkbox" checked={s.boostSeen} onChange={e => set({ boostSeen: e.target.checked })} />
          Message de boost déjà vu
        </label>
        <label className="select">
          Vérification photo
          <select value={s.photoCheck} onChange={e => set({ photoCheck: e.target.value as PhotoCheckMode, photoAttempts: 0 })}>
            <option value="reject-first">1re photo refusée, puis acceptée (profil)</option>
            <option value="accepted">Toujours acceptée</option>
            <option value="timeout">Trop longue (délai de 15 s)</option>
          </select>
        </label>
        <button className="reset" onClick={onReset}>Réinitialiser la démo</button>
      </section>
    </aside>
  )
}
