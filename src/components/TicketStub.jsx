import Icon from './Icon.jsx';
import { clockTime, longDate, money } from '../lib/format.js';

// Simple deterministic barcode so the ticket looks like a real stub.
function Barcode({ code }) {
  const bars = Array.from(code).flatMap((char, i) => {
    const value = char.charCodeAt(0) + i * 7;
    return [2 + (value % 4), 1 + (value % 3), 3 + (value % 5)];
  });
  return (
    <div className="barcode" aria-hidden="true">
      {bars.map((width, i) => (
        <span key={`${width}-${i}`} style={{ width: `${width}px`, opacity: i % 3 === 1 ? 0.45 : 1 }} />
      ))}
    </div>
  );
}

export default function TicketStub({ booking, movie }) {
  return (
    <div className="ticket">
      <div className="ticket__main">
        <div className="ticket__brand">
          <span className="ticket__mark">
            <Icon name="play" size={14} filled />
          </span>
          Cinema House
        </div>

        <h3 className="ticket__movie">{movie ? movie.title : booking.movieTitle}</h3>
        <p className="ticket__tagline">{booking.format} · {booking.hallName}</p>

        <dl className="ticket__grid">
          <div>
            <dt>Date</dt>
            <dd>{longDate(booking.date)}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{clockTime(booking.time)}</dd>
          </div>
          <div>
            <dt>Seats</dt>
            <dd>{booking.seats.map((s) => s.id).join(', ')}</dd>
          </div>
          <div>
            <dt>Guest</dt>
            <dd>{booking.customer.fullName}</dd>
          </div>
        </dl>
      </div>

      <div className="ticket__stub">
        <span className="ticket__stub-label">Booking code</span>
        <strong className="ticket__code">{booking.code}</strong>
        <Barcode code={booking.code} />
        <span className="ticket__total">{money(booking.total)}</span>
        <span className={`ticket__status ticket__status--${booking.status}`}>{booking.status}</span>
      </div>
    </div>
  );
}
