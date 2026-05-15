import { useState } from 'react';
import './Gallery.css';

const slides = [
  {
    src: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1400&q=80',
    alt: 'Gimnasio del hotel',
  },
  {
    src: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1400&q=80',
    alt: 'Lobby principal',
  },
  {
    src: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1400&q=80',
    alt: 'Habitación con vista',
  },
  {
    src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80',
    alt: 'Suite ejecutiva',
  },
  {
    src: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1400&q=80',
    alt: 'Habitación de lujo',
  },
];

function Gallery() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  // Show 3 visible slides centered on current index
  const getSlide = (offset: number) => {
    const i = (index + offset + slides.length) % slides.length;
    return slides[i];
  };

  return (
    <section className="gallery" aria-label="Galería del hotel">
      <button className="gallery__arrow gallery__arrow--prev" onClick={prev} aria-label="Imagen anterior">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="gallery__track">
        <div className="gallery__slide gallery__slide--side">
          <img src={getSlide(-1).src} alt={getSlide(-1).alt} loading="lazy" />
        </div>
        <div className="gallery__slide gallery__slide--main">
          <img src={getSlide(0).src} alt={getSlide(0).alt} />
          <div className="gallery__counter">
            {index + 1}/{slides.length}
          </div>
        </div>
        <div className="gallery__slide gallery__slide--side">
          <img src={getSlide(1).src} alt={getSlide(1).alt} loading="lazy" />
        </div>
      </div>

      <button className="gallery__arrow gallery__arrow--next" onClick={next} aria-label="Siguiente imagen">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </section>
  );
}

export default Gallery;
