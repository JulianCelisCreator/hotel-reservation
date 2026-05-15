import './Navigation.css';

const navItems = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Habitaciones', href: '#habitaciones' },
  { label: 'Información del hotel', href: '#info' },
  { label: 'Ofertas', href: '#ofertas' },
  { label: 'Galería', href: '#galeria' },
  { label: 'Ubicación', href: '#ubicacion' },
  { label: 'Restaurantes', href: '#restaurantes' },
  { label: 'Eventos', href: '#eventos' },
];

function Navigation() {
  return (
    <nav className="nav">
      <div className="nav__inner">
        <a href="/" className="logo" aria-label="Inicio">
          <span className="logo__mark">UD</span>
          <span className="logo__dot">·</span>
        </a>

        <ul className="nav__list">
          {navItems.map((item, idx) => (
            <li key={item.label} style={{ animationDelay: `${idx * 40}ms` }}>
              <a href={item.href} className="nav__link">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
