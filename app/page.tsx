import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Car, Clock, Shield, Phone, CheckCircle } from 'lucide-react'

export default async function HomePage() {
  const { data: vehicules } = await supabase
    .from('vehicules')
    .select('*')
    .eq('actif', true)
    .limit(4)

  const GITHUB_IMAGES = process.env.NEXT_PUBLIC_GITHUB_IMAGES || '/images/voitures/'

  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <Car className="w-16 h-16 text-yellow-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Location Voiture <span className="text-yellow-400">Madagascar</span>
            </h1>
            <p className="text-xl md:text-2xl text-green-200 mb-2">Avec ou Sans Chauffeur</p>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Louez votre véhicule à Antananarivo et partout à Madagascar. 
              Tarifs transparents, réservation simple et rapide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/reserver" className="bg-yellow-400 text-green-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg">
                🚗 Réserver maintenant
              </Link>
              <Link href="/vehicules" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-green-900 transition-all">
                Voir nos voitures
              </Link>
            </div>
          </div>
        </section>

        {/* AVANTAGES */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-3xl font-bold text-green-800 mb-12">
              Pourquoi nous choisir ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Car className="w-10 h-10 text-green-600" />, titre: 'Flotte variée', desc: 'Citadines, SUV, Minibus — avec ou sans chauffeur selon vos besoins.' },
                { icon: <Clock className="w-10 h-10 text-green-600" />, titre: 'Tarifs flexibles', desc: 'Location à la journée, à la nuit ou 24H. Tarifs dégressifs dès 3 jours.' },
                { icon: <Shield className="w-10 h-10 text-green-600" />, titre: 'Réservation simple', desc: 'Formulaire en ligne, confirmation rapide par WhatsApp et email.' },
              ].map((item, i) => (
                <div key={i} className="card text-center hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-4">{item.icon}</div>
                  <h3 className="font-bold text-lg mb-2 text-green-800">{item.titre}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VÉHICULES APERÇU */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-3xl font-bold text-green-800 mb-4">Nos Véhicules</h2>
            <p className="text-center text-gray-600 mb-12">Découvrez notre flotte disponible à Antananarivo</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehicules?.map((v) => (
                <div key={v.id} className="card hover:shadow-xl transition-all group">
                  <div className="h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={v.image_url ? `${GITHUB_IMAGES}${v.image_url}` : `${GITHUB_IMAGES}placeholder.jpg`}
                      alt={v.nom}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg' }}
                    />
                  </div>
                  <h3 className="font-bold text-green-800 mb-2">{v.nom}</h3>
                  <div className="text-sm text-gray-600 mb-3">
                    <div>À partir de <span className="font-bold text-green-700">{v.prix_normal.toLocaleString()} Ar</span>/jour</div>
                    {v.prix_chauffeur_jour && (
                      <div className="text-xs text-blue-600">Avec chauffeur disponible</div>
                    )}
                  </div>
                  <Link href={`/reserver?vehicule=${v.id}`} className="btn-primary w-full text-center text-sm py-2 block">
                    Réserver
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/vehicules" className="btn-secondary inline-block">
                Voir tous nos véhicules →
              </Link>
            </div>
          </div>
        </section>

        {/* COMMENT ÇA MARCHE */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-3xl font-bold text-green-800 mb-12">Comment ça marche ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '1', titre: 'Choisissez', desc: 'Sélectionnez votre véhicule, vos dates et votre trajet.' },
                { num: '2', titre: 'Réservez', desc: 'Remplissez le formulaire. Votre demande est envoyée par WhatsApp.' },
                { num: '3', titre: 'Confirmé !', desc: 'Validation par notre équipe + email de confirmation avec facture.' },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-green-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.titre}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONDITIONS RAPIDES */}
        <section className="py-12 px-4 bg-yellow-50 border-y border-yellow-200">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-2xl font-bold text-green-800 mb-6">Conditions importantes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '⛽', titre: 'Carburant', desc: 'Le carburant est toujours à la charge du client.' },
                { icon: '🍽️', titre: 'Repas chauffeur', desc: 'Si option avec chauffeur : repas à charge du client.' },
                { icon: '🏨', titre: 'Hébergement', desc: 'Si nuit(s) : hébergement du chauffeur à charge du client.' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-yellow-200 flex items-start gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <div className="font-bold text-sm">{c.titre}</div>
                    <div className="text-gray-600 text-xs">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA CONTACT */}
        <section className="py-16 px-4 bg-green-800 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <Phone className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Une question ?</h2>
            <p className="text-green-200 mb-6">Contactez-nous directement par téléphone ou WhatsApp</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+261349120726" className="bg-white text-green-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                📞 034 91 207 26
              </a>
              <a href="https://wa.me/+261349120726" target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-400 transition-colors">
                💬 WhatsApp
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
