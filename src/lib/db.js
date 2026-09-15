// Converts between database rows (snake_case) and the objects the website
// uses (camelCase), so pages never deal with column names.

import { HALL_IDS } from '../data/halls.js';
import { MOVIES } from '../data/movies.js';

// Films from the starter catalog ship their poster art with the website, so
// the database only stores a URL for posters uploaded in the admin.
const BUNDLED_POSTERS = Object.fromEntries(MOVIES.filter((m) => m.poster).map((m) => [m.id, m.poster]));

const toNumberOrNull = (value) => (value === null || value === undefined || value === '' ? null : Number(value));

// Cinema House has no 3D hall, so only IMAX and 2D are kept.
const SUPPORTED_FORMATS = ['IMAX', '2D'];
const cleanFormats = (list) => (Array.isArray(list) ? list : []).filter((f) => SUPPORTED_FORMATS.includes(f));

// Keeps only complete screenings in known rooms, as plain { date, time, hallId }.
function cleanScreenings(list) {
  return (Array.isArray(list) ? list : [])
    .filter(
      (s) =>
        s && HALL_IDS.includes(s.hallId) && /^\d{4}-\d{2}-\d{2}$/.test(s.date || '') && /^\d{2}:\d{2}$/.test(s.time || '')
    )
    .map(({ date, time, hallId }) => ({ date, time, hallId }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.hallId.localeCompare(b.hallId));
}

export function movieFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    genres: row.genres || [],
    ageRating: row.age_rating,
    duration: row.duration,
    year: row.year,
    score: toNumberOrNull(row.score),
    director: row.director || '',
    cast: row.cast_members || [],
    format: cleanFormats(row.format),
    screenings: cleanScreenings(row.screenings),
    halls: row.halls || [],
    status: row.status,
    releaseDate: row.release_date || undefined,
    tagline: row.tagline || '',
    synopsis: row.synopsis || '',
    art: row.art || undefined,
    posterUrl: row.poster_url || null,
    poster: row.poster_url || BUNDLED_POSTERS[row.id] || undefined,
    sortOrder: row.sort_order ?? 0
  };
}

export function movieToRow(movie) {
  const score = toNumberOrNull(movie.score);
  const year = toNumberOrNull(movie.year);
  const screenings = cleanScreenings(movie.screenings);
  return {
    id: movie.id,
    title: movie.title,
    genres: movie.genres || [],
    age_rating: movie.ageRating,
    duration: Number(movie.duration),
    year: Number.isFinite(year) ? year : null,
    score: Number.isFinite(score) ? score : null,
    director: movie.director || '',
    cast_members: movie.cast || [],
    format: cleanFormats(movie.format),
    screenings,
    // The rooms a film plays in follow from its screenings.
    halls: [...new Set(screenings.map((s) => s.hallId))],
    status: movie.status,
    release_date: movie.releaseDate || null,
    tagline: movie.tagline || '',
    synopsis: movie.synopsis || '',
    poster_url: movie.posterUrl || null,
    art: movie.art || null,
    sort_order: movie.sortOrder ?? 0
  };
}

export function bookingFromRow(row) {
  return {
    code: row.code,
    movieId: row.movie_id,
    movieTitle: row.movie_title,
    showtimeId: row.showtime_id,
    date: row.show_date,
    time: row.show_time,
    hallId: row.hall_id,
    hallName: row.hall_name,
    format: row.format,
    seats: row.seats || [],
    customer: row.customer || {},
    payment: row.payment || {},
    subtotal: Number(row.subtotal),
    fees: Number(row.fees),
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at
  };
}
