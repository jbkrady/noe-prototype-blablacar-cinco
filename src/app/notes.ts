// Panneau de présentation : ce que montre l'écran affiché.

export const NOTES: Record<string, { note: string }> = {
  profile: { note: 'Une seule action à la fois, et la jauge avance à chaque étape.' },
  'photo-intro': { note: 'Refusée puis acceptée dans le profil, acceptée directement en publication.' },
  'photo-check': { note: 'Vérification en quelques secondes, sans quitter l’application.' },
  'photo-rejected': { note: 'Refus affiché dans l’application, avec les règles pour réessayer.' },
  'id-intro': { note: 'Choix de la pièce d’identité à vérifier.' },
  'id-check': { note: 'Vérification de la pièce en quelques secondes.' },
  'publish-reminder': { note: 'Tout ce qui manque au profil, sans bloquer la publication.' },
  'publish-description': { note: 'L’exemple s’efface au toucher, le message dessous reste affiché.' },
  boost: { note: 'Affiché une seule fois, quand photo et identité sont validées.' },
  trips: { note: 'Départ dans moins de 24 h sans passager : le trajet est signalé en orange.' },
  results: { note: 'Encart réservé aux nouveaux conducteurs vérifiés, sans trajet passager.' },
  driver: { note: 'Badge selon le profil : Nouveau, Super Passager ou Super Driver.' },
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
