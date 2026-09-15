import { clockTime, moneyShort, weekdayShort } from '../lib/format.js';
import { getHall, seatPrice, seatTypesIn } from '../data/halls.js';
import { toDateKey } from '../data/showtimes.js';
import { useCinema } from '../context/CinemaContext.jsx';

export default function ShowtimePicker({ dates, dateKey, onDateChange, showtimes, activeId, onSelect }) {
  const { pricing } = useCinema();
  const todayKey = toDateKey(new Date());

  // "From" is the cheapest seat in that screening's hall at that time of day.
  const fromPrice = (show) => {
    const hallType = getHall(show.hallId).type;
    const cheapest = Math.min(...seatTypesIn(hallType).map((type) => seatPrice(pricing, show.hallId, type)));
    return Math.round(cheapest * show.priceFactor);
  };

  return (
    <div className="showtime-picker">
      <div className="date-strip" role="tablist" aria-label="Choose a date">
        {dates.map((date) => {
          const key = toDateKey(date);
          const active = key === dateKey;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              className={`date-chip ${active ? 'is-active' : ''}`}
              onClick={() => onDateChange(key)}
            >
              <span className="date-chip__day">{key === todayKey ? 'Today' : weekdayShort(date)}</span>
              <span className="date-chip__num">{date.getDate()}</span>
              <span className="date-chip__month">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
            </button>
          );
        })}
      </div>

      {showtimes.length ? (
        <div className="time-grid">
          {showtimes.map((show) => {
            const active = show.id === activeId;
            return (
              <button
                key={show.id}
                type="button"
                className={`time-card ${active ? 'is-active' : ''}`}
                onClick={() => onSelect(show)}
                aria-pressed={active}
              >
                <span className="time-card__time">{clockTime(show.time)}</span>
                <span className="time-card__hall">{show.hallName}</span>
                <span className="time-card__price">from {moneyShort(fromPrice(show))}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="empty-note">No screenings left for this date. Please pick another day.</p>
      )}
    </div>
  );
}
