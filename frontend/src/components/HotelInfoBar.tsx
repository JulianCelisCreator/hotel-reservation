import './HotelInfoBar.css';

function HotelInfoBar() {
  return (
    <section className="hotel-info">
      <div className="hotel-info__inner">
        <div className="hotel-info__left">
          <h1 className="hotel-info__name">UD Bogotá</h1>
          <a href="#location" className="hotel-info__address">
            Carrera 7 No. 72-41, Bogotá, Colombia
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        <div className="hotel-info__center">
          <div className="date-block">
            <span className="date-block__day">14</span>
            <div className="date-block__meta">
              <span className="date-block__month">MAY</span>
              <span className="date-block__weekday">JUE</span>
            </div>
          </div>
          <div className="date-divider" />
          <div className="date-block">
            <span className="date-block__day">15</span>
            <div className="date-block__meta">
              <span className="date-block__month">MAY</span>
              <span className="date-block__weekday">VIE</span>
            </div>
          </div>

          <button className="guest-btn">
            1 habitación, 1 huésped
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 8L2 4h8L6 8z" />
            </svg>
          </button>
        </div>

        <div className="hotel-info__right">
          <button className="btn btn--outline">Tarifas especiales</button>
          <button className="btn btn--primary">Consultar habitaciones y tarifas</button>
        </div>
      </div>
    </section>
  );
}

export default HotelInfoBar;
