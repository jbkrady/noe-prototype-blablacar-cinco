import type { ReactNode } from 'react'
import type { Route } from '../state/router'
import { DatePicker, PlacePicker } from '../screens/shared'
import { DriverProfile, Home, Results } from '../screens/passenger'
import {
  Boost, PublishDescription, PublishInstant, PublishInsurance, PublishMap, PublishPrice, PublishReminder, PublishReturn,
  PublishRoute, PublishSeats, PublishStops, PublishStopsDetail, PublishTime, PublishZen,
} from '../screens/publish'
import { IdCheck, IdIntro, PhotoCheck, PhotoIntro, PhotoRejected, Profile } from '../screens/profile'
import { Messages, Trips } from '../screens/trips'

type P = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

export const ROUTES: Record<string, { title: string; render: (p: P) => ReactNode }> = {
  home: { title: 'Accueil — recherche', render: () => <Home /> },
  'search-from': { title: 'Recherche — départ', render: () => <PlacePicker target="search-from" /> },
  'search-to': { title: 'Recherche — arrivée', render: () => <PlacePicker target="search-to" /> },
  'search-date': { title: 'Recherche — date', render: () => <DatePicker mode="search" /> },
  'search-return': { title: 'Recherche — date de retour', render: () => <DatePicker mode="return" /> },
  results: { title: 'Résultats de recherche', render: () => <Results /> },
  driver: { title: 'Fiche conducteur', render: p => <DriverProfile id={p.id} /> },

  'publish-from': { title: 'Publier — adresse de départ', render: () => <PlacePicker target="publish-from" /> },
  'publish-map': { title: 'Publier — point de rendez-vous', render: () => <PublishMap /> },
  'publish-to': { title: 'Publier — destination', render: () => <PlacePicker target="publish-to" /> },
  'publish-route': { title: 'Publier — itinéraire', render: () => <PublishRoute /> },
  'publish-stops': { title: 'Publier — étapes', render: () => <PublishStops /> },
  'publish-stops-detail': { title: 'Publier — points d’arrêt', render: () => <PublishStopsDetail /> },
  'publish-date': { title: 'Publier — dates', render: () => <DatePicker mode="publish" /> },
  'publish-time': { title: 'Publier — heure', render: () => <PublishTime /> },
  'publish-seats': { title: 'Publier — passagers', render: () => <PublishSeats /> },
  'publish-instant': { title: 'Publier — réservation instantanée', render: () => <PublishInstant /> },
  'publish-price': { title: 'Publier — prix', render: () => <PublishPrice /> },
  'publish-zen': { title: 'Publier — Zen', render: () => <PublishZen /> },
  'publish-return': { title: 'Publier — trajet retour', render: () => <PublishReturn /> },
  'publish-return-date': { title: 'Publier — date du retour', render: () => <DatePicker mode="publish-return" /> },
  'publish-reminder': { title: 'Publier — rappel de profil', render: () => <PublishReminder /> },
  'publish-insurance': { title: 'Publier — assurance', render: () => <PublishInsurance /> },
  'publish-description': { title: 'Description du trajet', render: p => <PublishDescription tripId={p.tripId} /> },
  boost: { title: 'Boost de visibilité', render: p => <Boost tripId={p.tripId} /> },

  trips: { title: 'Vos trajets', render: () => <Trips /> },
  messages: { title: 'Messages', render: () => <Messages /> },
  profile: { title: 'Profil', render: () => <Profile /> },
  'photo-intro': { title: 'Photo — consignes', render: p => <PhotoIntro origin={p.origin} /> },
  'photo-check': { title: 'Photo — vérification', render: p => <PhotoCheck origin={p.origin} photo={p.photo} /> },
  'photo-rejected': { title: 'Photo — refusée', render: p => <PhotoRejected origin={p.origin} photo={p.photo} /> },
  'id-intro': { title: 'Identité — choix du document', render: p => <IdIntro origin={p.origin} /> },
  'id-check': { title: 'Identité — vérification', render: p => <IdCheck origin={p.origin} /> },
}

export const renderRoute = (r: Route) => ROUTES[r.name]?.render(r.params ?? {}) ?? null
