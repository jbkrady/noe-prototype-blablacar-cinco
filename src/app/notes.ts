// Panneau de présentation : ce que montre l'écran affiché.

export const NOTES: Record<string, { note: string; created?: boolean }> = {
  profile: { note: 'Une seule action à la fois (la prochaine étape) et la jauge orange. L’encart disparaît quand photo et identité sont faites.' },
  'photo-intro': { note: 'Les deux boutons lancent directement la vérification. 1re photo avec lunettes de soleil (refusée), puis photo conforme (acceptée) — réglable dans le panneau.' },
  'photo-check': { note: 'Vérification synchrone dans le parcours (plus d’email). Délai maximal : 15 s, activable dans le panneau.' },
  'photo-rejected': { note: 'Refus in-app : rappel des règles et les 2 actions pour réessayer.' },
  'id-intro': { note: 'Écran créé : aucune maquette Figma pour la vérification d’identité.', created: true },
  'id-check': { note: 'Écran créé : vérification simulée (2,5 s).', created: true },
  'publish-reminder': { note: 'Tous les éléments manquants avec leur durée. « Continuer » n’est pas bloquant. Étape absente si le profil est complet.' },
  'publish-description': { note: 'Le placeholder (3 questions) s’efface dès le clic. Le message sous le champ reste toujours affiché.' },
  boost: { note: 'Écran créé. Affiché une seule fois, à la 1re publication avec photo ET identité vérifiée.', created: true },
  trips: { note: 'Trajet dans moins de 24 h, sans passager, profil incomplet : bandeau, contour orange et critères cliquables.' },
  results: { note: 'Encart : uniquement les vrais nouveaux (0 trajet passager) avec photo, identité et numéro vérifiés — Feroze, Yamina. Nicolas (13) et Inès (4), newbies ayant voyagé comme passagers, restent dans la liste avec leur badge.' },
  driver: { note: 'Nouveau sans historique : « ★ Nouveau ». Newbie ayant voyagé : « N Trajets Passager ». Expérimenté : « Super Driver ».' },
}

export const JOURNEYS = [
  {
    title: 'Parcours conducteur',
    subtitle: 'Coralie, débutante, profil incomplet',
    entries: [
      { label: 'Compléter mon profil', route: 'profile' },
      { label: 'Publier un trajet', route: 'publish-from' },
      { label: 'Vos trajets', route: 'trips' },
    ],
  },
  {
    title: 'Parcours passager',
    subtitle: 'Recherche de covoiturage',
    entries: [{ label: 'Rechercher un trajet', route: 'home' }],
  },
]
