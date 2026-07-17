import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function InfosPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-green-800 mb-2 text-center">Informations & Conditions</h1>
        <p className="text-center text-gray-600 mb-10">Tout ce que vous devez savoir avant de réserver</p>

        {/* Tarifs */}
        <section className="card mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-6">💰 Grille tarifaire</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="p-3 text-left rounded-tl-lg">Véhicule</th>
                  <th className="p-3 text-center">JOUR (12H)</th>
                  <th className="p-3 text-center">NUIT (12H)</th>
                  <th className="p-3 text-center">24H</th>
                  <th className="p-3 text-center rounded-tr-lg">3j+ /jour</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { nom: 'Matiz',           prix: 85000,  gain: 20000 },
                  { nom: 'Getz Manuel',     prix: 110000, gain: 30000 },
                  { nom: 'Getz Automatique',prix: 120000, gain: 30000 },
                  { nom: 'Kia Pride',       prix: 140000, gain: 40000 },
                  { nom: 'Starex',          prix: 150000, gain: 30000 },
                  { nom: 'Cruze 1',         prix: 170000, gain: 40000 },
                  { nom: 'Cruze 2',         prix: 170000, gain: 40000 },
                  { nom: 'Captiva',         prix: 190000, gain: 40000 },
                  { nom: 'Rexton',          prix: 200000, gain: 50000 },
                  { nom: 'Sorento',         prix: 230000, gain: 30000 },
                ].map((v, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 font-semibold">{v.nom}</td>
                    <td className="p-3 text-center">{v.prix.toLocaleString()} Ar</td>
                    <td className="p-3 text-center">{v.prix.toLocaleString()} Ar</td>
                    <td className="p-3 text-center">{(v.prix + 30000).toLocaleString()} Ar</td>
                    <td className="p-3 text-center text-green-700 font-bold">{v.gain.toLocaleString()} Ar</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">* Tarif chauffeur : nous contacter pour les prix spécifiques</p>
        </section>

        {/* Règles horaires */}
        <section className="card mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-6">🕐 Créneaux horaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { emoji: '🌞', type: 'JOUR (12H)', plage: '07h00 → 19h00', note: 'Départ min 06h00. Retour max 19h00. Au-delà → tarif 24H.' },
              { emoji: '🌙', type: 'NUIT (12H)', plage: '19h00 → 06h00', note: 'Départ min 19h00. Retour max 06h00. Au-delà → tarif 24H.' },
              { emoji: '🕐', type: '24H', plage: '07h→06h ou 19h→18h', note: 'Option matin ou soir. Dépassement = majoration.' },
            ].map((c, i) => (
              <div key={i} className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-2xl mb-2">{c.emoji}</div>
                <div className="font-bold text-green-800 mb-1">{c.type}</div>
                <div className="text-sm font-semibold text-gray-700 mb-2">{c.plage}</div>
                <div className="text-xs text-gray-600">{c.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Règles de calcul */}
        <section className="card mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-6">📐 Règles de calcul</h2>
          <div className="space-y-3">
            {[
              { duree: '1 jour JOUR ou NUIT', calcul: 'Prix Normal', exemple: '190 000 Ar (Captiva)' },
              { duree: '1 jour 24H', calcul: 'Prix Normal + 30 000 Ar', exemple: '220 000 Ar (Captiva)' },
              { duree: '2 jours', calcul: 'Prix 24H × 2', exemple: '440 000 Ar (Captiva)' },
              { duree: '3 jours et plus', calcul: 'Gain 12H × nombre de jours', exemple: '40 000 × 5 = 200 000 Ar (Captiva)' },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-green-700 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">{r.duree}</div>
                <div>
                  <div className="font-semibold text-sm">{r.calcul}</div>
                  <div className="text-xs text-gray-500">Ex: {r.exemple}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conditions */}
        <section className="card mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-6">📋 Conditions de location</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <span className="text-2xl">⛽</span>
              <div>
                <div className="font-bold">Carburant — Toutes locations</div>
                <div className="text-sm text-gray-600">Le carburant est entièrement à la charge du client pendant toute la durée de la location.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-2xl">🍽️</span>
              <div>
                <div className="font-bold">Repas du chauffeur — Avec chauffeur uniquement</div>
                <div className="text-sm text-gray-600">Si vous optez pour la location avec chauffeur, les repas du chauffeur sont à votre charge.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-2xl">🏨</span>
              <div>
                <div className="font-bold">Hébergement du chauffeur — Avec chauffeur uniquement</div>
                <div className="text-sm text-gray-600">Si la location nécessite une ou plusieurs nuits, l'hébergement du chauffeur est à votre charge.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Statuts réservation */}
        <section className="card mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-6">📅 Statuts de réservation</h2>
          <div className="space-y-3">
            {[
              { couleur: 'bg-green-500', label: '🟢 DISPONIBLE', desc: 'Aucune réservation sur ce créneau.' },
              { couleur: 'bg-yellow-500', label: '🟡 PRÉ-RÉSERVÉ', desc: 'Demande soumise sans acompte. Date encore disponible.' },
              { couleur: 'bg-blue-500', label: '🔵 EN ATTENTE', desc: 'Acompte versé, en attente de validation par notre équipe.' },
              { couleur: 'bg-red-500', label: '🔴 RÉSERVÉ', desc: 'Confirmé par notre équipe. Date non disponible.' },
              { couleur: 'bg-orange-500', label: '🟠 MAINTENANCE', desc: 'Véhicule en entretien. Non disponible.' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-4 h-4 rounded-full ${s.couleur}`} />
                <div className="font-semibold text-sm w-40">{s.label}</div>
                <div className="text-sm text-gray-600">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="card bg-green-800 text-white">
          <h2 className="text-xl font-bold mb-4">📞 Nous contacter</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-bold text-yellow-400">ANDRIANASOLO Volandrato</div>
              <div className="text-green-200 text-sm mt-1">67 Ha Nord Ouest, Antananarivo</div>
              <div className="text-green-200 text-sm">034 91 207 26</div>
            </div>
            <div className="flex flex-col gap-2">
              <a href="tel:+261349120726" className="bg-white text-green-800 px-4 py-2 rounded-lg font-bold text-center text-sm hover:bg-gray-100">
                📞 Appeler
              </a>
              <a href="https://wa.me/+261349120726" target="_blank" rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-center text-sm hover:bg-green-400">
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
