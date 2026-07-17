'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErreur('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push('/admin')
      } else {
        setErreur(data.message || 'Identifiants incorrects')
      }
    } catch {
      setErreur('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-green-800 p-4 rounded-full">
              <Car className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-green-800">Espace Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Location Voiture Madagascar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">Identifiant</label>
            <input className="input-field" placeholder="admin" value={username}
              onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input type="password" className="input-field" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} required />
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              ❌ {erreur}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 text-center">
          Accès réservé à l'administrateur
        </div>
      </div>
    </div>
  )
}
