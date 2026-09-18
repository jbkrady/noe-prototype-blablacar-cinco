import { useEffect, useState } from 'react'
import { Car, ChevronRight, CircleAlert, CirclePlus, Hourglass, Pencil, UserRound } from 'lucide-react'
import { useRouter } from '../state/router'
import { DEFAULT_PHOTO, isComplete, profileSteps, useStore, type PhotoCheckMode, type Pref, type Vehicle } from '../state/store'
import photoLunettes from '../assets/photo-lunettes.png'
import { Avatar, BackBar, Button, CheckDot, Checkbox, Radio, Row, Screen, TabBar, Title } from '../ui/kit'
import './profile.css'

export function Profile() {
  const router = useRouter()
  const { s } = useStore()
  const [tab, setTab] = useState<'about' | 'account'>('about')
  const steps = profileSteps(s)
  const done = steps.filter(x => x.done).length
  const photoFlow = () => router.push('photo-intro', { origin: 'profile' })
  const idFlow = () => router.push('id-intro', { origin: 'profile' })
  const soon = () => {}

  return (
    <Screen
      header={
        <div className="ptabs" role="tablist">
          <button role="tab" aria-selected={tab === 'about'} className={tab === 'about' ? 'on' : ''} onClick={() => setTab('about')}>À propos de vous</button>
          <button role="tab" aria-selected={tab === 'account'} className={tab === 'account' ? 'on' : ''} onClick={() => setTab('account')}>Compte</button>
        </div>
      }
      footer={<TabBar active="profile" />}
    >
      {tab === 'account' ? (
        <div className="list">
          {['Avis', 'Notifications, e-mails et SMS', 'Mot de passe', 'Adresse postale', 'Moyens de paiement', 'Aide', 'Conditions générales', 'Se déconnecter'].map(l => (
            <Row key={l} title={l} onClick={soon} />
          ))}
        </div>
      ) : (
        <>
          <button className="me" onClick={photoFlow}>
            <span className="me-avatar">
              {s.photo ? <Avatar src={s.photo} size={56} /> : <span className="me-ph"><UserRound size={34} /></span>}
              <span className="me-pen"><Pencil size={11} /></span>
            </span>
            <span className="me-id"><b>{s.firstName}</b><small>Débutante</small></span>
            <ChevronRight size={22} className="muted" />
          </button>

          {s.photo && !isComplete(s) && (
            <div className="online-banner"><CheckDot size={20} /> Votre photo est en ligne</div>
          )}

          {/* A1 — encart « État du profil » : une seule action, la prochaine étape ; disparaît si profil complet */}
          {!isComplete(s) && (
            <section className="state-card">
              <h2>Etat du profil</h2>
              <p>Un profil complété inspire confiance et encourage les membres à voyager avec vous.</p>
              <p className="state-count">{done} étapes sur 6 complétées</p>
              <div className="gauge" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={6}>
                {steps.map((_, i) => <span key={i} className={i < done ? 'on' : ''} />)}
              </div>
              <p className="state-next">Prochaine étape</p>
              {!s.photo ? (
                <Button onClick={photoFlow}>Ajouter une photo</Button>
              ) : (
                <Button onClick={idFlow}>Vérifier une pièce d’identité</Button>
              )}
            </section>
          )}

          <IdentitySection onVerify={idFlow} />
          <AboutSection />
          <VehicleSection />
        </>
      )}
    </Screen>
  )
}

// ── Sections du profil modifiables sur place (crayon) ────────

function SectionHead({ title, editing, onEdit }: { title: string; editing: boolean; onEdit: () => void }) {
  return (
    <h3>
      {title}
      {!editing && (
        <button className="pen" aria-label={`Modifier : ${title}`} onClick={onEdit}><Pencil size={15} /></button>
      )}
    </h3>
  )
}

function EditActions({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <div className="edit-actions">
      <Button variant="secondary" onClick={onCancel}>Annuler</Button>
      <Button onClick={onSave}>Enregistrer</Button>
    </div>
  )
}

function IdentitySection({ onVerify }: { onVerify: () => void }) {
  const { s, set } = useStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ firstName: s.firstName, lastName: s.lastName, birthDate: s.birthDate, email: s.email, phone: s.phone })
  const open = () => { setForm({ firstName: s.firstName, lastName: s.lastName, birthDate: s.birthDate, email: s.email, phone: s.phone }); setEditing(true) }
  const field = (k: keyof typeof form) => ({ value: form[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }) })
  const save = () => {
    // un champ vidé garde sa valeur précédente
    const clean = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() || s[k as keyof typeof form]]))
    set(clean)
    setEditing(false)
  }
  return (
    <section className={`psec${editing ? ' psec--edit' : ''}`}>
      <SectionHead title="Votre identité" editing={editing} onEdit={open} />
      {editing ? (
        <>
          <div className="field-row">
            <label className="field"><span>Prénom</span><input autoComplete="given-name" {...field('firstName')} /></label>
            <label className="field"><span>Nom</span><input autoComplete="family-name" {...field('lastName')} /></label>
          </div>
          <label className="field"><span>Date de naissance</span><input type="date" max={new Date().toISOString().slice(0, 10)} {...field('birthDate')} /></label>
          <label className="field"><span>Adresse e-mail</span><input type="email" {...field('email')} /></label>
          <label className="field"><span>Numéro de téléphone</span><input type="tel" {...field('phone')} /></label>
          <EditActions onCancel={() => setEditing(false)} onSave={save} />
        </>
      ) : (
        <>
          <p className="pitem pitem--text">{s.firstName} {s.lastName}</p>
          <p className="pitem pitem--text">Née le {new Date(s.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          {s.identity === 'verified' ? (
            <p className="pitem"><CheckDot size={20} /> Pièce d’identité vérifiée</p>
          ) : (
            <button className="pitem pitem--link" onClick={onVerify}><CirclePlus size={22} /> Vérifier une pièce d’identité</button>
          )}
          <p className="pitem"><CheckDot size={20} /> {s.email}</p>
          <p className="pitem"><CheckDot size={20} /> {s.phone}</p>
        </>
      )}
    </section>
  )
}

const PREF_LABELS: Record<Pref, string> = {
  chat: 'J’aime bien discuter',
  music: 'Musique tout le long !',
  pets: 'Les animaux sont les bienvenus',
  nosmoke: 'Pas de cigarette, svp',
}

function AboutSection() {
  const { s, set } = useStore()
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(s.minibio)
  const [prefs, setPrefs] = useState<Pref[]>(s.prefs)
  const open = () => { setBio(s.minibio); setPrefs(s.prefs); setEditing(true) }
  return (
    <section className={`psec${editing ? ' psec--edit' : ''}`}>
      <SectionHead title="À propos de vous" editing={editing} onEdit={open} />
      {editing ? (
        <>
          <label className="field">
            <span>Minibio</span>
            <textarea rows={3} maxLength={300} value={bio} placeholder="Ex. : Graphiste, je fais Paris–Capbreton pour aller surfer le week-end." onChange={e => setBio(e.target.value)} />
          </label>
          <p className="field-label">Préférences de voyage</p>
          <div className="list">
            {(Object.keys(PREF_LABELS) as Pref[]).map(k => (
              <Checkbox key={k} checked={prefs.includes(k)} onChange={v => setPrefs(v ? [...prefs, k] : prefs.filter(x => x !== k))} label={PREF_LABELS[k]} />
            ))}
          </div>
          <EditActions onCancel={() => setEditing(false)} onSave={() => { set({ minibio: bio.trim(), prefs }); setEditing(false) }} />
        </>
      ) : (
        <>
          {s.minibio
            ? <p className="pitem pitem--text">{s.minibio}</p>
            : <button className="pitem pitem--link" onClick={open}><CirclePlus size={22} /> Ajouter une minibio</button>}
          {s.prefs.length
            ? s.prefs.map(k => <p key={k} className="pitem"><CheckDot size={20} /> {PREF_LABELS[k]}</p>)
            : <button className="pitem pitem--link" onClick={open}><CirclePlus size={22} /> Créer des préférences de voyage</button>}
        </>
      )}
    </section>
  )
}

const COLORS = ['Blanc', 'Noir', 'Gris', 'Bleu', 'Rouge', 'Vert']

function VehicleSection() {
  const { s, set } = useStore()
  const [editing, setEditing] = useState(false)
  const [v, setV] = useState<Vehicle>(s.vehicle ?? { brand: '', model: '', color: 'Gris' })
  const open = () => { setV(s.vehicle ?? { brand: '', model: '', color: 'Gris' }); setEditing(true) }
  return (
    <section className={`psec${editing ? ' psec--edit' : ''}`}>
      <SectionHead title="Véhicules" editing={editing} onEdit={open} />
      {editing ? (
        <>
          <label className="field"><span>Marque</span><input value={v.brand} placeholder="Ex. : Peugeot" onChange={e => setV({ ...v, brand: e.target.value })} /></label>
          <label className="field"><span>Modèle</span><input value={v.model} placeholder="Ex. : 208" onChange={e => setV({ ...v, model: e.target.value })} /></label>
          <label className="field">
            <span>Couleur</span>
            <select value={v.color} onChange={e => setV({ ...v, color: e.target.value })}>
              {COLORS.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <EditActions
            onCancel={() => setEditing(false)}
            onSave={() => { set({ vehicle: v.brand.trim() ? { ...v, brand: v.brand.trim(), model: v.model.trim() } : null }); setEditing(false) }}
          />
        </>
      ) : s.vehicle ? (
        <p className="pitem"><Car size={20} /> {s.vehicle.brand} {s.vehicle.model} · {s.vehicle.color}</p>
      ) : (
        <button className="pitem pitem--link" onClick={open}><CirclePlus size={22} /> Ajouter un véhicule</button>
      )}
    </section>
  )
}

// ── A3 : photo de profil vérifiée in-app ─────────────────────

type Origin = { origin: string }

/** Photo soumise selon le réglage de démo : 1re photo avec lunettes (refusée), puis photo conforme (maquettes Figma) */
const nextPhoto = (mode: PhotoCheckMode, attempts: number) =>
  mode === 'reject-first' && attempts === 0 ? photoLunettes : DEFAULT_PHOTO

/** Consignes + choix : les deux boutons enchaînent directement sur la vérification (workflow Figma) */
export function PhotoIntro({ origin }: Origin) {
  const router = useRouter()
  const { s } = useStore()
  const go = () => router.push('photo-check', { origin, photo: nextPhoto(s.photoCheck, s.photoAttempts) })
  return (
    <Screen header={<BackBar />}>
      <img className="photo-sample" src={DEFAULT_PHOTO} alt="Exemple de photo conforme" />
      <Title>Regardez bien droit devant vous, sans lunettes de soleil et sans personne à côté de vous.</Title>
      <div className="btn-zone photo-actions">
        <Button onClick={go}>Prendre une photo</Button>
        <Button variant="ghost" onClick={go}>Choisir une autre photo</Button>
      </div>
    </Screen>
  )
}

/** Vérification synchrone : 3 s, ou délai dépassé à 15 s (réglage de démo) */
export function PhotoCheck({ origin, photo }: Origin & { photo: string }) {
  const router = useRouter()
  const { s, set, showToast } = useStore()

  useEffect(() => {
    const slow = s.photoCheck === 'timeout'
    const t = setTimeout(() => {
      if (slow) {
        router.backTo(origin)
        showToast('L’action n’a pas pu aboutir. Réessayer plus tard')
        return
      }
      const rejected = s.photoCheck === 'reject-first' && s.photoAttempts === 0
      set(prev => ({ photoAttempts: prev.photoAttempts + 1, ...(rejected ? {} : { photo }) }))
      if (rejected) router.replace('photo-rejected', { origin, photo })
      else {
        router.backTo(origin)
        showToast('Votre photo est acceptée et en ligne')
      }
    }, slow ? 15000 : 3000)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Screen header={<BackBar />} footer={<div className="btn-zone"><Button variant="ghost" onClick={router.back}>Annuler</Button></div>}>
      <div className="check-body">
        <span className="check-photo">
          <img src={photo} alt="" />
          <span className="check-badge check-badge--wait"><Hourglass size={18} /></span>
        </span>
        <h1 className="check-title">On vérifie votre photo</h1>
        <p className="check-text">Ça prend quelques secondes. On s’assure que les membres pourront bien vous reconnaître.</p>
        <span className="check-progress" aria-hidden><span style={{ animationDuration: s.photoCheck === 'timeout' ? '15s' : '3s' }} /></span>
      </div>
    </Screen>
  )
}

/** Refus in-app (remplace l'email d'erreur) */
export function PhotoRejected({ origin, photo }: Origin & { photo: string }) {
  const router = useRouter()
  const { s } = useStore()
  const retry = () => router.replace('photo-check', { origin, photo: nextPhoto(s.photoCheck, s.photoAttempts) })
  return (
    <Screen header={<BackBar onBack={() => router.backTo(origin)} />}>
      <span className="check-photo check-photo--small">
        <img src={photo} alt="" />
        <span className="check-badge check-badge--ko"><CircleAlert size={20} /></span>
      </span>
      <Title>Cette photo n’a pas pu être acceptée</Title>
      <p className="lead">Les membres ont besoin de vous reconnaître avant de monter en voiture.</p>
      <div className="rules">
        <p>Rappel des règles</p>
        <ul>
          <li><CheckDot size={18} /> Visage bien visible, sans lunettes de soleil ni casquette</li>
          <li><CheckDot size={18} /> Regardez droit devant vous</li>
          <li><CheckDot size={18} /> Vous êtes seul·e sur la photo</li>
        </ul>
      </div>
      <div className="btn-zone photo-actions">
        <Button onClick={retry}>Prendre une photo</Button>
        <Button variant="ghost" onClick={retry}>Choisir une autre photo</Button>
        <button className="cgu">Voir les conditions générales</button>
      </div>
    </Screen>
  )
}

// ── Vérification d'identité (créée : aucune maquette Figma) ──

const DOCS = ['Carte d’identité', 'Passeport', 'Permis de conduire', 'Titre de séjour']

export function IdIntro({ origin }: Origin) {
  const router = useRouter()
  const [doc, setDoc] = useState(0)
  return (
    <Screen header={<BackBar />} footer={<div className="btn-zone"><Button onClick={() => router.push('id-check', { origin, doc: DOCS[doc] })}>Continuer</Button></div>}>
      <Title>Vérifiez votre pièce d’identité</Title>
      <p className="lead">Les passagers réservent plus vite avec un conducteur au profil vérifié. Environ 2 minutes.</p>
      <h2 className="section-title id-h">Quelle pièce avez-vous sous la main ?</h2>
      <div className="list">
        {DOCS.map((d, i) => <Radio key={d} checked={doc === i} onChange={() => setDoc(i)} label={d} />)}
      </div>
    </Screen>
  )
}

export function IdCheck({ origin }: Origin) {
  const router = useRouter()
  const { set } = useStore()
  useEffect(() => {
    const t = setTimeout(() => {
      set({ identity: 'verified' })
      router.backTo(origin)
    }, 2500)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Screen>
      <div className="check-body check-body--center">
        <span className="spinner" aria-hidden />
        <h1 className="check-title">On vérifie votre pièce d’identité</h1>
        <p className="check-text">Quelques instants…</p>
      </div>
    </Screen>
  )
}
