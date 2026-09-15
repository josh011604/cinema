import { Fragment, useMemo, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { clockTime, longDate, money, timestamp } from '../../lib/format.js';
import { useCinema } from '../../context/CinemaContext.jsx';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'used', label: 'Checked in' },
  { id: 'cancelled', label: 'Cancelled' }
];

export default function AdminBookings() {
  const { bookings, bookingsError, setBookingStatus, deleteBooking } = useCinema();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyCode, setBusyCode] = useState(null);
  const [actionError, setActionError] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesFilter = filter === 'all' || b.status === filter;
      if (!matchesFilter) return false;
      if (!q) return true;
      return (
        b.code.toLowerCase().includes(q) ||
        b.movieTitle.toLowerCase().includes(q) ||
        String(b.customer.fullName || '').toLowerCase().includes(q) ||
        String(b.customer.email || '').toLowerCase().includes(q)
      );
    });
  }, [bookings, query, filter]);

  // Runs one change against the database, keeping its buttons disabled meanwhile.
  const run = async (code, action) => {
    setBusyCode(code);
    setActionError('');
    try {
      await action();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyCode(null);
    }
  };

  const errorMessage = actionError || bookingsError;

  return (
    <div className="admin-stack">
      <div className="panel">
        {errorMessage ? (
          <div className="alert alert--error" role="alert">
            <Icon name="alert" size={15} />
            {errorMessage}
          </div>
        ) : null}

        <div className="admin-toolbar">
          <div className="admin-search">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code, movie, name or email"
              aria-label="Search bookings"
            />
          </div>

          <div className="chips">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`chip ${filter === item.id ? 'is-active' : ''}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Movie</th>
                  <th>Screening</th>
                  <th>Guest</th>
                  <th>Seats</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((booking) => {
                  const busy = busyCode === booking.code;
                  return (
                    <Fragment key={booking.code}>
                      <tr>
                        <td>
                          <button
                            type="button"
                            className="table__code"
                            onClick={() => setExpanded(expanded === booking.code ? null : booking.code)}
                            aria-expanded={expanded === booking.code}
                          >
                            {booking.code}
                            <Icon name="chevronDown" size={14} />
                          </button>
                        </td>
                        <td>{booking.movieTitle}</td>
                        <td>
                          <span className="table__stack">
                            <span>{longDate(booking.date)}</span>
                            <span className="muted">
                              {clockTime(booking.time)} · {booking.hallName}
                            </span>
                          </span>
                        </td>
                        <td>
                          <span className="table__stack">
                            <span>{booking.customer.fullName}</span>
                            <span className="muted">{booking.customer.email}</span>
                          </span>
                        </td>
                        <td>{booking.seats.map((s) => s.id).join(', ')}</td>
                        <td>{booking.payment.methodName}</td>
                        <td>{money(booking.total)}</td>
                        <td>
                          <span className={`status status--${booking.status}`}>{booking.status}</span>
                        </td>
                        <td>
                          <div className="table__actions">
                            {booking.status !== 'used' ? (
                              <button
                                type="button"
                                className="icon-button icon-button--sm"
                                title="Mark as checked in"
                                disabled={busy}
                                onClick={() => run(booking.code, () => setBookingStatus(booking.code, 'used'))}
                              >
                                <Icon name="check" size={15} />
                              </button>
                            ) : null}
                            {booking.status !== 'cancelled' ? (
                              <button
                                type="button"
                                className="icon-button icon-button--sm"
                                title="Cancel booking"
                                disabled={busy}
                                onClick={() => run(booking.code, () => setBookingStatus(booking.code, 'cancelled'))}
                              >
                                <Icon name="close" size={15} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="icon-button icon-button--sm"
                                title="Restore booking"
                                disabled={busy}
                                onClick={() => run(booking.code, () => setBookingStatus(booking.code, 'confirmed'))}
                              >
                                <Icon name="arrowLeft" size={15} />
                              </button>
                            )}
                            <button
                              type="button"
                              className="icon-button icon-button--sm icon-button--danger"
                              title="Delete booking"
                              disabled={busy}
                              onClick={() => setPendingDelete(booking.code)}
                            >
                              <Icon name="trash" size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expanded === booking.code ? (
                        <tr className="table__detail">
                          <td colSpan={9}>
                            <div className="detail-grid">
                              <div>
                                <span className="detail-grid__label">Booked</span>
                                {timestamp(booking.createdAt)}
                              </div>
                              <div>
                                <span className="detail-grid__label">Mobile</span>
                                {booking.customer.phone}
                              </div>
                              <div>
                                <span className="detail-grid__label">Payment details</span>
                                {[booking.payment.bank, booking.payment.accountName, booking.payment.reference]
                                  .filter(Boolean)
                                  .join(' · ') || '-'}
                              </div>
                              <div>
                                <span className="detail-grid__label">Seats subtotal</span>
                                {money(booking.subtotal)}
                              </div>
                              <div>
                                <span className="detail-grid__label">Fees</span>
                                {money(booking.fees)}
                              </div>
                              <div>
                                <span className="detail-grid__label">Format</span>
                                {booking.format}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-note">
            {bookings.length ? 'No bookings match this search.' : 'No bookings yet. Orders from the website land here.'}
          </p>
        )}
      </div>

      {pendingDelete ? (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <button type="button" className="overlay__backdrop" onClick={() => setPendingDelete(null)} aria-label="Close" />
          <div className="confirm-dialog">
            <h3>Delete booking {pendingDelete}?</h3>
            <p>This permanently removes the record and frees the seats. It cannot be undone.</p>
            <div className="confirm-dialog__actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPendingDelete(null)}>
                Keep it
              </button>
              <button
                type="button"
                className="btn btn--danger btn--sm"
                disabled={busyCode === pendingDelete}
                onClick={async () => {
                  await run(pendingDelete, () => deleteBooking(pendingDelete));
                  setPendingDelete(null);
                }}
              >
                Delete booking
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
