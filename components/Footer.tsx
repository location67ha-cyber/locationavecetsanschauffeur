import Link from 'next/link'
import { Phone, MapPin, Car } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="font-bold">Location Voiture Madagascar</div>
              <div className="text-yellow-400 text-sm">Avec ou Sans Chauffeur</div>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            ANDRIANASOLO Volandrato<br />
            Location de véhicules à Madagascar depuis plusieurs années.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-yellow-400 mb-4">Navigation</h3>
          <div className="flex flex-col gap-2 text-sm text-gray-300">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link href="/vehicules" className="hover:text-white transition-colors">Nos Voitures</Link>
            <Link href="/reserver" className="hover:text-white transition-colors">Réserver</Link>
            <Link href="/infos" className="hover:text-white transition-colors">Infos & Conditions</Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-yellow-400 mb-4">Contact</h3>
          <div className="flex flex-col gap-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-yellow-400" />
              <span>034 91 207 26</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-yellow-400" />
              <span>67 Ha Nord Ouest, Antananarivo</span>
            </div>
            <a
              href="https://wa.me/+261349120726"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg text-center font-semibold transition-colors mt-2"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-green-700 text-center py-4 text-sm text-gray-400">
        © {new Date().getFullYear()} Location Voiture Madagascar — Tous droits réservés
      </div>
    </footer>
  )
}
