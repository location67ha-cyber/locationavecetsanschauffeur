import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle } from 'lucide-react'

export default async function VehiculesPage() {
  const { data: vehicules } = await supabase
    .from('vehicules')
    .select('*')
    .eq('actif', true)
    .order('nom')

  const GITHUB_IMAGES = process.env.NEXT_PUBLIC_GITHUB_IMAGES || '/images/voitures/'

  function formatPrix(p: number | null) {
    if (!p) return null
    return p.toLocaleString() + ' Ar'
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Nos Véhicules</h1>
          <p className="text-gray-600">Choisissez votre voiture — avec ou sans chauffeur</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicules?.map((v) => (
            <div key={v.id} className="card hover:shadow-xl transition-all group">
              
              {/* Photo */}
              <div className="h-48 bg-gray-200 rounded-xl mb-4 overflow-hidden">
                <img
                  src={v.image_url ? `${GITHUB_IMAGES}${v.image_url}` : `${GITHUB_IMAGES}placeholder.jpg`}
                  alt={v.nom}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg' }}
                />
              </div>

              {/* Nom */}
              <h2 className="text-xl font-bold text-green-800 mb-4">{v.nom}</h2>

              {/* Description */}
              {v.description && (
                <p className="text-gray-600 text-sm mb-4">{v.description}</p>
              )}

              {/* Tarifs SANS chauffeur */}
              <div className="mb-4">
                <div className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  🚗 Sans chauffeur
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { label: 'JOUR', val: v.prix_normal },
                    { label: 'NUIT', val: v.prix_normal },
                    { label: '24H', val: v.prix_normal + (v.supplement_24h ?? 30000) },
                  ].map((t) => (
                    <div key={t.label} className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="font-bold text-green-700">{t.label}</div>
                      <div className="text-gray-700">{t.val.toLocaleString()}</div>
                      <div className="text-gray-500">Ar</div>
                    </div>
                  ))}
                </div>
                {v.gain_12h && (
                  <div className="text-xs text-gray-500 mt-1">
                    3j+ : {v.gain_12h.toLocaleString()} Ar/jour
                  </div>
                )}
              </div>

              {/* Tarifs AVEC chauffeur */}
              <div className="mb-4">
                <div className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  👤 Avec chauffeur
                </div>
                {(v.prix_chauffeur_jour || v.prix_chauffeur_nuit || v.prix_chauffeur_24h) ? (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { label: 'JOUR', val: v.prix_chauffeur_jour },
                      { label: 'NUIT', val: v.prix_chauffeur_nuit },
                      { label: '24H', val: v.prix_chauffeur_24h },
                    ].map((t) => (
                      <div key={t.label} className={`rounded-lg p-2 text-center ${t.val ? 'bg-blue-50' : 'bg-gray-100'}`}>
                        <div className={`font-bold ${t.val ? 'text-blue-700' : 'text-gray-400'}`}>{t.label}</div>
                        {t.val ? (
                          <>
                            <div className="text-gray-700">{t.val.toLocaleString()}</div>
                            <div className="text-gray-500">Ar</div>
                          </>
                        ) : (
                          <div className="text-gray-400 text-xs">N/D</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Option non disponible
                  </div>
                )}
              </div>

              {/* Conditions */}
              <div className="bg-yellow-50 rounded-lg p-3 mb-4 text-xs text-gray-600">
                ⛽ Carburant à charge du client
                {(v.prix_chauffeur_jour || v.prix_chauffeur_nuit) && (
                  <><br />🍽️ Repas & 🏨 hébergement chauffeur à charge</>
                )}
              </div>

              {/* Bouton */}
              <Link href={`/reserver?vehicule=${v.id}`} className="btn-primary w-full text-center block">
                Réserver ce véhicule
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
