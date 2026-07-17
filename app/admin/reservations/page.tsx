'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Eye } from 'lucide-react'

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [filtre, setFiltre] = useState('TOUS')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { charger() }, [])

  async function charger() {
    setLoading(true)
    const { data } = await supabase
      .from('reservations')
      .select('*, clients(*), vehicules(*)')
      .order('created_at', { ascending: false })
    setReservations(data || [])
    setLoading(false)
  }

  async function valider(id: string, montantPaye: number, total: number) {
    const reste = Math.max(0, total - montantPaye)
    await supabase.from('reservations').update({
      statut_resa: 'VALIDÉE',
      statut_calendrier: montantPaye > 0 ? 'RESERVE' : 'PRE_RESERVE',
      statut_paiement: reste === 0 ? 'PAYÉ' : 'NON PAYÉ',
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    charger()
    setSelected(null)
  }

  async function annuler(id: string) {
    await supabase.from('reservations').update({
      statut_resa: 'ANNULÉE',
      statut_calendrier: 'DISPONIBLE',
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    charger()
    setSelected(null)
  }

  async function mettreAJourPaiement(id: string, montant: number, total: number) {
    const reste = Math.max(0, total - montant)
    await supabase.from('reservations').update({
      montant_paye: montant,
      reste,
      statut_paiement: reste === 0 ? 'PAYÉ' : 'NON PAYÉ',
      statut_calendrier: montant > 0 ? 'RESERVE' : 'PRE_RESERVE',
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    charger()
  }

  const filtrees = filtre === 'TOUS' ? reservations
    : reservations.filter(r => r.statut_resa === filtre)

  function badgeStatut(r: any) {
    if (r.statut_resa === 'EN_ATTENTE') return <span className="badge-jaune">⏳ En attente</span>
    if (r.statut_resa === 'VALIDÉE' && r.statut_calendrier === 'RESERVE') return <span className="badge-rouge">🔴 Réservé</span>
    if (r.statut_resa === 'VALIDÉE' && r.statut_calendrier === 'PRE_RESERVE') return <span className="badge-jaune">🟡 Pré-réservé</span>
    if (r.statut_resa === 'ANNULÉE') return <span className="badge-orange">❌ Annulé</span>
    return <span className="badge-bleu">{r.statut_resa}</span>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 Réservations</h1>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['TOUS', 'EN_ATTENTE', 'VALIDÉE', 'ANNULÉE'].map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filtre === f ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}>
            {f === 'TOUS' ? 'Toutes' : f === 'EN_ATTENTE' ? '⏳ En attente' : f === 'VALIDÉE' ? '✅ Validées' : '❌ Annulées'}
            <span className="ml-1 text-xs">
              ({f === 'TOUS' ? reservations.length : reservations.filter(r => r.statut_resa === f).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Voiture</th>
                <th className="p-3 text-left">Trajet</th>
                <th className="p-3 text-left">Période</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right">Payé</th>
                <th className="p-3 text-center">Statut</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtrees.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono font-bold text-green-700">{r.id}</td>
                  <td className="p-3">
                    <div className="font-semibold">{r.clients?.nom} {r.clients?.prenom}</div>
                    <div className="text-xs text-gray-500">{r.clients?.contact}</div>
                  </td>
                  <td className="p-3">
                    <div>{r.vehicules?.nom}</div>
                    <div className="text-xs text-gray-500">{r.avec_chauffeur ? '👤 Avec chauffeur' : '🚗 Sans'}</div>
                  </td>
                  <td className="p-3 text-xs">
                    <div>📍 {r.depart}</div>
                    <div>🏁 {r.destination}</div>
                  </td>
                  <td className="p-3 text-xs">
                    <div>{r.date_debut}</div>
                    <div>{r.date_fin}</div>
                    <div className="text-gray-500">{r.duree}j — {r.type_applique}</div>
                  </td>
                  <td className="p-3 text-right font-bold">{r.total_a_payer?.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <div className={r.reste > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                      {r.montant_paye?.toLocaleString()}
                    </div>
                    {r.reste > 0 && <div className="text-xs text-red-500">Reste: {r.reste?.toLocaleString()}</div>}
                  </td>
                  <td className="p-3 text-center">{badgeStatut(r)}</td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => setSelected(r)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Voir détails">
                        <Eye className="w-4 h-4" />
                      </button>
                      {r.statut_resa === 'EN_ATTENTE' && (
                        <>
                          <button onClick={() => valider(r.id, r.montant_paye, r.total_a_payer)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded" title="Valider">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => annuler(r.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded" title="Annuler">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal détail */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-green-800">Détail — {selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-bold text-gray-700 mb-2">👤 Client</div>
                  <div>{selected.clients?.nom} {selected.clients?.prenom}</div>
                  <div className="text-gray-500">{selected.clients?.contact}</div>
                  <div className="text-gray-500">{selected.clients?.email}</div>
                  <div className="text-gray-500">{selected.clients?.adresse}</div>
                  <div className="text-gray-500">CIN: {selected.clients?.cin_permis}</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 mb-2">🚗 Véhicule</div>
                  <div>{selected.vehicules?.nom}</div>
                  <div className="text-gray-500">{selected.avec_chauffeur ? 'Avec chauffeur' : 'Sans chauffeur'}</div>
                  <div className="font-bold text-gray-700 mt-3 mb-1">🗺️ Trajet</div>
                  <div>📍 {selected.depart}</div>
                  <div>🏁 {selected.destination}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-bold text-gray-700 mb-2">📅 Réservation</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>Du: <strong>{selected.date_debut}</strong></div>
                  <div>Au: <strong>{selected.date_fin}</strong></div>
                  <div>Durée: <strong>{selected.duree} jour(s)</strong></div>
                  <div>Type: <strong>{selected.type_applique}</strong></div>
                  {selected.heure_debut && <div>Départ: <strong>{selected.heure_debut}</strong></div>}
                  {selected.heure_fin && <div>Retour: <strong>{selected.heure_fin}</strong></div>}
                  {selected.upgrade_24h && (
                    <div className="col-span-2 text-orange-600">⚠️ {selected.motif_upgrade}</div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="font-bold text-gray-700 mb-2">💰 Paiement</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>Total: <strong>{selected.total_a_payer?.toLocaleString()} Ar</strong></div>
                  <div>Payé: <strong>{selected.montant_paye?.toLocaleString()} Ar</strong></div>
                  <div>Reste: <strong className="text-red-600">{selected.reste?.toLocaleString()} Ar</strong></div>
                  <div>Statut: {badgeStatut(selected)}</div>
                </div>

                {/* Mise à jour paiement */}
                {selected.statut_resa === 'VALIDÉE' && selected.reste > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="font-semibold text-sm mb-2">Mettre à jour le paiement :</div>
                    <div className="flex gap-2">
                      <input type="number" id="nouveauPaiement" className="input-field flex-1"
                        placeholder="Nouveau montant payé" defaultValue={selected.montant_paye} />
                      <button onClick={() => {
                        const val = parseInt((document.getElementById('nouveauPaiement') as HTMLInputElement).value)
                        mettreAJourPaiement(selected.id, val, selected.total_a_payer)
                      }} className="btn-primary px-4 py-2 text-sm">
                        Mettre à jour
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {selected.notes && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="font-bold text-sm mb-1">📝 Notes</div>
                  <div className="text-gray-700">{selected.notes}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selected.statut_resa === 'EN_ATTENTE' && (
                  <>
                    <button onClick={() => valider(selected.id, selected.montant_paye, selected.total_a_payer)}
                      className="btn-primary flex-1 flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Valider
                    </button>
                    <button onClick={() => annuler(selected.id)}
                      className="btn-danger flex-1 flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" /> Annuler
                    </button>
                  </>
                )}
                <a href={`/admin/factures?id=${selected.id}`}
                  className="btn-secondary flex-1 text-center">
                  📄 Générer facture
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
