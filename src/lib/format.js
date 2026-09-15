const PESO = '₱';

export function money(amount) {
  const value = Number(amount) || 0;
  return `${PESO}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function moneyShort(amount) {
  const value = Number(amount) || 0;
  return `${PESO}${value.toLocaleString('en-US')}`;
}

export function runtime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

// Accepts a YYYY-MM-DD key and formats it without timezone drift.
function parseKey(dateKey) {
  const [y, m, d] = String(dateKey).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function longDate(dateKey) {
  return parseKey(dateKey).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function shortDate(dateKey) {
  return parseKey(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function releaseLabel(dateKey) {
  return parseKey(dateKey).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function weekdayShort(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function clockTime(time24) {
  const [h, m] = String(time24).split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export function timestamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

// Booking references look like CH-4K7QX2.
export function bookingCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `CH-${code}`;
}

export function maskAccount(value) {
  const clean = String(value || '').replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  return `${'•'.repeat(Math.min(clean.length - 4, 12))}${clean.slice(-4)}`;
}
