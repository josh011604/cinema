import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Steps from '../components/Steps.jsx';
import SeatMap from '../components/SeatMap.jsx';
import ShowtimePicker from '../components/ShowtimePicker.jsx';
import Poster from '../components/Poster.jsx';
import Icon from '../components/Icon.jsx';
import { buildSeats, SEAT_LABELS } from '../data/halls.js';
import { toDateKey, upcomingDates } from '../data/showtimes.js';
import { clockTime, longDate, money, runtime } from '../lib/format.js';
import { useCinema } from '../context/CinemaContext.jsx';

const MAX_SEATS = 10;

function isUpcoming(show) {
  const [h, m] = show.time.split(':').map(Number);
  const [y, mo, d] = show.date.split('-').map(Number);
  return new Date(y, mo - 1, d, h, m) > new Date();
}

export default function Booking() {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { findMovie, fetchTakenSeats, setDraft, showtimes, pricing } = useCinema();

  const movie = findMovie(movieId);
  const dates = useMemo(() => upcomingDates(7), []);

  const preselected = useMemo(() => {
    const id = searchParams.get('showtime');
    return id ? showtimes.find((s) => s.id === id && s.movieId === movieId) : null;
  }, [searchParams, movieId, showtimes]);

  const [dateKey, setDateKey] = useState(() => preselected?.date || toDateKey(new Date()));
  const [showtime, setShowtime] = useState(preselected || null);
  const [selected, setSelected] = useState([]);

  const showsForDate = useMemo(
    () =>
      showtimes.filter((s) => s.movieId === movieId && s.date === dateKey && isUpcoming(s)).sort((a, b) =>
        a.time.localeCompare(b.time)
      ),
    [movieId, dateKey, showtimes]
  );

  // Keep a valid screening selected whenever the date changes.
  useEffect(() => {
    if (showtime && showtime.date === dateKey) return;
    setShowtime(showsForDate[0] || null);
    setSelected([]);
  }, [dateKey, showsForDate, showtime]);

  const seats = useMemo(() => (showtime ? buildSeats(showtime.hallId, pricing) : []), [showtime, pricing]);

  // `basePrice` is the admin's regular seat price; `price` is what this
  // screening costs after the morning discount or evening rate.
  const priced = useMemo(
    () =>
      seats.map((seat) => ({
        ...seat,
        basePrice: seat.price,
        price: Math.round(seat.price * (showtime?.priceFactor ?? 1))
      })),
    [seats, showtime]
  );

  // Seats sold online come from the database; they are re-checked at payment,
  // so a seat bought by someone else in the meantime can never be sold twice.
  const [sold, setSold] = useState(() => new Set());
  const [seatsError, setSeatsError] = useState('');

  useEffect(() => {
    setSold(new Set());
    setSeatsError('');
    if (!showtime) return undefined;

    let active = true;
    fetchTakenSeats(showtime.id)
      .then((seatIds) => {
        if (!active) return;
        setSold(seatIds);
        setSelected((prev) => prev.filter((seat) => !seatIds.has(seat.id)));
      })
      .catch((err) => {
        if (active) setSeatsError(err.message);
      });

    return () => {
      active = false;
    };
  }, [showtime, fetchTakenSeats]);

  // Only seats that customers actually bought are shown as taken.
  const taken = sold;

  const toggleSeat = (seat) => {
    setSelected((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      if (exists) return prev.filter((s) => s.id !== seat.id);
      if (prev.length >= MAX_SEATS) return prev;
      return [...prev, seat].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
    });
  };

  const subtotal = selected.reduce((sum, seat) => sum + seat.price, 0);

  // Morning screenings are discounted and evening ones cost more. The order
  // summary shows the regular total next to what the customer actually pays.
  const priceFactor = showtime?.priceFactor ?? 1;
  const priceAdjusted = priceFactor !== 1;
  const isDiscount = priceFactor < 1;
  const adjustPercent = Math.round(Math.abs(1 - priceFactor) * 100);
  const baseTotal = selected.reduce((sum, seat) => sum + (seat.basePrice ?? seat.price), 0);
  const adjustment = subtotal - baseTotal;

  const continueToPayment = () => {
    if (!showtime || !selected.length) return;
    setDraft({
      movieId: movie.id,
      movieTitle: movie.title,
      showtimeId: showtime.id,
      date: showtime.date,
      time: showtime.time,
      hallId: showtime.hallId,
      hallName: showtime.hallName,
      format: showtime.format,
      seats: selected.map((s) => ({ id: s.id, row: s.row, number: s.number, type: s.type, price: s.price })),
      subtotal
    });
    navigate('/checkout');
  };

  if (!movie) {
    return (
      <section className="section section--top">
        <div className="container narrow center">
          <h1 className="page-header__title">Movie not found</h1>
          <Link to="/showtimes" className="btn btn--primary">
            Back to showtimes
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section section--top booking">
      <div className="container">
        <Steps current={1} />

        <div className="booking__layout">
          <div className="booking__main">
            <div className="booking__movie">
              <div className="booking__movie-art">
                <Poster movie={movie} />
              </div>
              <div>
                <h1 className="booking__title">{movie.title}</h1>
                <p className="booking__meta">
                  <span className="pill">{movie.ageRating}</span>
                  {movie.genres.join(', ')} · {runtime(movie.duration)}
                </p>
                <Link to={`/movies/${movie.id}`} className="link-quiet">
                  Movie details
                </Link>
              </div>
            </div>

            <div className="panel">
              <h2 className="panel__title">1. Pick a date and time</h2>
              <ShowtimePicker
                dates={dates}
                dateKey={dateKey}
                onDateChange={setDateKey}
                showtimes={showsForDate}
                activeId={showtime?.id}
                onSelect={(show) => {
                  setShowtime(show);
                  setSelected([]);
                }}
              />
            </div>

            <div className="panel">
              <h2 className="panel__title">2. Choose your seats</h2>
              {seatsError ? (
                <p className="alert alert--error" role="alert">
                  <Icon name="alert" size={15} />
                  {seatsError}
                </p>
              ) : null}
              {showtime ? (
                <SeatMap seats={priced} taken={taken} selected={selected} onToggle={toggleSeat} maxSeats={MAX_SEATS} />
              ) : (
                <p className="empty-note">Select a screening above to open the seat map.</p>
              )}
            </div>
          </div>

          <aside className="booking__aside">
            <div className="summary">
              <h2 className="summary__title">Your Order</h2>

              {showtime ? (
                <ul className="summary__facts">
                  <li>
                    <Icon name="calendar" size={15} />
                    {longDate(showtime.date)}
                  </li>
                  <li>
                    <Icon name="clock" size={15} />
                    {clockTime(showtime.time)}
                  </li>
                  <li>
                    <Icon name="screen" size={15} />
                    {showtime.hallName.replace(' - ', ' · ')} · {showtime.format}
                  </li>
                </ul>
              ) : (
                <p className="summary__empty">No Screening Selected Yet.</p>
              )}

              {showtime && priceAdjusted ? (
                <p className={`summary__badge ${isDiscount ? 'is-discount' : 'is-premium'}`}>
                  <Icon name={isDiscount ? 'star' : 'clock'} size={14} />
                  {isDiscount
                    ? `Morning Discount · ${adjustPercent}% Off Every Seat`
                    : `Evening Rate · +${adjustPercent}% Per Seat`}
                </p>
              ) : null}

              <div className="summary__seats">
                {selected.length ? (
                  <ul>
                    {selected.map((seat) => (
                      <li key={seat.id}>
                        <span className="summary__seat">
                          <strong>{seat.id}</strong>
                          <span>{SEAT_LABELS[seat.type]}</span>
                        </span>
                        <span className="summary__price">
                          {isDiscount && seat.basePrice > seat.price ? (
                            <s className="summary__price-old" aria-label={`Regular Price ${money(seat.basePrice)}`}>
                              {money(seat.basePrice)}
                            </s>
                          ) : null}
                          <span>{money(seat.price)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="summary__empty">Tap The Seats You Want On The Map.</p>
                )}
              </div>

              {selected.length > 0 && adjustment !== 0 ? (
                <dl className="summary__lines">
                  <div>
                    <dt>Regular Price</dt>
                    <dd>{money(baseTotal)}</dd>
                  </div>
                  <div className={isDiscount ? 'is-discount' : undefined}>
                    <dt>{isDiscount ? `Morning Discount (${adjustPercent}%)` : `Evening Rate (+${adjustPercent}%)`}</dt>
                    <dd>
                      {isDiscount ? '−' : '+'}
                      {money(Math.abs(adjustment))}
                    </dd>
                  </div>
                </dl>
              ) : null}

              <div className="summary__total">
                <span>
                  Total ({selected.length} {selected.length === 1 ? 'Seat' : 'Seats'})
                </span>
                <span className="summary__total-amount">
                  <strong>{money(subtotal)}</strong>
                  {isDiscount && adjustment < 0 ? <small>You Save {money(-adjustment)}</small> : null}
                </span>
              </div>

              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={continueToPayment}
                disabled={!showtime || !selected.length}
              >
                Continue To Payment
                <Icon name="arrowRight" size={16} />
              </button>

              <p className="summary__note">
                <Icon name="shield" size={14} />
                No Account Needed. Your Seats Are Confirmed As Soon As Payment Goes Through.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
