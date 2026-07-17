'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { calculerPrix } from '@/lib/calcul-tarif'
import { genererLienWhatsApp } from '@/lib/whatsapp'
import { Vehicule } from '@/types'
import { useSearchParams } from 'next/navigation'
import { differenceInDays, parseISO } from 'date-fns'

export default function ReserverPage() {
  const searchParams = useSearchParams()
  const vehiculeParam = searchParams.get('vehicule')

  const [etape, setEtape] = useState(1)
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [loading, setLoading] = useState(false)
  const [succes, setSucces] = useState(false)
  const [erreurGlobal, setErreurGlobal] = useState('')

  // Formulaire
  const [form, setForm] = useState({
    // Étape 1 — Trajet & dates
    depart: '',
    destination: '',
    date_debut: '',
    date_fin: '',
    heure_debut: '07:00',
    heure_fin: '19:00',
    type_demande: 'JOUR' as 'JOUR' | 'NUIT' | '24H',
    option_24h: 'MATIN' as 'MATIN' | 'SOIR',
    // Étape 2 — Véhicule
    vehicule_id: vehiculeParam || '',
    avec_chauffeur: false,
    // Étape 3 — Client
    nom: '',
    prenom: '',
    contact: '',
    email: '',
    adresse: '',
    cin_permis: '',
    // Étape 4 — Paiement
    montant_paye: 0,
    remise: 0,
    notes: '',
    // Conditions
    cond_carburant: false,
    cond_repas_chauffeur: false,
    cond_hebergement_chauf: false,
  })

  const [calcul, setCalcul] = useState<any>(null)
  const [avertissement, setAvertissement] = useState('')

  useEffect(() => {
    supabase.from('vehicules').select('*').eq('actif', true).order('nom')
      .then(({ data }) => setVehicules(data || []))
  }, [])

  // Calcul automatique
  useEffect(() => {
    if (!form.vehicule_id || !form.date_debut || !form.date_fin) return
    const vehicule = vehicules.find(v => v.id === parseInt(form.vehicule_id))
    if (!vehicule) return

    const debut = parseISO(form.date_debut)
    const fin = parseISO(form.date_fin)
    const duree = Math.max(1, differenceInDays(fin, debut) + 1)

    const result = calculerPrix({
      vehicule,
      duree,
      typeDemande: form.type_demande,
      heureDebut: form.heure_debut,
      heureFin: form.heure_fin,
      option24h: form.option_24h,
      avecChauffeur: form.avec_chauffeur,
      remise: form.remise,
    })

    setCalcul({ ...result, duree })
    setAvertissement(result.avertissement || '')
  }, [form.vehicule_id, form.date_debut, form.date_fin, form.type_demande,
      form.heure_debut, form.heure_fin, form.option_24h, form.avec_chauffeur,
      form.remise, vehicules])

  const vehiculeSelectionne = vehicules.find(v => v.id === parseInt(form.vehicule_id))

  async function genererIdReservation(): Promise<string> {
    const { data } = await supabase
      .from('reservations')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)

    if (!data || data.length === 0) return 'LOC-038'
    const dernierNum = parseInt(data[0].id.replace('LOC-', ''))
    return `LOC-${String(dernierNum + 1).padStart(3, '0')}`
  }

  async function soumettreReservation() {
    if (!calcul || calcul.erreur) return
    setLoading(true)
    setErreurGlobal('')

    try {
      // 1. Créer le client
      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .insert({
          nom: form.nom.toUpperCase(),
          prenom: form.prenom,
          contact: form.contact,
          email: form.email,
          adresse: form.adresse,
          cin_permis: form.cin_permis,
        })
        .select()
        .single()

      if (clientErr) throw clientErr

      // 2. Générer ID
      const reservationId = await genererIdReservation()

      // 3. Déterminer statut calendrier
      const montantPaye = parseInt(String(form.montant_paye)) || 0
      const statutCalendrier = montantPaye === 0 ? 'PRE_RESERVE' : 'EN_ATTENTE'
      const duree = calcul.duree
      const reste = Math.max(0, calcul.total - montantPaye)

      // 4. Créer la réservation
      const { data: resaData, error: resaErr } = await supabase
        .from('reservations')
        .insert({
          id: reservationId,
          client_id: clientData.id,
          vehicule_id: parseInt(form.vehicule_id),
          depart: form.depart,
          destination: form.destination,
          date_debut: form.date_debut,
          date_fin: form.date_fin,
          duree,
          heure_debut: form.heure_debut,
          heure_fin: form.heure_fin,
          option_24h: form.type_demande === '24H' ? form.option_24h : null,
          type_demande: form.type_demande,
          type_applique: calcul.typeApplique,
          avec_chauffeur: form.avec_chauffeur,
          upgrade_24h: calcul.upgrade24h,
          motif_upgrade: calcul.motifUpgrade,
          depassement: calcul.depassement,
          prix_base: calcul.prixBase,
          supplement_applique: calcul.supplementApplique || 0,
          remise: form.remise || 0,
          total_a_payer: calcul.total,
          montant_paye: montantPaye,
          reste,
          statut_paiement: reste === 0 ? 'PAYÉ' : 'NON PAYÉ',
          statut_calendrier: statutCalendrier,
          statut_resa: 'EN_ATTENTE',
          cond_carburant: form.cond_carburant,
          cond_repas_chauffeur: form.avec_chauffeur ? form.cond_repas_chauffeur : false,
          cond_hebergement_chauf: form.avec_chauffeur ? form.cond_hebergement_chauf : false,
          conditions_acceptees: true,
          notes: form.notes,
        })
        .select()
        .single()

      if (resaErr) throw resaErr

      // 5. Générer lien WhatsApp
      const lienWA = genererLienWhatsApp({
        reservation: { ...resaData, montant_paye: montantPaye, reste },
        client: clientData,
        vehicule: vehiculeSelectionne,
        calcul,
      })

      // 6. Ouvrir WhatsApp
      window.open(lienWA, '_blank')

      setSucces(true)
    } catch (err: any) {
      setErreurGlobal(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const conditionsValides = form.cond_carburant &&
    (!form.avec_chauffeur || (form.cond_repas_chauffeur && form.cond_hebergement_chauf))

  if (succes) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="card">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-800 mb-4">Demande envoyée !</h1>
            <p className="text-gray-600 mb-4">
              Votre demande de réservation a été soumise avec succès.<br />
              Un message WhatsApp a été ouvert pour notifier notre équipe.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-left">
              <p className="font-bold text-yellow-800 mb-2">⚠️ Important :</p>
              <ul className="text-yellow-700 space-y-1">
                <li>• Votre réservation est <strong>EN ATTENTE DE VALIDATION</strong></li>
                <li>• Vous recevrez un email de confirmation après validation</li>
                {parseInt(String(form.montant_paye)) === 0 && (
                  <li>• Sans acompte, la date reste disponible pour d'autres clients</li>
                )}
              </ul>
            </div>
            <a href="/" className="btn-primary inline-block">Retour à l'accueil</a>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-green-800 mb-2 text-center">Réserver un véhicule</h1>
        <p className="text-center text-gray-600 mb-8">Remplissez le formulaire — votre demande sera validée par notre équipe</p>

        {/* Indicateur étapes */}
        <div className="flex items-center justify-center mb-10 gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                etape >= n ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{n}</div>
              {n < 4 && <div className={`w-8 h-1 rounded ${etape > n ? 'bg-green-700' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {erreurGlobal && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            ❌ {erreurGlobal}
          </div>
        )}

        {/* ═══ ÉTAPE 1 — TRAJET & DATES ═══ */}
        {etape === 1 && (
          <div className="card">
            <h2 className="text-xl font-bold text-green-800 mb-6">📍 Trajet & Dates</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Lieu de départ *</label>
                <input className="input-field" placeholder="Ex: Antananarivo" value={form.depart}
                  onChange={e => setForm({...form, depart: e.target.value})} />
              </div>
              <div>
                <label className="label">Destination *</label>
                <input className="input-field" placeholder="Ex: Toamasina" value={form.destination}
                  onChange={e => setForm({...form, destination: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Date de début *</label>
                <input type="date" className="input-field" value={form.date_debut}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({...form, date_debut: e.target.value})} />
              </div>
              <div>
                <label className="label">Date de fin *</label>
                <input type="date" className="input-field" value={form.date_fin}
                  min={form.date_debut || new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({...form, date_fin: e.target.value})} />
              </div>
            </div>

            {/* Type de location */}
            <div className="mb-4">
              <label className="label">Type de location *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['JOUR', 'NUIT', '24H'] as const).map((t) => (
                  <button key={t} onClick={() => setForm({...form, type_demande: t})}
                    className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      form.type_demande === t
                        ? 'border-green-600 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-green-300'
                    }`}>
                    {t === 'JOUR' ? '🌞 JOUR' : t === 'NUIT' ? '🌙 NUIT' : '🕐 24H'}
                    <div className="text-xs font-normal text-gray-500 mt-1">
                      {t === 'JOUR' ? '07h → 19h' : t === 'NUIT' ? '19h → 06h' : 'Journée complète'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Horaires JOUR/NUIT */}
            {form.type_demande !== '24H' && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Heure de départ</label>
                  <input type="time" className="input-field" value={form.heure_debut}
                    onChange={e => setForm({...form, heure_debut: e.target.value})} />
                </div>
                <div>
                  <label className="label">Heure de retour</label>
                  <input type="time" className="input-field" value={form.heure_fin}
                    onChange={e => setForm({...form, heure_fin: e.target.value})} />
                </div>
              </div>
            )}

            {/* Option 24H */}
            {form.type_demande === '24H' && (
              <div className="mb-4">
                <label className="label">Option 24H</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['MATIN', 'SOIR'] as const).map((opt) => (
                    <button key={opt} onClick={() => setForm({...form, option_24h: opt})}
                      className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                        form.option_24h === opt
                          ? 'border-green-600 bg-green-50 text-green-800'
                          : 'border-gray-200 hover:border-green-300'
                      }`}>
                      {opt === 'MATIN' ? '🌅 Option Matin' : '🌆 Option Soir'}
                      <div className="text-xs font-normal text-gray-500 mt-1">
                        {opt === 'MATIN' ? '07h00 → 06h00 (lendemain)' : '19h00 → 18h00 (lendemain)'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Avertissement horaire */}
            {avertissement && (
              <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 mb-4 text-orange-800 text-sm">
                {avertissement}
              </div>
            )}

            <button onClick={() => setEtape(2)}
              disabled={!form.depart || !form.destination || !form.date_debut || !form.date_fin}
              className="btn-primary w-full mt-4">
              Suivant →
            </button>
          </div>
        )}

        {/* ═══ ÉTAPE 2 — VÉHICULE ═══ */}
        {etape === 2 && (
          <div className="card">
            <h2 className="text-xl font-bold text-green-800 mb-6">🚗 Choix du véhicule</h2>

            <div className="mb-4">
              <label className="label">Véhicule *</label>
              <select className="input-field" value={form.vehicule_id}
                onChange={e => setForm({...form, vehicule_id: e.target.value})}>
                <option value="">-- Sélectionner un véhicule --</option>
                {vehicules.map(v => (
                  <option key={v.id} value={v.id}>{v.nom} — {v.prix_normal.toLocaleString()} Ar/jour</option>
                ))}
              </select>
            </div>

            {/* Option chauffeur */}
            {vehiculeSelectionne && (
              <div className="mb-4">
                <label className="label">Option chauffeur</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setForm({...form, avec_chauffeur: false})}
                    className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      !form.avec_chauffeur ? 'border-green-600 bg-green-50 text-green-800' : 'border-gray-200'
                    }`}>
                    🚗 Sans chauffeur
                  </button>
                  <button
                    onClick={() => {
                      const dispo = vehiculeSelectionne.prix_chauffeur_jour ||
                                    vehiculeSelectionne.prix_chauffeur_nuit ||
                                    vehiculeSelectionne.prix_chauffeur_24h
                      if (dispo) setForm({...form, avec_chauffeur: true})
                    }}
                    disabled={!vehiculeSelectionne.prix_chauffeur_jour &&
                              !vehiculeSelectionne.prix_chauffeur_nuit &&
                              !vehiculeSelectionne.prix_chauffeur_24h}
                    className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      form.avec_chauffeur ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}>
                    👤 Avec chauffeur
                    {!vehiculeSelectionne.prix_chauffeur_jour &&
                     !vehiculeSelectionne.prix_chauffeur_nuit &&
                     !vehiculeSelectionne.prix_chauffeur_24h && (
                      <div className="text-xs text-red-500 font-normal">Non disponible</div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Calcul prix */}
            {calcul && !calcul.erreur && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="font-bold text-green-800 mb-2">💰 Estimation tarifaire</div>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>Durée : <strong>{calcul.duree} jour(s)</strong></div>
                  <div>Type appliqué : <strong>{calcul.typeApplique}</strong></div>
                  <div>Calcul : {calcul.detail}</div>
                  <div className="text-lg font-bold text-green-700 mt-2">
                    Total : {calcul.total.toLocaleString()} Ar
                  </div>
                </div>
              </div>
            )}

            {calcul?.erreur && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
                ❌ {calcul.erreur}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => setEtape(1)} className="btn-secondary flex-1">← Retour</button>
              <button onClick={() => setEtape(3)}
                disabled={!form.vehicule_id || !calcul || !!calcul?.erreur}
                className="btn-primary flex-1">Suivant →</button>
            </div>
          </div>
        )}

        {/* ═══ ÉTAPE 3 — CLIENT ═══ */}
        {etape === 3 && (
          <div className="card">
            <h2 className="text-xl font-bold text-green-800 mb-6">👤 Vos informations</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nom *</label>
                <input className="input-field" placeholder="NOM" value={form.nom}
                  onChange={e => setForm({...form, nom: e.target.value})} />
              </div>
              <div>
                <label className="label">Prénom</label>
                <input className="input-field" placeholder="Prénom" value={form.prenom}
                  onChange={e => setForm({...form, prenom: e.target.value})} />
              </div>
              <div>
                <label className="label">Téléphone *</label>
                <input className="input-field" placeholder="034 XX XXX XX" value={form.contact}
                  onChange={e => setForm({...form, contact: e.target.value})} />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input-field" placeholder="email@exemple.com" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Adresse</label>
                <input className="input-field" placeholder="Votre adresse" value={form.adresse}
                  onChange={e => setForm({...form, adresse: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="label">CIN ou Numéro de permis</label>
                <input className="input-field" placeholder="Numéro CIN ou permis" value={form.cin_permis}
                  onChange={e => setForm({...form, cin_permis: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEtape(2)} className="btn-secondary flex-1">← Retour</button>
              <button onClick={() => setEtape(4)}
                disabled={!form.nom || !form.contact || !form.email}
                className="btn-primary flex-1">Suivant →</button>
            </div>
          </div>
        )}

        {/* ═══ ÉTAPE 4 — PAIEMENT & CONDITIONS ═══ */}
        {etape === 4 && (
          <div className="card">
            <h2 className="text-xl font-bold text-green-800 mb-6">💰 Paiement & Conditions</h2>

            {/* Récapitulatif */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm space-y-2">
              <div className="font-bold text-gray-700 mb-3">📋 Récapitulatif</div>
              <div className="flex justify-between"><span>Véhicule</span><strong>{vehiculeSelectionne?.nom}</strong></div>
              <div className="flex justify-between"><span>Trajet</span><strong>{form.depart} → {form.destination}</strong></div>
              <div className="flex justify-between"><span>Période</span><strong>{form.date_debut} → {form.date_fin}</strong></div>
              <div className="flex justify-between"><span>Durée</span><strong>{calcul?.duree} jour(s)</strong></div>
              <div className="flex justify-between"><span>Type</span><strong>{calcul?.typeApplique}</strong></div>
              <div className="flex justify-between"><span>Option</span><strong>{form.avec_chauffeur ? 'Avec chauffeur' : 'Sans chauffeur'}</strong></div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold text-green-700">
                <span>Total</span><span>{calcul?.total.toLocaleString()} Ar</span>
              </div>
            </div>

            {/* Acompte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Acompte versé (Ar)</label>
                <input type="number" className="input-field" placeholder="0" min="0"
                  max={calcul?.total || 0}
                  value={form.montant_paye || ''}
                  onChange={e => setForm({...form, montant_paye: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="label">Reste à payer</label>
                <div className="input-field bg-gray-100 font-bold text-red-600">
                  {Math.max(0, (calcul?.total || 0) - (form.montant_paye || 0)).toLocaleString()} Ar
                </div>
              </div>
            </div>

            {/* Avertissement acompte 0 */}
            {(!form.montant_paye || form.montant_paye === 0) && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4 text-yellow-800 text-sm">
                ⚠️ <strong>Sans acompte :</strong> votre réservation sera marquée comme PRÉ-RÉSERVÉE.
                La date reste disponible pour d'autres clients. Un acompte confirme votre priorité.
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <label className="label">Notes / Demandes particulières</label>
              <textarea className="input-field" rows={3} placeholder="Informations complémentaires..."
                value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>

            {/* CONDITIONS OBLIGATOIRES */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="font-bold text-orange-800 mb-3">⚠️ Conditions obligatoires</div>
              
              <label className="flex items-start gap-3 cursor-pointer mb-3">
                <input type="checkbox" className="mt-1 w-4 h-4 accent-green-600"
                  checked={form.cond_carburant}
                  onChange={e => setForm({...form, cond_carburant: e.target.checked})} />
                <span className="text-sm text-gray-700">
                  ⛽ <strong>Je reconnais que le carburant est entièrement à ma charge</strong> pendant toute la durée de la location.
                </span>
              </label>

              {form.avec_chauffeur && (
                <>
                  <label className="flex items-start gap-3 cursor-pointer mb-3">
                    <input type="checkbox" className="mt-1 w-4 h-4 accent-green-600"
                      checked={form.cond_repas_chauffeur}
                      onChange={e => setForm({...form, cond_repas_chauffeur: e.target.checked})} />
                    <span className="text-sm text-gray-700">
                      🍽️ <strong>Je reconnais que les repas du chauffeur sont à ma charge</strong> pendant toute la durée de la location.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1 w-4 h-4 accent-green-600"
                      checked={form.cond_hebergement_chauf}
                      onChange={e => setForm({...form, cond_hebergement_chauf: e.target.checked})} />
                    <span className="text-sm text-gray-700">
                      🏨 <strong>Je reconnais que l'hébergement du chauffeur est à ma charge</strong> si la location nécessite une ou plusieurs nuits.
                    </span>
                  </label>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEtape(3)} className="btn-secondary flex-1">← Retour</button>
              <button onClick={soumettreReservation}
                disabled={!conditionsValides || loading || !calcul || !!calcul?.erreur}
                className="btn-primary flex-1">
                {loading ? '⏳ Envoi...' : '✅ Envoyer ma demande'}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
