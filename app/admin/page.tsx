import { supabaseAdmin } from '@/lib/supabase'
import { TrendingUp, Car, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default async function AdminDashboard() {
  const [
    { data: reservations },
    { data: vehicules },
    { data: maintenances }
  ] = await Promise.all([
    supabaseAdmin.from('reservations').select('*, clients(*), vehicules(*)'),
    supabaseAdmin.from('vehicules').select('*').eq('actif', true),
    supabaseAdmin.from('maintenances').select('*, vehicules(*)').eq('statut', 'EN_COURS'),
  ])

  const stats = {
    total: reservations?.length || 0,
    ca: reservations?.reduce((s, r) => s + (r.total_a_payer || 0), 0) || 0,
    encaisse: reservations?.reduce((s, r) => s + (r.montant_paye || 0), 0) || 0,
    reste: reservations?.reduce((s, r) => s + (r.reste || 0), 0) || 0,
    enAttente: reservations?.filter(r => r.statut_resa === 'EN_ATTENTE').length || 0,
    nonPayees: reservations?.filter(r => r.statut_paiement === 'NON PAYÉ').length || 0,
  }

  const reservationsEnAttente = reservations?.filter(r => r.statut_resa === 'EN_ATTENTE') || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">📊 Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'CA Total', val: stats.ca.toLocaleString() + ' Ar', icon: <TrendingUp className="w-6 h-6 text-green-600" />, bg: 'bg-green-50' },
          { label: 'Encaissé', val: stats.encaisse.toLocaleString() + ' Ar', icon: <CheckCircle className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Reste', val: stats.reste.toLocaleString() + ' Ar', icon: <AlertCircle className="w-6 h-6 text-red-600" />, bg: 'bg-red-50' },
          { label: 'En attente', val: stats.enAttente + ' résa', icon: <Clock className="w-6 h-6 text-yellow-600" />, bg: 'bg-yellow-50' },
        ].map((k, i) => (
          <div key={i} className={`card ${k.bg}`}>
            <div className="flex items-center justify-between mb-2">
              {k.icon}
              <span className="text-xs text-gray-500">{k.label}</span>
            </div>
            <div className="text-xl font-bold text-gray-800">{k.val}</div>
          </div>
        ))}
      </div>

      {/* Réservations en attente */}
      {reservationsEnAttente.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            ⚠️ Réservations en attente de validation ({reservationsEnAttente.length})
          </h2>
          <div className="space-y-3">
            {reservationsEnAttente.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <div className="font-bold text-sm">{r.id} — {r.clients?.nom} {r.clients?.prenom}</div>
                  <div className="text-xs text-gray-600">{r.vehicules?.nom} | {r.date_debut} → {r.date_fin}</div>
                  <div className="text-xs text-gray-500">{r.depart} → {r.destination}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-700 text-sm">{r.total_a_payer?.toLocaleString()} Ar</div>
                  <div className={`text-xs font-bold ${r.montant_paye > 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                    {r.montant_paye > 0 ? '🔵 Acompte versé' : '🟡 Sans acompte'}
                  </div>
                  <a href="/admin/reservations" className="text-xs text-green-700 underline">Valider →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats par voiture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🚗 Locations par voiture</h2>
          <div className="space-y-2">
            {vehicules?.map(v => {
              const nb = reservations?.filter(r => r.vehicule_id === v.id).length || 0
              const ca = reservations?.filter(r => r.vehicule_id === v.id)
                .reduce((s, r) => s + (r.total_a_payer || 0), 0) || 0
              return (
                <div key={v.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{v.nom}</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{nb} location(s)</span>
                    <span className="text-xs text-green-700 font-bold ml-2">{ca.toLocaleString()} Ar</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📈 Stats générales</h2>
          <div className="space-y-3">
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm">Total réservations</span>
              <span className="font-bold">{stats.total}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm">Non payées</span>
              <span className="font-bold text-red-600">{stats.nonPayees}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm">Maintenances en cours</span>
              <span className="font-bold text-orange-600">{maintenances?.length || 0}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm">Véhicules actifs</span>
              <span className="font-bold text-green-600">{vehicules?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
