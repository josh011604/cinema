// A film shows its real poster when one is bundled (`movie.poster`).
// Otherwise the artwork is drawn, not downloaded: each film carries a small
// `art` description (two gradient stops, an accent and a motif) and this
// component turns it into an SVG key visual, so the project stays self
// contained and works offline.

function Motif({ motif, accent }) {
  switch (motif) {
    case 'blast':
      return (
        <g stroke={accent} fill="none">
          <circle cx="150" cy="200" r="42" opacity="0.9" strokeWidth="2" />
          <circle cx="150" cy="200" r="70" opacity="0.5" strokeWidth="1.5" />
          <circle cx="150" cy="200" r="102" opacity="0.28" strokeWidth="1.2" />
          <circle cx="150" cy="200" r="140" opacity="0.15" strokeWidth="1" />
          <circle cx="150" cy="200" r="18" fill={accent} stroke="none" opacity="0.95" />
        </g>
      );
    case 'ruins':
      return (
        <g fill={accent}>
          <path d="M0 450 L0 300 L40 300 L40 250 L80 250 L80 320 L120 320 L120 210 L160 210 L160 330 L200 330 L200 265 L240 265 L240 305 L300 305 L300 450 Z" opacity="0.35" />
          <path d="M0 450 L0 360 L60 360 L60 330 L110 330 L110 380 L170 380 L170 340 L230 340 L230 375 L300 375 L300 450 Z" opacity="0.6" />
        </g>
      );
    case 'bubbles':
      return (
        <g fill={accent}>
          <circle cx="80" cy="150" r="46" opacity="0.55" />
          <circle cx="190" cy="120" r="30" opacity="0.4" />
          <circle cx="215" cy="235" r="52" opacity="0.5" />
          <circle cx="105" cy="285" r="36" opacity="0.35" />
          <circle cx="150" cy="195" r="20" opacity="0.7" />
        </g>
      );
    case 'neon':
      return (
        <g stroke={accent} strokeWidth="6" strokeLinecap="round">
          <path d="M40 380 L120 120" opacity="0.75" />
          <path d="M110 400 L190 140" opacity="0.45" />
          <path d="M180 390 L255 150" opacity="0.6" />
          <circle cx="150" cy="215" r="60" fill="none" strokeWidth="3" opacity="0.5" />
        </g>
      );
    case 'dunes':
      return (
        <g fill={accent}>
          <path d="M0 450 C 70 330, 150 400, 300 300 L300 450 Z" opacity="0.5" />
          <path d="M0 450 C 90 400, 170 440, 300 370 L300 450 Z" opacity="0.75" />
          <circle cx="205" cy="130" r="34" opacity="0.85" />
        </g>
      );
    case 'waves':
      return (
        <g stroke={accent} fill="none" strokeWidth="3">
          <path d="M-10 250 C 60 220, 100 290, 160 255 S 260 215, 320 250" opacity="0.8" />
          <path d="M-10 290 C 60 260, 100 330, 160 295 S 260 255, 320 290" opacity="0.55" />
          <path d="M-10 330 C 60 300, 100 370, 160 335 S 260 295, 320 330" opacity="0.35" />
          <circle cx="150" cy="150" r="40" opacity="0.5" />
        </g>
      );
    case 'signal':
      return (
        <g stroke={accent} fill="none">
          <circle cx="150" cy="230" r="12" fill={accent} stroke="none" />
          <path d="M108 188 a60 60 0 010 84" strokeWidth="3" opacity="0.8" />
          <path d="M192 188 a60 60 0 000 84" strokeWidth="3" opacity="0.8" />
          <path d="M82 162 a96 96 0 010 136" strokeWidth="2.4" opacity="0.5" />
          <path d="M218 162 a96 96 0 000 136" strokeWidth="2.4" opacity="0.5" />
          <path d="M56 136 a132 132 0 010 188" strokeWidth="2" opacity="0.28" />
          <path d="M244 136 a132 132 0 000 188" strokeWidth="2" opacity="0.28" />
        </g>
      );
    case 'city':
    default:
      return (
        <g fill={accent}>
          <path d="M0 450 L0 280 L45 280 L45 200 L85 200 L85 300 L130 300 L130 160 L175 160 L175 320 L220 320 L220 230 L265 230 L265 290 L300 290 L300 450 Z" opacity="0.45" />
          <g opacity="0.9">
            <rect x="52" y="220" width="6" height="10" />
            <rect x="140" y="185" width="6" height="10" />
            <rect x="140" y="215" width="6" height="10" />
            <rect x="228" y="250" width="6" height="10" />
          </g>
        </g>
      );
  }
}

export default function Poster({ movie, className = '' }) {
  const art = movie.art || { from: '#2a1215', to: '#0b0b0b', accent: '#a8101c', motif: 'city' };
  const gradientId = `poster-${movie.id}`;

  // Real artwork already carries the title, so it gets no caption overlay -
  // only the generated SVG posters need one.
  if (movie.poster) {
    return (
      <div className={`poster ${className}`.trim()}>
        <img src={movie.poster} alt={`${movie.title} poster`} loading="lazy" />
      </div>
    );
  }

  return (
    <div className={`poster ${className}`.trim()}>
      <svg viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${movie.title} poster`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor={art.from} />
            <stop offset="100%" stopColor={art.to} />
          </linearGradient>
          <radialGradient id={`${gradientId}-glow`} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor={art.accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={art.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="300" height="450" fill={`url(#${gradientId})`} />
        <rect width="300" height="450" fill={`url(#${gradientId}-glow)`} />
        <Motif motif={art.motif} accent={art.accent} />
        <rect y="300" width="300" height="150" fill="#05050a" opacity="0.55" />
      </svg>
      <div className="poster__caption">
        <span className="poster__title">{movie.title}</span>
        {movie.format?.length ? <span className="poster__format">{movie.format.join(' · ')}</span> : null}
      </div>
    </div>
  );
}
