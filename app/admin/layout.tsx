import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Car, LayoutDashboard, Calendar, Wrench, FileText, Settings, LogOut, List } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const auth = cookieStore.get('admin_auth')

  if (!auth || auth.value !== 'true') {
    redirect('/admin/login')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/admin/reservations', label: 'Réservations', icon: <List className="w-4 h-4" /> },
    { href: '/admin/vehicules', label: 'Véhicules', icon: <Car className="w-4 h-4" /> },
    { href: '/admin/planning', label: 'Planning', icon: <Calendar className="w-4 h-4" /> },
    { href: '/admin/maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
    { href: '/admin/factures', label: 'Factures', icon: <FileText className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-green-900 text-white flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-green-700">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="font-bold text-sm">Location Voiture</div>
              <div className="text-yellow-400 text-xs">Madagascar — Admin</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-green-700">
          <form action="/api/auth/login" method="DELETE">
            <Link href="/api/auth/logout"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm text-red-300 hover:text-white">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Link>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
