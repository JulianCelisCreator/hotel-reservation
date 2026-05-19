import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

interface NavItem {
  label: string;
  to: string;
}

const navItemsBase: NavItem[] = [
  { label: 'Inicio', to: '/' },
  { label: 'Habitaciones', to: '/#habitaciones' },
  { label: 'Información del hotel', to: '/#info' },
  { label: 'Ofertas', to: '/#ofertas' },
  { label: 'Galería', to: '/#galeria' },
  { label: 'Ubicación', to: '/#ubicacion' },
  { label: 'Restaurantes', to: '/#restaurantes' },
  { label: 'Eventos', to: '/#eventos' },
];

function Navigation() {
  const { user, isAdmin } = useAuth();
  const items: NavItem[] = [...navItemsBase];
  if (user) {
    items.push(
      isAdmin
        ? { label: 'Administrar reservas', to: '/admin/reservas' }
        : { label: 'Mis reservas', to: '/mis-reservas' },
    );
  }

  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link to="/" className="logo" aria-label="Inicio">
          <span className="logo__mark">UD</span>
          <span className="logo__dot">·</span>
        </Link>

        <ul className="nav__list">
          {items.map((item, idx) => (
            <li key={item.label + idx} style={{ animationDelay: `${idx * 40}ms` }}>
              <Link to={item.to} className="nav__link">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
