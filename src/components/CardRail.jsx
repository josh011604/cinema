import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

// Horizontal rail with the round scroll buttons used on the home page.
export default function CardRail({ children }) {
  const railRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = railRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, children]);

  const scrollBy = (direction) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.8, 240), behavior: 'smooth' });
  };

  return (
    <div className="rail">
      <div className="rail__track" ref={railRef}>
        {children}
      </div>
      {canScrollLeft ? (
        <button type="button" className="rail__nav rail__nav--prev" onClick={() => scrollBy(-1)} aria-label="Scroll left">
          <Icon name="arrowLeft" size={18} />
        </button>
      ) : null}
      {canScrollRight ? (
        <button type="button" className="rail__nav rail__nav--next" onClick={() => scrollBy(1)} aria-label="Scroll right">
          <Icon name="arrowRight" size={18} />
        </button>
      ) : null}
    </div>
  );
}
