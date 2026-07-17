'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

const GITHUB_IMAGES = process.env.NEXT_PUBLIC_GITHUB_IMAGES || '/images/voitures/'

interface VehiculeForm {
  nom: string
  description: string
  image_url: string
  prix_normal: number
  cout_normal: number
  gain_12h: number
  supplement_24h: number | ''
  prix_chauffeur_jour: number | ''
  prix_chauffeur_nuit: number | ''
  prix_chauffeur_24h: number | ''
  prix_chauffeur_12h: number | ''
  actif: boolean
}

const formVide: VehiculeForm = {
  nom: '', description: '', image_url: '',
  prix_normal: 0, cout_normal: 0, gain_12h: 0,
  supplement_24h: '', prix_chauffeur_jour: '',
  prix_chauffeur_nuit: '', prix_chauffeur_24h: '',
  prix_chauffeur_12h: '', actif: true,
}

export default function AdminVehiculesPage() {
  const [vehicules, setVehicules] = useState<any[]>([])
  const [form, setForm] = useState<VehiculeForm>(formVide)
  const [editId, setEditId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data } = await supabase.from('vehicules').select('*').order('nom')
    setVehicules(data || [])
  }

  function calculerApercu() {
    const suppl = typeof form.supplement_24h === 'number' ? form.supplement_24h : 30000
    return {
      jour: form.prix_normal,
      nuit: form.prix_normal,
      h24: form.prix_normal + suppl,
      troisJours: form.gain_12h * 3,
      septJours: form.gain_12h * 7,
    }
  }

  async function sauvegarder() {
    setLoading(true)
    const payload = {
      nom: form.nom,
      description: form.description || null,
      image_url: form.image_url || null,
      prix_normal: form.prix_normal,
      cout_normal: form.cout_normal || null,
      gain_12h: form.gain_12h || null,
      supplement_24h: form.supplement_24h === '' ? null : form.supplement_24h,
      prix_chauffeur_jour: form.prix_chauffeur_jour === '' ? null : form.prix_chauffeur_jour,
      prix_chauffeur_nuit: form.prix_chauffeur_nuit === '' ? null : form.prix_chauffeur_nuit,
      prix_chauffeur_24h: form.prix_chauffeur_24h === '' ? null : form.prix_chauffeur_24h,
      prix_chauffeur_12h: form.prix_chauffeur_12h === '' ? null : form.prix_chauffeur_12h,
      actif: form.actif,
      updated_at: new Date().toISOString(),
    }

    if (editId) {
      await supabase.from('vehicules').update(payload).eq('id', editId)
    } else {
      await supabase.from('vehicules').insert(payload)
    }

    setForm(formVide)
    setEditId(null)
    setShowForm(false)
    setLoading(false)
    charger()
  }

  function editer(v: any) {
    setForm({
      nom: v.nom, description: v.description || '',
      image_url: v.image_url || '',
      prix_normal: v.prix_normal, cout_normal: v.cout_normal || 0,
      gain_12h: v.gain_12h || 0,
      supplement_24h: v.supplement_24h ?? '',
      prix_chauffeur_jour: v.prix_chauffeur_jour ?? '',
      prix_chauffeur_nuit: v.prix_chauffeur_nuit ?? '',
      prix_chauffeur_24h: v.prix_chauffeur_24h ?? '',
      prix_chauffeur_12h: v.prix_chauffeur_12h ?? '',
      actif: v.actif,
    })
    setEditId(v.id)
    setShowForm(true)
  }

  async function supprimer(id: number) {
    if (!confirm('Supprimer ce véhicule ?')) return
    await supabase.from('vehicules').update({ actif: false }).eq('id', id)
    charger()
  }

  const apercu = calculerApercu()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🚗 Gestion des véhicules</h1>
        <button onClick={() => { setForm(formVide); setEditId(null); setShowForm(true) }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter un véhicule
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card mb-8 border-2 border-green-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-green-800">
              {editId ? '✏️ Modifier le véhicule' : '➕ Nouveau véhicule'}
            </h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Infos générales */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2">Informations générales</h3>
              <div>
                <label className="label">Nom du véhicule *</label>
                <input className="input-field" value={form.nom}
                  onChange={e => setForm({...form, nom: e.target.value})} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input-field" rows={2} value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div>
                <label className="label">Nom du fichier image</label>
                <input className="input-field" placeholder="captiva.jpg" value={form.image_url}
                  onChange={e => setForm({...form, image_url: e.target.value})} />
                <p className="text-xs text-gray-500 mt-1">
                  Déposer l'image dans <code>public/images/voitures/</code> sur GitHub
                </p>
                {form.image_url && (
                  <img src={`${GITHUB_IMAGES}${form.image_url}`} alt="Aperçu"
                    className="mt-2 h-24 w-full object-cover rounded-lg"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="actif" checked={form.actif}
                  onChange={e => setForm({...form, actif: e.target.checked})}
                  className="w-4 h-4 accent-green-600" />
                <label htmlFor="actif" className="text-sm font-semibold">Véhicule actif</label>
              </div>
            </div>

            {/* Tarifs */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2">Tarifs de base (Sans chauffeur)</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label text-xs">Prix Normal (Ar) *</label>
                  <input type="number" className="input-field" value={form.prix_normal}
                    onChange={e => setForm({...form, prix_normal: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="label text-xs">Coût Normal (Ar)</label>
                  <input type="number" className="input-field" value={form.cout_normal}
                    onChange={e => setForm({...form, cout_normal: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="label text-xs">Gain 12H (Ar)</label>
                  <input type="number" className="input-field" value={form.gain_12h}
                    onChange={e => setForm({...form, gain_12h: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div>
                <label className="label">Supplément 24H spécifique (Ar)</label>
                <input type="number" className="input-field" placeholder="Vide = global (30 000 Ar)"
                  value={form.supplement_24h}
                  onChange={e => setForm({...form, supplement_24h: e.target.value === '' ? '' : parseInt(e.target.value)})} />
                <p className="text-xs text-gray-500 mt-1">Laisser vide pour utiliser le supplément global (30 000 Ar)</p>
              </div>

              <h3 className="font-bold text-gray-700 border-b pb-2 mt-4">Tarifs avec chauffeur</h3>
              <p className="text-xs text-gray-500">Laisser vide = option indisponible pour ce véhicule</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Prix Chauffeur JOUR', key: 'prix_chauffeur_jour' },
                  { label: 'Prix Chauffeur NUIT', key: 'prix_chauffeur_nuit' },
                  { label: 'Prix Chauffeur 24H', key: 'prix_chauffeur_24h' },
                  { label: 'Prix Chauffeur 12H (3j+)', key: 'prix_chauffeur_12h' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="label text-xs">{label} (Ar)</label>
                    <input type="number" className="input-field" placeholder="Vide = indispo"
                      value={(form as any)[key]}
                      onChange={e => setForm({...form, [key]: e.target.value === '' ? '' : parseInt(e.target.value)})} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Aperçu tarifs calculés */}
          {form.prix_normal > 0 && (
            <div className="mt-6 bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="font-bold text-green-800 mb-3">👁️ Aperçu tarifs calculés</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                {[
                  { label: '1j JOUR', val: apercu.jour },
                  { label: '1j NUIT', val: apercu.nuit },
                  { label: '1j 24H', val: apercu.h24 },
                  { label: '3 jours', val: apercu.troisJours },
                  { label: '7 jours', val: apercu.septJours },
                ].map((a, i) => (
                  <div key={i} className="bg-white rounded-lg p-2 text-center border">
                    <div className="text-xs text-gray-500">{a.label}</div>
                    <div className="font-bold text-green-700">{a.val.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Ar</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Annuler</button>
            <button onClick={sauvegarder} disabled={!form.nom || !form.prix_normal || loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {/* Liste véhicules */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="p-3 text-left">Véhicule</th>
              <th className="p-3 text-right">Prix Normal</th>
              <th className="p-3 text-right">24H</th>
              <th className="p-3 text-right">Gain 12H</th>
              <th className="p-3 text-center">Chauffeur</th>
              <th className="p-3 text-center">Statut</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicules.map((v) => (
              <tr key={v.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {v.image_url && (
                      <img src={`${GITHUB_IMAGES}${v.image_url}`} alt={v.nom}
                        className="w-10 h-10 object-cover rounded-lg"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                    <div className="font-semibold">{v.nom}</div>
                  </div>
                </td>
                <td className="p-3 text-right">{v.prix_normal?.toLocaleString()} Ar</td>
                <td className="p-3 text-right">{(v.prix_normal + (v.supplement_24h ?? 30000)).toLocaleString()} Ar</td>
                <td className="p-3 text-right">{v.gain_12h?.toLocaleString()} Ar</td>
                <td className="p-3 text-center">
                  {(v.prix_chauffeur_jour || v.prix_chauffeur_nuit || v.prix_chauffeur_24h)
                    ? <span className="badge-bleu">✅ Dispo</span>
                    : <span className="text-gray-400 text-xs">Non configuré</span>}
                </td>
                <td className="p-3 text-center">
                  {v.actif
                    ? <span className="badge-vert">Actif</span>
                    : <span className="badge-rouge">Inactif</span>}
                </td>
                <td className="p-3 text-center">
                  <div className="flex gap-1 justify-center">
                    <button onClick={() => editer(v)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => supprimer(v.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
