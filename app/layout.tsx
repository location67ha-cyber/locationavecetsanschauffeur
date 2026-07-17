import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Location Voiture Madagascar — Avec ou Sans Chauffeur',
  description: 'Location de voiture à Madagascar avec ou sans chauffeur. Réservation en ligne, tarifs transparents.',
  keywords: 'location voiture madagascar, avec chauffeur, sans chauffeur, antananarivo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
