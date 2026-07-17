export interface Vehicule {
  id: number
  nom: string
  description: string | null
  image_url: string | null
  prix_normal: number
  cout_normal: number | null
  gain_12h: number | null
  supplement_24h: number | null
  prix_chauffeur_jour: number | null
  prix_chauffeur_nuit: number | null
  prix_chauffeur_24h: number | null
  prix_chauffeur_12h: number | null
  actif: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: number
  nom: string
  prenom: string | null
  contact: string | null
  email: string | null
  adresse: string | null
  cin_permis: string | null
  created_at: string
}

export interface Reservation {
  id: string
  client_id: number
  vehicule_id: number
  depart: string
  destination: string
  date_debut: string
  date_fin: string
  duree: number
  heure_debut: string | null
  heure_fin: string | null
  option_24h: 'MATIN' | 'SOIR' | null
  type_demande: 'JOUR' | 'NUIT' | '24H'
  type_applique: 'JOUR' | 'NUIT' | '24H'
  avec_chauffeur: boolean
  upgrade_24h: boolean
  motif_upgrade: string | null
  depassement: boolean
  prix_base: number
  supplement_applique: number
  remise: number
  total_a_payer: number
  montant_paye: number
  reste: number
  statut_paiement: 'PAYÉ' | 'NON PAYÉ'
  statut_calendrier: 'DISPONIBLE' | 'PRE_RESERVE' | 'RESERVE' | 'EN_ATTENTE' | 'MAINTENANCE'
  statut_resa: 'EN_ATTENTE' | 'VALIDÉE' | 'ANNULÉE'
  cond_carburant: boolean
  cond_repas_chauffeur: boolean
  cond_hebergement_chauf: boolean
  conditions_acceptees: boolean
  whatsapp_envoye: boolean
  email_envoye: boolean
  notes: string | null
  created_at: string
  updated_at: string
  clients?: Client
  vehicules?: Vehicule
}

export interface Maintenance {
  id: number
  vehicule_id: number
  date_debut: string
  date_fin: string
  description: string | null
  cout: number
  statut: string
  created_at: string
  vehicules?: Vehicule
}

export type TypeLocation = 'JOUR' | 'NUIT' | '24H'
export type Option24H = 'MATIN' | 'SOIR'

export interface CalculResult {
  typeDemande: TypeLocation
  typeApplique: TypeLocation
  upgrade24h: boolean
  motifUpgrade: string | null
  avertissement: string | null
  depassement: boolean
  prixBase: number
  supplementApplique: number
  remise: number
  total: number
  detail: string
  erreur?: string
}
