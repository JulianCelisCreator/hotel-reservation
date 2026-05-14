import './IVANotice.css';

function IVANotice() {
  return (
    <div className="iva-notice">
      <div className="iva-notice__inner">
        <svg
          className="iva-notice__icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="iva-notice__text">
          <strong>Aviso sobre IVA</strong>
        </span>
        <a href="#iva" className="iva-notice__link">Leer mensaje</a>
      </div>
    </div>
  );
}

export default IVANotice;
