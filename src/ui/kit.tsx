import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronRight, CircleMinus, CirclePlus } from 'lucide-react'
import { useRouter } from '../state/router'
import { useStore } from '../state/store'
import './kit.css'

/** Écran : en-tête facultatif, contenu qui défile, pied fixe facultatif */
export function Screen({ header, footer, children, className = '', tone }: {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  tone?: 'surface'
}) {
  return (
    <div className={`scr${tone ? ` scr--${tone}` : ''}`}>
      {header}
      <div className={`scr-body ${className}`}>{children}</div>
      {footer && <div className="scr-foot">{footer}</div>}
    </div>
  )
}

export function BackBar({ onBack, right }: { onBack?: () => void; right?: ReactNode }) {
  const router = useRouter()
  return (
    <div className="backbar">
      <button className="icon-btn" aria-label="Retour" onClick={onBack ?? router.back}>
        <ArrowLeft size={24} strokeWidth={2.2} />
      </button>
      {right}
    </div>
  )
}

export const Title = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <h1 className={`title ${className}`}>{children}</h1>
)

export function Fab({ onClick, disabled, label = 'Continuer' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button className="fab" onClick={onClick} disabled={disabled} aria-label={label}>
      <ArrowRight size={24} strokeWidth={2.4} />
    </button>
  )
}

export function Button({ children, onClick, variant = 'primary', disabled, full = true, type = 'button' }: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  full?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <button type={type} className={`btn btn--${variant}${full ? ' btn--full' : ''}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function Row({ title, sub, icon, onClick, link, chevron = true, right, strong }: {
  title: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  onClick?: () => void
  link?: boolean
  chevron?: boolean
  right?: ReactNode
  strong?: boolean
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={`row${link ? ' row--link' : ''}${strong ? ' row--strong' : ''}`} onClick={onClick}>
      {icon && <span className="row-icon">{icon}</span>}
      <span className="row-text">
        <span className="row-title">{title}</span>
        {sub && <span className="row-sub">{sub}</span>}
      </span>
      {right}
      {chevron && onClick && <ChevronRight className="row-chev" size={22} />}
    </Tag>
  )
}

export function Checkbox({ checked, onChange, label, sub, icon }: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  sub?: ReactNode
  icon?: ReactNode
}) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="check-box" aria-hidden>{checked && <Check size={16} strokeWidth={3.2} />}</span>
      <span className="row-text">
        <span className="check-label">{label}</span>
        {sub && <span className="row-sub">{sub}</span>}
      </span>
      {icon && <span className="check-icon">{icon}</span>}
    </label>
  )
}

export function Radio({ checked, onChange, label, sub }: {
  checked: boolean
  onChange: () => void
  label: ReactNode
  sub?: ReactNode
}) {
  return (
    <label className="radio">
      <input type="radio" checked={checked} onChange={onChange} />
      <span className="radio-dot" aria-hidden />
      <span className="row-text">
        <span className="check-label">{label}</span>
        {sub && <span className="row-sub">{sub}</span>}
      </span>
    </label>
  )
}

export function Stepper({ value, onChange, min, max, render, className = '' }: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  render?: (v: number) => ReactNode
  className?: string
}) {
  return (
    <div className={`stepper ${className}`}>
      <button className="stepper-btn" aria-label="Diminuer" disabled={value <= min} onClick={() => onChange(value - 1)}>
        <CircleMinus size={38} strokeWidth={1.6} />
      </button>
      <span className="stepper-value">{render ? render(value) : value}</span>
      <button className="stepper-btn" aria-label="Augmenter" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <CirclePlus size={38} strokeWidth={1.6} />
      </button>
    </div>
  )
}

export const Divider = ({ thick }: { thick?: boolean }) => <hr className={thick ? 'divider divider--thick' : 'divider'} />

export function Dialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="dialog-scrim" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function Sheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="dialog-scrim dialog-scrim--sheet" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal onClick={e => e.stopPropagation()}>
        <span className="sheet-grip" />
        {children}
      </div>
    </div>
  )
}

export type Tab = 'search' | 'publish' | 'trips' | 'messages' | 'profile'

export const TAB_ROOTS: Record<Tab, string> = {
  search: 'home',
  publish: 'publish-from',
  trips: 'trips',
  messages: 'messages',
  profile: 'profile',
}

// Icônes de la Navbar Figma, extraites de la maquette (masques recolorés : gris inactif, bleu actif)
import searchMask from '../assets/tabmask/search.png'
import publishMask from '../assets/tabmask/publish.png'
import tripsMask from '../assets/tabmask/trips.png'
import messagesMask from '../assets/tabmask/messages.png'
import profileMask from '../assets/tabmask/profile.png'

const TABS: { key: Tab; label: string; mask: string }[] = [
  { key: 'search', label: 'Rechercher', mask: searchMask },
  { key: 'publish', label: 'Publier', mask: publishMask },
  { key: 'trips', label: 'Vos trajets', mask: tripsMask },
  { key: 'messages', label: 'Messages', mask: messagesMask },
  { key: 'profile', label: 'Profil', mask: profileMask },
]

export function TabBar({ active }: { active: Tab }) {
  const router = useRouter()
  const { resetProfile } = useStore()
  return (
    <nav className="tabbar">
      {TABS.map(t => (
        <button
          key={t.key}
          className={`tab${t.key === active ? ' tab--on' : ''}`}
          onClick={() => {
            // parcours étanches : quitter un parcours remet le profil à zéro (l'onglet déjà actif ne change rien)
            if (t.key !== active) resetProfile(t.key === 'trips')
            router.resetTo(TAB_ROOTS[t.key])
          }}
          aria-current={t.key === active ? 'page' : undefined}
        >
          <span className="tab-icon" style={{ WebkitMaskImage: `url(${t.mask})`, maskImage: `url(${t.mask})` }} aria-hidden />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

export function Avatar({ src, size = 40, verified, letter }: { src?: string | null; size?: number; verified?: boolean; letter?: string }) {
  return (
    <span className="avatar" style={{ width: size, height: size }}>
      {src ? <img src={src} alt="" /> : <span className="avatar-letter" style={{ fontSize: size * 0.4 }}>{letter}</span>}
      {verified && (
        <span className="avatar-check" style={{ width: size * 0.34, height: size * 0.34 }}>
          <Check size={size * 0.22} strokeWidth={3.5} />
        </span>
      )}
    </span>
  )
}

export const CheckDot = ({ size = 22 }: { size?: number }) => (
  <span className="checkdot" style={{ width: size, height: size }}>
    <Check size={size * 0.62} strokeWidth={3.4} />
  </span>
)
