// Seating layouts. Every hall is described row by row so the seat map can be
// rendered without hard coding a grid.
//
// Seat categories:
//   standard - regular seat
//   vip      - wider recliner in the middle rows
//   sofa     - two seater love seat on the back row (priced per person)

export const SEAT_TYPES = ['standard', 'vip', 'sofa'];

export const SEAT_LABELS = {
  standard: 'Standard',
  vip: 'VIP Recliner',
  sofa: 'Sofa (Love Seat)'
};

// Rooms come in two types, and each type has its own seat prices.
export const ROOM_TYPES = [
  { id: 'imax', label: 'IMAX Hall' },
  { id: 'standard', label: 'Standard Halls' }
];

// Ticket prices in pesos, used until the admin saves their own in the
// Pricing tab (and whenever the database has none).
export const DEFAULT_PRICING = {
  imax: { standard: 280, vip: 420, sofa: 650 },
  standard: { standard: 280, vip: 420, sofa: 650 },
  bookingFee: 20
};

// The four Standard halls share one layout.
const STANDARD_ROWS = [
  { row: 'A', seats: 8, type: 'standard' },
  { row: 'B', seats: 10, type: 'standard' },
  { row: 'C', seats: 10, type: 'standard' },
  { row: 'D', seats: 12, type: 'standard' },
  { row: 'E', seats: 12, type: 'vip' },
  { row: 'F', seats: 10, type: 'vip' }
];

export const HALLS = [
  {
    id: 'hall-1',
    name: 'Hall 1 - IMAX',
    type: 'imax',
    format: 'IMAX',
    rows: [
      { row: 'A', seats: 10, type: 'standard' },
      { row: 'B', seats: 12, type: 'standard' },
      { row: 'C', seats: 12, type: 'standard' },
      { row: 'D', seats: 14, type: 'standard' },
      { row: 'E', seats: 14, type: 'vip' },
      { row: 'F', seats: 14, type: 'vip' },
      { row: 'G', seats: 12, type: 'vip' },
      { row: 'H', seats: 8, type: 'sofa' }
    ]
  },
  ...[2, 3, 4, 5].map((number) => ({
    id: `hall-${number}`,
    name: `Hall ${number} - Standard`,
    type: 'standard',
    format: '2D',
    rows: STANDARD_ROWS
  }))
];

export const getHall = (id) => HALLS.find((h) => h.id === id) || HALLS[0];

export const HALL_IDS = HALLS.map((h) => h.id);

// Seat types that actually exist in rooms of a type (Standard halls have no sofas).
export const seatTypesIn = (roomType) =>
  SEAT_TYPES.filter((seatType) =>
    HALLS.some((hall) => hall.type === roomType && hall.rows.some((row) => row.type === seatType))
  );

// Fills any missing or invalid value with the default, so a partly saved or
// hand-edited price list can never break the booking pages.
export function normalizePricing(value) {
  const read = (candidate, fallback) => {
    const number = Number(candidate);
    return candidate !== '' && candidate !== null && Number.isFinite(number) && number >= 0 ? Math.round(number) : fallback;
  };

  const result = { bookingFee: read(value?.bookingFee, DEFAULT_PRICING.bookingFee) };
  ROOM_TYPES.forEach(({ id }) => {
    result[id] = {};
    SEAT_TYPES.forEach((seatType) => {
      result[id][seatType] = read(value?.[id]?.[seatType], DEFAULT_PRICING[id][seatType]);
    });
  });
  return result;
}

// Base price of one seat type in one hall, before any time-of-day adjustment.
export const seatPrice = (pricing, hallId, seatType) => normalizePricing(pricing)[getHall(hallId).type][seatType];

// Flat list of every seat in a hall, in render order, priced for that hall.
export function buildSeats(hallId, pricing) {
  const hall = getHall(hallId);
  const prices = normalizePricing(pricing)[hall.type];
  const seats = [];
  hall.rows.forEach((row) => {
    for (let i = 1; i <= row.seats; i += 1) {
      seats.push({
        id: `${row.row}${i}`,
        row: row.row,
        number: i,
        type: row.type,
        price: prices[row.type]
      });
    }
  });
  return seats;
}
