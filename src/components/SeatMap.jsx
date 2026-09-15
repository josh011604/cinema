import { useMemo } from 'react';
import { SEAT_LABELS, SEAT_TYPES } from '../data/halls.js';
import { moneyShort } from '../lib/format.js';

export default function SeatMap({ seats, taken, selected, onToggle, maxSeats = 10 }) {
  // Each row is split by a center aisle (rows are centered, so the gaps line up
  // into one walkway), and a cross aisle opens wherever the seat section changes.
  const rows = useMemo(() => {
    const grouped = new Map();
    seats.forEach((seat) => {
      if (!grouped.has(seat.row)) grouped.set(seat.row, []);
      grouped.get(seat.row).push(seat);
    });

    return Array.from(grouped.entries()).map(([row, rowSeats], index, all) => {
      const aisleAt = Math.ceil(rowSeats.length / 2);
      const items = [];
      rowSeats.forEach((seat, seatIndex) => {
        if (seatIndex === aisleAt) items.push({ aisle: true, id: `${row}-aisle` });
        items.push(seat);
      });
      const newSection = index > 0 && rowSeats[0].type !== all[index - 1][1][0].type;
      return { row, items, newSection };
    });
  }, [seats]);

  // Legend prices come from the seats themselves, so they match this hall's
  // prices and this screening's time of day. Types the hall lacks are left out.
  const seatTypes = useMemo(
    () =>
      SEAT_TYPES.map((type) => {
        const prices = seats.filter((seat) => seat.type === type).map((seat) => seat.price);
        return prices.length ? { type, price: Math.min(...prices) } : null;
      }).filter(Boolean),
    [seats]
  );

  const selectedSet = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);
  const limitReached = selected.length >= maxSeats;

  return (
    <div className="seatmap">
      <div className="seatmap__screen">
        <div className="seatmap__screen-bar" />
        <span>Screen</span>
      </div>

      <div className="seatmap__rows">
        {rows.map(({ row, items, newSection }) => (
          <div className={`seatmap__row ${newSection ? 'seatmap__row--section' : ''}`} key={row}>
            <span className="seatmap__row-label">{row}</span>
            <div className="seatmap__seats">
              {items.map((seat) => {
                if (seat.aisle) return <span className="seatmap__aisle" key={seat.id} aria-hidden="true" />;
                const isTaken = taken.has(seat.id);
                const isSelected = selectedSet.has(seat.id);
                const disabled = isTaken || (limitReached && !isSelected);
                return (
                  <button
                    key={seat.id}
                    type="button"
                    className={[
                      'seat',
                      `seat--${seat.type}`,
                      isTaken ? 'is-taken' : '',
                      isSelected ? 'is-selected' : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => onToggle(seat)}
                    disabled={disabled}
                    aria-pressed={isSelected}
                    title={
                      isTaken
                        ? `Seat ${seat.id} is already taken`
                        : `Seat ${seat.id} · ${SEAT_LABELS[seat.type]} · ${moneyShort(seat.price)}`
                    }
                    aria-label={`Seat ${seat.id}, ${SEAT_LABELS[seat.type]}, ${moneyShort(seat.price)}${
                      isTaken ? ', unavailable' : ''
                    }`}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
            <span className="seatmap__row-label">{row}</span>
          </div>
        ))}
      </div>

      <div className="seatmap__legend">
        <div className="legend-group" role="group" aria-label="Seat status">
          <span className="legend-item">
            <i className="legend-swatch legend-swatch--free" /> Available
          </span>
          <span className="legend-item">
            <i className="legend-swatch legend-swatch--selected" /> Your pick
          </span>
          <span className="legend-item">
            <i className="legend-swatch legend-swatch--taken" /> Taken
          </span>
        </div>

        <span className="legend-divider" aria-hidden="true" />

        <div className="legend-group" role="group" aria-label="Seat types and prices">
          {seatTypes.map(({ type, price }) => (
            <span className="legend-item" key={type}>
              <i className={`legend-swatch legend-swatch--${type}`} /> {SEAT_LABELS[type]} · {moneyShort(price)}
            </span>
          ))}
        </div>
      </div>

      {limitReached ? (
        <p className="seatmap__limit">You can book up to {maxSeats} seats in a single order.</p>
      ) : null}
    </div>
  );
}
