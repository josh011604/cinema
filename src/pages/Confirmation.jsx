import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Steps from '../components/Steps.jsx';
import TicketStub from '../components/TicketStub.jsx';
import Icon from '../components/Icon.jsx';
import { money } from '../lib/format.js';
import { useCinema } from '../context/CinemaContext.jsx';

export default function Confirmation() {
  const { code } = useParams();
  const location = useLocation();
  const { fetchBooking, findMovie } = useCinema();

  // Straight after checkout the booking arrives with the navigation, so only a
  // page reload or a shared link needs to look it up in the database.
  const handedOver = location.state?.booking?.code === code ? location.state.booking : null;
  const [booking, setBooking] = useState(handedOver);
  const [status, setStatus] = useState(handedOver ? 'ready' : 'loading');

  useEffect(() => {
    if (handedOver) return undefined;
    let active = true;
    setStatus('loading');
    fetchBooking(code)
      .then((found) => {
        if (!active) return;
        setBooking(found);
        setStatus(found ? 'ready' : 'missing');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [code, fetchBooking, handedOver]);

  if (status === 'loading') {
    return (
      <section className="section section--top">
        <div className="container narrow center">
          <p className="page-header__text">Loading your booking…</p>
        </div>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="section section--top">
        <div className="container narrow center">
          <h1 className="page-header__title">{status === 'error' ? 'Could not load booking' : 'Booking not found'}</h1>
          <p className="page-header__text">
            {status === 'error' ? (
              'Please check your connection and try again.'
            ) : (
              <>
                We could not find booking <strong>{code}</strong>.
              </>
            )}
          </p>
          <Link to="/showtimes" className="btn btn--primary">
            Browse showtimes
          </Link>
        </div>
      </section>
    );
  }

  const movie = findMovie(booking.movieId);

  return (
    <section className="section section--top">
      <div className="container narrow">
        <Steps current={3} />

        <div className="confirm">
          <span className="confirm__check">
            <Icon name="check" size={28} />
          </span>
          <h1 className="confirm__title">Payment received. Enjoy the show!</h1>
          <p className="confirm__text">
            Your seats are locked in. We sent the ticket to <strong>{booking.customer.email}</strong>. Show this
            booking code at the entrance.
          </p>
        </div>

        <TicketStub booking={booking} movie={movie} />

        <div className="panel confirm__details">
          <h2 className="panel__title">Payment</h2>
          <dl className="summary__lines">
            <div>
              <dt>Method</dt>
              <dd>{booking.payment.methodName}</dd>
            </div>
            {booking.payment.bank ? (
              <div>
                <dt>Bank</dt>
                <dd>{booking.payment.bank}</dd>
              </div>
            ) : null}
            {booking.payment.accountName ? (
              <div>
                <dt>Account name</dt>
                <dd>{booking.payment.accountName}</dd>
              </div>
            ) : null}
            {booking.payment.reference ? (
              <div>
                <dt>Reference</dt>
                <dd>{booking.payment.reference}</dd>
              </div>
            ) : null}
            <div>
              <dt>Seats subtotal</dt>
              <dd>{money(booking.subtotal)}</dd>
            </div>
            <div>
              <dt>Fees</dt>
              <dd>{money(booking.fees)}</dd>
            </div>
            <div>
              <dt>Total paid</dt>
              <dd>
                <strong>{money(booking.total)}</strong>
              </dd>
            </div>
          </dl>
        </div>

        <div className="confirm__actions">
          <button type="button" className="btn btn--primary" onClick={() => window.print()}>
            <Icon name="printer" size={16} />
            Print ticket
          </button>
          <Link to="/showtimes" className="btn btn--ghost">
            Book another movie
          </Link>
          <Link to="/" className="link-quiet">
            Back to home
          </Link>
        </div>

        <p className="confirm__hint">
          <Icon name="clock" size={14} />
          Please arrive 15 minutes before the screening. Tickets can be refunded up to 2 hours before showtime.
        </p>
      </div>
    </section>
  );
}
