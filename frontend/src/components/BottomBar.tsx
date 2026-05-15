import './BottomBar.css';

function BottomBar() {
  return (
    <section className="bottom-bar">
      <div className="bottom-bar__inner">
        <div className="bottom-bar__item">
          <div className="rating-badge" aria-label="Calificación de viajeros">
            <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">
              <circle cx="20" cy="20" r="18" fill="#00aa6c" />
              <circle cx="14" cy="20" r="5" fill="white" />
              <circle cx="26" cy="20" r="5" fill="white" />
              <circle cx="14" cy="20" r="2" fill="#00aa6c" />
              <circle cx="26" cy="20" r="2" fill="#00aa6c" />
            </svg>
            <div className="rating-dots">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className="rating-dot rating-dot--full" />
              ))}
              <span className="rating-dot rating-dot--half" />
            </div>
          </div>
          <div className="bottom-bar__text">
            <strong>4,6</strong> (2327)
            <span className="bottom-bar__sep">•</span>
            <a href="#reviews" className="bottom-bar__link">Leer reseñas</a>
          </div>
        </div>

        <div className="bottom-bar__item">
          <span className="bottom-bar__label">Llamar</span>
          <a href="tel:+576016006100" className="bottom-bar__link bottom-bar__link--strong">
            +57 601 6006100
          </a>
        </div>

        <div className="bottom-bar__item">
          <span className="bottom-bar__label">Correo electrónico</span>
          <a href="mailto:bogota.reservations@stayra.com" className="bottom-bar__link bottom-bar__link--strong">
            bogota.reservations@stayra.com
          </a>
        </div>

        <div className="bottom-bar__item bottom-bar__item--checkin">
          <div className="checkin-block">
            <span className="bottom-bar__label">Check-in</span>
            <span className="checkin-time">15:00 h</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          <div className="checkin-block">
            <span className="bottom-bar__label">Check-out</span>
            <span className="checkin-time">12:00 h</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BottomBar;
