// One small stroke based icon set so the whole site keeps a single visual
// language and never depends on an external icon package.

const PATHS = {
  play: <path d="M7 4.5v15l13-7.5z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 8.5A2 2 0 015 6.5h14a2 2 0 012 2v1.2a2.3 2.3 0 000 4.6v1.2a2 2 0 01-2 2H5a2 2 0 01-2-2v-1.2a2.3 2.3 0 000-4.6z" />
      <path d="M14 7v10" strokeDasharray="2 2.5" />
    </>
  ),
  screen: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="1.6" />
      <path d="M8.5 20h7M12 16.5V20" />
    </>
  ),
  sound: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
      <path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" />
    </>
  ),
  seat: (
    <>
      <path d="M6 11V7.5A2.5 2.5 0 018.5 5h7A2.5 2.5 0 0118 7.5V11" />
      <path d="M4.5 11h15a1.5 1.5 0 011.5 1.5V17H3v-4.5A1.5 1.5 0 014.5 11z" />
      <path d="M6 17v2.5M18 17v2.5" />
    </>
  ),
  cup: (
    <>
      <path d="M6 6h11l-1 12.5A2 2 0 0114 20.5h-5a2 2 0 01-2-1.9z" />
      <path d="M17 8.5h1.8a2.2 2.2 0 010 4.4H16.6" />
      <path d="M9 3.5v1.6M12.5 3v2" />
    </>
  ),
  car: (
    <>
      <path d="M4 16v-3.2L5.8 8A2 2 0 017.7 6.7h8.6A2 2 0 0118.2 8L20 12.8V16" />
      <path d="M3.5 16h17v2.5h-3V16h-11v2.5h-3z" />
      <path d="M7 12.8h10" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.6" />
      <path d="M10 3.5v3.5M14 3.5v3.5M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5" />
    </>
  ),
  popcorn: (
    <>
      <path d="M7 9l1.5 11h7L17 9z" />
      <path d="M7 9a2 2 0 011.6-2.4A2.2 2.2 0 0112 5a2.2 2.2 0 013.4 1.6A2 2 0 0117 9" />
      <path d="M10.5 9v11M13.5 9v11" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l1 12.2A1.8 1.8 0 009.3 21h5.4a1.8 1.8 0 001.8-1.8L17.5 7" />
      <path d="M10.5 11v6M13.5 11v6" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19 9a2.1 2.1 0 00-3-3L5 17z" />
      <path d="M15 6l3 3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  logout: (
    <>
      <path d="M14 4.5H6.5A1.5 1.5 0 005 6v12a1.5 1.5 0 001.5 1.5H14" />
      <path d="M17 8.5l3.5 3.5L17 15.5M20 12h-9" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.4" />
      <rect x="13" y="4" width="7" height="7" rx="1.4" />
      <rect x="4" y="13" width="7" height="7" rx="1.4" />
      <rect x="13" y="13" width="7" height="7" rx="1.4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V6M17 20v-9" />
    </>
  ),
  film: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M8 4.5v15M16 4.5v15M3.5 9.5h4.5M3.5 14.5h4.5M16 9.5h4.5M16 14.5h4.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  phone: <path d="M7 3.5l2.5 4-2 2a12 12 0 005 5l2-2 4 2.5V19a1.8 1.8 0 01-2 1.8C9.5 20.2 3.8 14.5 3.2 5.5A1.8 1.8 0 015 3.5z" />,
  pin: (
    <>
      <path d="M12 21s6.5-6 6.5-10.5a6.5 6.5 0 10-13 0C5.5 15 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2" />
      <path d="M8 10V7.5a4 4 0 018 0V10" />
    </>
  ),
  wallet: (
    <>
      <path d="M3.5 7.5A2 2 0 015.5 5.5h11a2 2 0 012 2v1" />
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
      <circle cx="16.5" cy="13.5" r="1.3" />
    </>
  ),
  bank: (
    <>
      <path d="M3.5 9.5L12 4l8.5 5.5" />
      <path d="M5.5 9.5v8M9.5 9.5v8M14.5 9.5v8M18.5 9.5v8M3 20.5h18" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 10h18M6.5 14.5h4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5l7 2.6v5.3c0 4.4-2.9 8-7 9.1-4.1-1.1-7-4.7-7-9.1V6.1z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v4.9M12 16.2v.01" />
    </>
  ),
  star: <path d="M12 4l2.4 5.1 5.6.7-4.1 3.9 1.1 5.5L12 16.6 6.9 19.2 8 13.7 4 9.8l5.6-.7z" />,
  arrowRight: <path d="M5 12h13M13 6.5l5.5 5.5L13 17.5" />,
  arrowLeft: <path d="M19 12H6M11 6.5L5.5 12 11 17.5" />,
  chevronDown: <path d="M6.5 9.5L12 15l5.5-5.5" />,
  printer: (
    <>
      <path d="M7 9V4.5h10V9" />
      <rect x="3.5" y="9" width="17" height="7.5" rx="1.8" />
      <path d="M7 14h10v5.5H7z" />
    </>
  ),
  facebook: <path d="M14.5 8.5H17V5h-2.6C11.8 5 10.5 6.6 10.5 9v2H8v3.5h2.5V21H14v-6.5h2.4l.6-3.5H14V9.4c0-.6.2-.9.5-.9z" />,
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.8" cy="7.2" r="0.9" />
    </>
  ),
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3.5" />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" />
    </>
  ),
  send: <path d="M4 12l16-7-6 16-3-6.5z" />
};

export default function Icon({ name, size = 20, className = '', filled = false, ...rest }) {
  const glyph = PATHS[name];
  if (!glyph) return null;
  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {glyph}
    </svg>
  );
}
