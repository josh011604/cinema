import { HALLS } from './halls.js';

// Screenings are scheduled by the admin: each film stores a list of
// { date, time, hallId } entries. The website works out when every screening
// ends from the film's runtime, and keeps the room free for a cleaning break
// before the next screening in it can start.

// The crew needs the hall to itself for ten minutes once the credits roll.
export const CLEANING_MINUTES = 10;

// Doors open at 09:30, so that is the earliest start time the admin is offered.
export const OPENING_TIME = '09:30';

const MINUTES_PER_DAY = 24 * 60;

const pad = (value) => String(value).padStart(2, '0');

export const toMinutes = (clock) => {
  const [h, m] = String(clock).split(':').map(Number);
  return h * 60 + m;
};

export const toClock = (minutes) => {
  const value = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${pad(Math.floor(value / 60))}:${pad(value % 60)}`;
};

// Suggested starts land on five minute marks, like a printed schedule.
export const roundUpToFive = (minutes) => Math.ceil(minutes / 5) * 5;

// When the credits end. `nextDay` flags a late show that finishes after midnight.
export function screeningEnd(time, duration) {
  const end = toMinutes(time) + (Number(duration) || 0);
  return { time: toClock(end), nextDay: end >= MINUTES_PER_DAY };
}

// How long a screening occupies its room: from the start until the credits
// end plus the cleaning break.
export function screeningWindow(time, duration) {
  const start = toMinutes(time);
  return { start, end: start + (Number(duration) || 0) + CLEANING_MINUTES };
}

export const windowsOverlap = (a, b) => a.start < b.end && b.start < a.end;

// Earliest start (not before `notBefore`) at which a film of `duration` minutes
// fits around the screenings already in that room on that day. `busy` is a list
// of { time, duration }. Returns '' when nothing fits before midnight.
export function suggestStartTime(busy, duration, notBefore = OPENING_TIME) {
  const windows = busy
    .filter((item) => item.time)
    .map((item) => screeningWindow(item.time, item.duration))
    .sort((a, b) => a.start - b.start);
  const length = (Number(duration) || 0) + CLEANING_MINUTES;

  let start = roundUpToFive(toMinutes(notBefore));
  let moved = true;
  while (moved) {
    moved = false;
    windows.forEach((window) => {
      if (windowsOverlap({ start, end: start + length }, window)) {
        start = roundUpToFive(window.end);
        moved = true;
      }
    });
  }

  return start < MINUTES_PER_DAY ? toClock(start) : '';
}

// Mornings are cheaper and evenings carry a premium. These adjust the admin's
// seat prices: shows before 12:00 are 8% off, shows from 17:00 cost 15% more.
export const MORNING_FACTOR = 0.92;
export const EVENING_FACTOR = 1.15;

export function priceFactorFor(startMinutes) {
  if (startMinutes < 12 * 60) return MORNING_FACTOR;
  if (startMinutes < 17 * 60) return 1;
  return EVENING_FACTOR;
}

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}-${m}-${d}`;
}

export function upcomingDates(days = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

// Stable id for one screening (movie + date + time + hall). Sold seats are
// recorded against it, so a screening with bookings must not be moved.
export const showtimeId = (movieId, screening) =>
  `${movieId}_${screening.date}_${screening.time.replace(':', '')}_${screening.hallId}`;

// Every bookable screening: the admin-scheduled times of films now showing.
export function buildShowtimes(movies) {
  const list = [];

  movies.forEach((movie) => {
    if (movie.status !== 'now-showing') return;

    (movie.screenings || []).forEach((screening) => {
      const hall = HALLS.find((h) => h.id === screening.hallId);
      if (!hall || !screening.date || !screening.time) return;

      list.push({
        id: showtimeId(movie.id, screening),
        movieId: movie.id,
        date: screening.date,
        time: screening.time,
        endTime: screeningEnd(screening.time, movie.duration).time,
        hallId: hall.id,
        hallName: hall.name,
        format: movie.format.includes(hall.format) ? hall.format : movie.format[movie.format.length - 1],
        priceFactor: priceFactorFor(toMinutes(screening.time))
      });
    });
  });

  return list.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}
