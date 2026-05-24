import { useRef, useState } from 'react';
import './HotelInfoBar.css';

interface Props {
  nombre: string;
  direccion?: string | null;
  fechaInicio: string;
  fechaFin: string;
  onFechaInicio: (v: string) => void;
  onFechaFin: (v: string) => void;
  onConsultar: () => void;
  cargando?: boolean;
}

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const WEEKDAYS = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

function parseDateParts(iso: string): { day: string; month: string; weekday: string } {
  if (!iso) return { day: '--', month: '---', weekday: '---' };
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return {
    day: String(d).padStart(2, '0'),
    month: MONTHS[m - 1] ?? '---',
    weekday: WEEKDAYS[date.getDay()] ?? '---',
  };
}

function openPicker(ref: React.RefObject<HTMLInputElement | null>) {
  const el = ref.current;
  if (!el) return;
  el.focus();
  // showPicker es lo más fiable. Algunos navegadores antiguos no lo soportan: fallback click.
  if (typeof el.showPicker === 'function') {
    try {
      el.showPicker();
      return;
    } catch {
      /* algunos browsers tiran si no es user gesture */
    }
  }
  el.click();
}

function HotelInfoBar({
  nombre,
  direccion,
  fechaInicio,
  fechaFin,
  onFechaInicio,
  onFechaFin,
  onConsultar,
  cargando,
}: Props) {
  const inicio = parseDateParts(fechaInicio);
  const fin = parseDateParts(fechaFin);
  const inicioRef = useRef<HTMLInputElement>(null);
  const finRef = useRef<HTMLInputElement>(null);
  const [habitaciones, setHabitaciones] = useState(1);
  const [huespedes, setHuespedes] = useState(1);
  const [guestOpen, setGuestOpen] = useState(false);

  return (
    <section className="hotel-info">
      <div className="hotel-info__inner">
        <div className="hotel-info__left">
          <h1 className="hotel-info__name">{nombre}</h1>
          {direccion && (
            <a href="#ubicacion" className="hotel-info__address">
              {direccion}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>

        <div className="hotel-info__center">
          <button
            type="button"
            className="date-picker"
            onClick={() => openPicker(inicioRef)}
            aria-label="Cambiar fecha de entrada"
          >
            <div className="date-block">
              <span className="date-block__day">{inicio.day}</span>
              <div className="date-block__meta">
                <span className="date-block__month">{inicio.month}</span>
                <span className="date-block__weekday">{inicio.weekday}</span>
              </div>
            </div>
            <input
              ref={inicioRef}
              type="date"
              value={fechaInicio}
              onChange={(e) => onFechaInicio(e.target.value)}
              className="date-picker__input"
              tabIndex={-1}
            />
          </button>

          <div className="date-divider" />

          <button
            type="button"
            className="date-picker"
            onClick={() => openPicker(finRef)}
            aria-label="Cambiar fecha de salida"
          >
            <div className="date-block">
              <span className="date-block__day">{fin.day}</span>
              <div className="date-block__meta">
                <span className="date-block__month">{fin.month}</span>
                <span className="date-block__weekday">{fin.weekday}</span>
              </div>
            </div>
            <input
              ref={finRef}
              type="date"
              value={fechaFin}
              min={fechaInicio}
              onChange={(e) => onFechaFin(e.target.value)}
              className="date-picker__input"
              tabIndex={-1}
            />
          </button>

          <div className="guest-wrapper">
            <button
              type="button"
              className="guest-btn"
              onClick={() => setGuestOpen((o) => !o)}
              aria-expanded={guestOpen}
            >
              {habitaciones} habitación{habitaciones === 1 ? '' : 'es'}, {huespedes} huésped
              {huespedes === 1 ? '' : 'es'}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8L2 4h8L6 8z" />
              </svg>
            </button>
            {guestOpen && (
              <div className="guest-popover" role="dialog">
                <div className="guest-popover__row">
                  <span>Habitaciones</span>
                  <div className="guest-popover__controls">
                    <button
                      type="button"
                      onClick={() => setHabitaciones((v) => Math.max(1, v - 1))}
                      aria-label="Menos habitaciones"
                    >
                      −
                    </button>
                    <span>{habitaciones}</span>
                    <button
                      type="button"
                      onClick={() => setHabitaciones((v) => v + 1)}
                      aria-label="Más habitaciones"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="guest-popover__row">
                  <span>Huéspedes</span>
                  <div className="guest-popover__controls">
                    <button
                      type="button"
                      onClick={() => setHuespedes((v) => Math.max(1, v - 1))}
                      aria-label="Menos huéspedes"
                    >
                      −
                    </button>
                    <span>{huespedes}</span>
                    <button
                      type="button"
                      onClick={() => setHuespedes((v) => v + 1)}
                      aria-label="Más huéspedes"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="guest-popover__close"
                  onClick={() => setGuestOpen(false)}
                >
                  Listo
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="hotel-info__right">
          <button type="button" className="btn btn--outline">
            Tarifas especiales
          </button>
          <button type="button" className="btn btn--primary" onClick={onConsultar} disabled={cargando}>
            {cargando ? 'Buscando…' : 'Consultar habitaciones y tarifas'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default HotelInfoBar;
