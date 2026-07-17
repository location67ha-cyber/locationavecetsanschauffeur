'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format, getDaysInMonth, startOfMonth, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function AdminPlanningPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [maintenances, setMaintenances] = useState<any[]>([])
  const [vehicules, setVehicules] = useState<any[]>([])
  const [mois, setMois] = useState(new Date().getMonth() + 1)
  const [annee, setAnnee] = useState(new Date().getFullYear())

  useEffect(() => { charger() }, [mois, annee])

  async function charger() {
    const debut = `${annee}-${String(mois).padStart(2, '0')}-01`
    const fin = `${annee}-${String(mois).padStart(2, '0')}-${getDaysInMonth(new Date(annee, mois - 1))}`

    const [{ data: resa }, { data: maint }, { data: veh }] = await Promise.all([
      supabase.from('reservations').select('*, vehicules(nom)')
        .gte('date_debut', debut).lte('date_fin', fin)
        .neq('statut_resa', 'ANNULÉE'),
      supabase.from('maintenances').select('*, vehicules(nom)')
        .gte('date_debut', debut).lte('date_fin', fin),
      supabase.from('vehicules').select('*').eq('actif', true).order('nom'),
    ])

    setReservations(resa || [])
    setMaintenances(maint || [])
    setVehicules(veh || [])
  }

  const nbJours = getDaysInMonth(new Date(annee, mois - 1))
  const jours = Array.from({ length: nbJours }, (_, i) => i + 1)

  function getStatutCellule(vehiculeId: number, jour: number, type: 'JOUR' | 'NUIT') {
    const dateStr = `${annee}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`

    // Vérifier maintenance
    const enMaintenance = maintenances.some(m =>
      m.vehicule_id === vehiculeId &&
      dateStr >= m.date_debut && dateStr <= m.date_fin
    )
    if (enMaintenance) return 'MAINTENANCE'

    // Vérifier réservations
    const resasDuJour = reservations.filter(r =>
      r.vehicule_id === vehiculeId &&
      dateStr >= r.date_debut && dateStr <= r.date_fin
    )

    for (const r of resasDuJour) {
      const typeApplique = r.type_applique
      const concerne = typeApplique === '24H' ||
        (typeApplique === 'JOUR' && type === 'JOUR') ||
        (typeApplique === 'NUIT' && type === 'NUIT')

      if (!concerne) continue

      if (r.statut_resa === 'EN_ATTENTE' && r.montant_paye === 0) return 'PRE_RESERVE'
      if (r.statut_resa === 'EN_ATTENTE' && r.montant_paye > 0) return 'EN_ATTENTE'
      if (r.statut_resa === 'VALIDÉE' && r.montant_paye > 0) return 'RESERVE'
      if (r.statut_resa === 'VALIDÉE' && r.montant_paye === 0) return 'PRE_RESERVE'
    }

    return 'LIBRE'
  }

  function couleurCellule(statut: string) {
    switch (statut) {
      case 'LIBRE':       return 'bg-green-100 text-green-800'
      case 'PRE_RESERVE': return 'bg-yellow-100 text-yellow-800'
      case 'EN_ATTENTE':  return 'bg-blue-100 text-blue-800'
      case 'RESERVE':     return 'bg-red-100 text-red-800'
      case 'MAINTENANCE': return 'bg-orange-100 text-orange-800'
      default:            return 'bg-gray-100'
    }
  }

  function emojiStatut(statut: string) {
    switch (statut) {
      case 'LIBRE':       return '🟢'
      case 'PRE_RESERVE': return '🟡'
      case 'EN_ATTENTE':  return '🔵'
      case 'RESERVE':     return '🔴'
      case 'MAINTENANCE': return '🟠'
      default:            return '⚪'
    }
  }

  const moisNoms = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc']

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📅 Planning des disponibilités</h1>

      {/* Contrôles */}
      <div className="flex gap-4 mb-6 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => { if (mois === 1) { setMois(12); setAnnee(a => a - 1) } else setMois(m => m - 1) }}
            className="btn-secondary px-3 py-2">←</button>
          <span className="font-bold text-lg min-w-32 text-center">
            {moisNoms[mois - 1]} {annee}
          </span>
          <button onClick={() => { if (mois === 12) { setMois(1); setAnnee(a => a + 1) } else setMois(m => m + 1) }}
            className="btn-secondary
