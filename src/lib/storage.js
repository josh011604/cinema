// Thin, crash proof wrapper around localStorage. Browsers can throw when
// storage is disabled (private windows, blocked site data), so every access is
// guarded and falls back to an in-memory map for the current page load.

const memory = new Map();

function available() {
  try {
    const probe = '__cinema_house_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const canUseStorage = typeof window !== 'undefined' && available();

export function readJSON(key, fallback) {
  try {
    const raw = canUseStorage ? window.localStorage.getItem(key) : memory.get(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    const raw = JSON.stringify(value);
    if (canUseStorage) {
      window.localStorage.setItem(key, raw);
    } else {
      memory.set(key, raw);
    }
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  try {
    if (canUseStorage) {
      window.localStorage.removeItem(key);
    } else {
      memory.delete(key);
    }
  } catch {
    /* nothing we can do */
  }
}

export const STORAGE_KEYS = {
  bookings: 'cinemahouse.bookings',
  movies: 'cinemahouse.movies',
  admin: 'cinemahouse.admin.session',
  draft: 'cinemahouse.checkout.draft'
};
