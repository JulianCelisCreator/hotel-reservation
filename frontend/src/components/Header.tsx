import './Header.css';

interface HeaderProps {
  language: 'es' | 'en';
}

function Header({ language }: HeaderProps) {
  return (
    <header className="top-header">
      <div className="top-header__inner">
        <button className="menu-btn" aria-label="Abrir menú">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="top-header__right">
          <div className="language-selector">
            <span className="language-label">Idioma:</span>
            <button className="language-btn">
              {language === 'es' ? 'Español' : 'English'}
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8L2 4h8L6 8z" />
              </svg>
            </button>
          </div>

          <button className="stays-btn">
            Sus estadías
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <circle cx="16" cy="16" r="3" />
              <line x1="18.5" y1="18.5" x2="21" y2="21" />
            </svg>
          </button>

          <div className="auth-links">
            <a href="#signup" className="auth-link">Inscríbase</a>
            <span className="auth-sep">|</span>
            <a href="#login" className="auth-link">Iniciar sesión</a>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="10" r="3" />
              <path d="M6.5 19c1.5-3 4-4 5.5-4s4 1 5.5 4" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
