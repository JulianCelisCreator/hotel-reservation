import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight">
          HotelRes
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isAdmin ? (
                <Link
                  to="/admin/reservas"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  Administrar reservas
                </Link>
              ) : (
                <Link
                  to="/mis-reservas"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  Mis reservas
                </Link>
              )}
              <span className="text-sm text-gray-500 hidden sm:inline">
                Hola, {user.nombre_completo.split(' ')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
