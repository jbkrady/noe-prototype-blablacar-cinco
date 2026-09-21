// Panneau de présentation : ce que montre l'écran affiché.

export const NOTES: Record<string, { note: string; created?: boolean }> = {
  profile: { note: 'Une seule action à la fois, et la jauge avance à chaque étape.' },
  'photo-intro': { note: 'Refusée puis acceptée dans le profil, acceptée directement en publication.' },
  'photo-check': { note: 'Vérification en quelques secondes, sans quitter l’application.' },
  'photo-rejected': { note: 'Refus affiché dans l’application, avec les règles pour réessayer.' },
  'id-intro': { note: 'Écran créé : pas de maquette Figma pour l’identité.', created: true },
  'id-check': { note: 'Vérification simulée, validée en quelques secondes.', created: true },
  'publish-reminder': { note: 'Tout ce qui manque au profil, sans bloquer la publication.' },
  'publish-description': { note: 'L’exemple s’efface au toucher, le message dessous reste affiché.' },
  boost: { note: 'Affiché une seule fois, quand photo et identité sont validées.', created: true },
  trips: { note: 'Départ dans moins de 24 h sans passager : le trajet est signalé en orange.' },
  results: { note: 'Encart réservé aux nouveaux conducteurs vérifiés, sans trajet passager.' },
  driver: { note: 'Badge selon le profil : Nouveau, trajets passager ou Super Driver.' },
}

export const JOURNEYS = [
  {
    title: 'Parcours conducteur',
    subtitle: 'Coralie, conductrice débutante au profil incomplet',
    entries: [
      { label: 'Compléter mon profil', route: 'profile' },
      { label: 'Publier un trajet', route: 'publish-from' },
      { label: 'Vos trajets', route: 'trips' },
    ],
  },
  {
    title: 'Parcours passager',
    subtitle: 'Un passager cherche un covoiturage',
    entries: [{ label: 'Rechercher un trajet', route: 'home' }],
  },
]
