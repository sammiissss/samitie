import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Events', path: '/events' },
  { name: 'Donate', path: '/donate' },
  { name: 'Contact', path: '/contact' },
]

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div>
          <p className="bg-gradient-to-r from-churchBlue to-blue-700 bg-clip-text text-lg font-extrabold text-transparent">
            Fares Evangelical Belivers International Church
          </p>
        </div>
        <ul className="flex items-center gap-2 text-sm font-semibold">
          {links.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-churchBlue to-blue-700 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
          {user ? (
            <li>
              <button
                type="button"
                onClick={logout}
                className="rounded-full px-4 py-2 text-slate-700 transition duration-200 hover:bg-slate-100"
              >
                Logout
              </button>
            </li>
          ) : (
            <li>
              <NavLink
                to="/login"
                className="rounded-full px-4 py-2 text-slate-700 transition duration-200 hover:bg-slate-100"
              >
                Login
              </NavLink>
            </li>
          )}
        </ul>
        <div className="w-8 h-8 bg-gradient-to-r from-churchBlue to-blue-700 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">✝</span>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
