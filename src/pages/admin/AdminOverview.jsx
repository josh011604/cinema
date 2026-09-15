import { useMemo } from 'react';
import Icon from '../../components/Icon.jsx';
import { money, moneyShort, timestamp } from '../../lib/format.js';
import { toDateKey } from '../../data/showtimes.js';
import { useCinema } from '../../context/CinemaContext.jsx';

function EmptyState({ icon, title, text }) {
  return (
    <div className="admin-empty">
      <span className="admin-empty__icon">
        <Icon name={icon} size={20} />
      </span>
      <p className="admin-empty__title">{title}</p>
      <p className="admin-empty__text">{text}</p>
    </div>
  );
}

export default function AdminOverview({ onOpenBookings }) {
  const { bookings, nowShowingMovies, comingSoonMovies, showtimes } = useCinema();

  const stats = useMemo(() => {
    const active = bookings.filter((b) => b.status !== 'cancelled');
    const tickets = active.reduce((sum, b) => sum + b.seats.length, 0);
    const revenue = active.reduce((sum, b) => sum + b.total, 0);
    const todayKey = toDateKey(new Date());
    const todayScreenings = showtimes.filter((s) => s.date === todayKey).length;
    const todayBookings = bookings.filter((b) => b.createdAt.slice(0, 10) === todayKey).length;
    return { total: bookings.length, tickets, revenue, todayScreenings, todayBookings, active: active.length };
  }, [bookings, showtimes]);

  const byMovie = useMemo(() => {
    const map = new Map();
    bookings
      .filter((b) => b.status !== 'cancelled')
      .forEach((b) => {
        const entry = map.get(b.movieId) || { title: b.movieTitle, tickets: 0, revenue: 0 };
        entry.tickets += b.seats.length;
        entry.revenue += b.total;
        map.set(b.movieId, entry);
      });
    const list = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
    const max = list.length ? list[0].revenue : 0;
    return { list, max };
  }, [bookings]);

  const recent = bookings.slice(0, 5);

  const cards = [
    { icon: 'ticket', label: 'Total Bookings', value: stats.total, sub: `${stats.active} Active` },
    { icon: 'seat', label: 'Tickets Sold', value: stats.tickets, sub: 'Across All Screenings' },
    { icon: 'wallet', label: 'Revenue', value: moneyShort(stats.revenue), sub: 'All Time' },
    { icon: 'calendar', label: 'Screenings Today', value: stats.todayScreenings, sub: `${stats.todayBookings} Booked Today` },
    { icon: 'film', label: 'Now Showing', value: nowShowingMovies.length, sub: `${comingSoonMovies.length} Coming Soon` }
  ];

  return (
    <div className="admin-stack">
      <ul className="stat-cards">
        {cards.map((card) => (
          <li key={card.label}>
            <div className="stat-cards__top">
              <span className="stat-cards__label">{card.label}</span>
              <span className="stat-cards__icon">
                <Icon name={card.icon} size={18} />
              </span>
            </div>
            <span className="stat-cards__value">{card.value}</span>
            <span className="stat-cards__sub">{card.sub}</span>
          </li>
        ))}
      </ul>

      <div className="admin-columns">
        <section className="panel admin-card">
          <div className="admin-card__head">
            <h2 className="admin-card__title">Revenue By Movie</h2>
          </div>

          {byMovie.list.length ? (
            <ul className="bars">
              {byMovie.list.map((row) => (
                <li key={row.title}>
                  <div className="bars__head">
                    <span>{row.title}</span>
                    <span>{money(row.revenue)}</span>
                  </div>
                  <div className="bars__track">
                    <div
                      className="bars__fill"
                      style={{ width: `${byMovie.max ? Math.max((row.revenue / byMovie.max) * 100, 4) : 0}%` }}
                    />
                  </div>
                  <span className="bars__sub">
                    {row.tickets} {row.tickets === 1 ? 'Ticket' : 'Tickets'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="chart" title="No Sales Yet" text="Revenue Will Show Here Once Customers Book Tickets." />
          )}
        </section>

        <section className="panel admin-card">
          <div className="admin-card__head">
            <h2 className="admin-card__title">Latest Bookings</h2>
            {recent.length ? (
              <button type="button" className="admin-card__link" onClick={onOpenBookings}>
                View All
                <Icon name="arrowRight" size={15} />
              </button>
            ) : null}
          </div>

          {recent.length ? (
            <ul className="recent">
              {recent.map((booking) => (
                <li key={booking.code}>
                  <div>
                    <strong>{booking.code}</strong>
                    <span className="recent__meta">
                      {booking.movieTitle} · {booking.seats.length}{' '}
                      {booking.seats.length === 1 ? 'Seat' : 'Seats'}
                    </span>
                    <span className="recent__time">{timestamp(booking.createdAt)}</span>
                  </div>
                  <div className="recent__right">
                    <span className={`status status--${booking.status}`}>{booking.status}</span>
                    <span>{money(booking.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="ticket" title="No Bookings Yet" text="New Bookings From The Website Will Appear Here." />
          )}
        </section>
      </div>
    </div>
  );
}
