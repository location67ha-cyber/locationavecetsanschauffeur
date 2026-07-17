'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Car } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-green-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Car className="w-7 h-7 text-yellow-400" />
            <div className="leading-tight">
              <div className="text-white text-sm font-bold">Location Voiture</div>
              <div className="text-yellow-400 text-xs">Madagascar</div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-yellow-400 transition-colors text-sm font-medium">Accueil</Link>
            <Link href="/vehicules" className="hover:text-yellow-400 transition-colors text-sm font-medium">Nos Voitures</Link>
            <Link href="/reserver" className="hover:text-yellow-400 transition-colors text-sm font-medium">Réserver</Link>
            <Link href="/infos" className="hover:text-yellow-400 transition-colors text-sm font-medium">Infos & Tarifs</Link>
            <Link href="/reserver" className="bg-yellow-400 text-green-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 transition-colors">
              Réserver maintenant
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <Link href="/" onClick={() => setOpen(false)} className="hover:text-yellow-400 py-2">Accueil</Link>
            <Link href="/vehicules" onClick={() => setOpen(false)} className="hover:text-yellow-400 py-2">Nos Voitures</Link>
            <Link href="/reserver" onClick={() => setOpen(false)} className="hover:text-yellow-400 py-2">Réserver</Link>
            <Link href="/infos" onClick={() => setOpen(false)} className="hover:text-yellow-400 py-2">Infos & Tarifs</Link>
            <Link href="/reserver" onClick={() => setOpen(false)} className="bg-yellow-400 text-green-900 px-4 py-2 rounded-lg font-bold text-center">
              Réserver maintenant
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
