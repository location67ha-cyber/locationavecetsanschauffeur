import { Vehicule, TypeLocation, Option24H, CalculResult } from '@/types'
import { validerCreneau } from './calcul-horaire'

const SUPPLEMENT_24H_GLOBAL = 30000

export function calculerPrix(params: {
  vehicule: Vehicule
  duree: number
  typeDemande: TypeLocation
  heureDebut: string
  heureFin: string
  option24h?: Option24H
  avecChauffeur: boolean
  remise?: number
}): CalculResult {
  const { vehicule, duree, typeDemande, heureDebut, heureFin, option24h, avecChauffeur, remise = 0 } = params

  const creneau = validerCreneau(typeDemande, heureDebut, heureFin, option24h)
  const typeApplique = creneau.typeApplique
  const suppl24h = vehicule.supplement_24h ?? SUPPLEMENT_24H_GLOBAL

  // Vérification option chauffeur
  if (avecChauffeur) {
    const prixChauf = {
      JOUR: vehicule.prix_chauffeur_jour,
      NUIT: vehicule.prix_chauffeur_nuit,
      '24H': vehicule.prix_chauffeur_24h,
    }
    if (prixChauf[typeApplique] === null) {
      return {
        typeDemande, typeApplique, upgrade24h: false,
        motifUpgrade: null, avertissement: null, depassement: false,
        prixBase: 0, supplementApplique: 0, remise: 0, total: 0,
        detail: '', erreur: `Option avec chauffeur (${typeApplique}) indisponible pour ce véhicule`
      }
    }
  }

  let prixBase = 0
  let supplementApplique = 0
  let detail = ''

  if (duree === 1) {
    if (!avecChauffeur) {
      if (typeApplique === 'JOUR') {
        prixBase = vehicule.prix_normal
        detail = `JOUR 12H × 1 jour`
      } else if (typeApplique === 'NUIT') {
        prixBase = vehicule.prix_normal
        detail = `NUIT 12H × 1 nuit`
      } else {
        prixBase = vehicule.prix_normal
        supplementApplique = suppl24h
        prixBase = vehicule.prix_normal + suppl24h
        detail = creneau.upgrade24h
          ? `Upgrade 24H (${creneau.motifUpgrade}) = ${vehicule.prix_normal} + ${suppl24h}`
          : `24H = ${vehicule.prix_normal} + ${suppl24h} (supplément)`
      }
    } else {
      const prixMap: Record<TypeLocation, number | null> = {
        JOUR: vehicule.prix_chauffeur_jour,
        NUIT: vehicule.prix_chauffeur_nuit,
        '24H': vehicule.prix_chauffeur_24h,
      }
      prixBase = prixMap[typeApplique] ?? 0
      detail = `Avec chauffeur ${typeApplique} × 1`
    }
  } else if (duree === 2) {
    if (!avecChauffeur) {
      const prix24h = vehicule.prix_normal + suppl24h
      prixBase = prix24h * 2
      detail = `2 jours → Prix 24H (${prix24h}) × 2`
    } else {
      const p = vehicule.prix_chauffeur_24h ?? 0
      prixBase = p * 2
      detail = `2 jours avec chauffeur → Prix 24H (${p}) × 2`
    }
  } else if (duree >= 3) {
    if (!avecChauffeur) {
      const gain = vehicule.gain_12h ?? 0
      prixBase = gain * duree
      detail = `${duree} jours → Gain 12H (${gain}) × ${duree}`
    } else {
      const p = vehicule.prix_chauffeur_12h ?? 0
      prixBase = p * duree
      detail = `${duree} jours avec chauffeur → Prix 12H (${p}) × ${duree}`
    }
  }

  const total = Math.max(0, prixBase - remise)

  return {
    typeDemande,
    typeApplique,
    upgrade24h: creneau.upgrade24h,
    motifUpgrade: creneau.motifUpgrade,
    avertissement: creneau.avertissement,
    depassement: creneau.depassement,
    prixBase,
    supplementApplique,
    remise,
    total,
    detail
  }
}
