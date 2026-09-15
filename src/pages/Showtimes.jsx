import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Poster from '../components/Poster.jsx';
import Icon from '../components/Icon.jsx';
import { toDateKey, upcomingDates } from '../data/showtimes.js';
import { clockTime, runtime, weekdayShort } from '../lib/format.js';
import { useCinema } from '../context/CinemaContext.jsx';

// A screening is hidden once its start time has passed.
function isUpcoming(show) {
  const [h, m] = show.time.split(':').map(Number);
  const [y, mo, d] = show.date.split('-').map(Number);
  return new Date(y, mo - 1, d, h, m) > new Date();
}

export default function Showtimes() {
  const { nowShowingMovies, showtimes } = useCinema();
  const dates = useMemo(() => upcomingDates(7), []);
  const [dateKey, setDateKey] = useState(() => toDateKey(new Date()));
  const navigate = useNavigate();
  const todayKey = toDateKey(new Date());

  const schedule = useMemo(() => {
    return nowShowingMovies
      .map((movie) => ({
        movie,
        shows: showtimes.filter((s) => s.movieId === movie.id && s.date === dateKey && isUpcoming(s)).sort((a, b) =>
          a.time.localeCompare(b.time)
        )
      }))
      .filter((entry) => entry.shows.length);
  }, [nowShowingMovies, showtimes, dateKey]);

  return (
    <>
      <PageHeader
        eyebrow="Book in three steps"
        title="Showtimes"
        text="Choose a day, choose a screening, then pick your seats on the map. No account needed."
      />

      <section className="section section--top">
        <div className="container">
          <div className="date-strip date-strip--wide" role="tablist" aria-label="Choose a date">
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
                  onClick={() => setDateKey(key)}
                >
                  <span className="date-chip__day">{key === todayKey ? 'Today' : weekdayShort(date)}</span>
                  <span className="date-chip__num">{date.getDate()}</span>
                  <span className="date-chip__month">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                </button>
              );
            })}
          </div>

          {schedule.length ? (
            <ul className="schedule">
              {schedule.map(({ movie, shows }) => (
                <li className="schedule__row" key={movie.id}>
                  <Link to={`/movies/${movie.id}`} className="schedule__art">
                    <Poster movie={movie} />
                  </Link>

                  <div className="schedule__info">
                    <h2 className="schedule__title">
                      <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
                    </h2>
                    <p className="schedule__meta">
                      <span className="pill">{movie.ageRating}</span>
                      {movie.genres.join(', ')} · {runtime(movie.duration)}
                    </p>
                    <p className="schedule__hint">
                      <Icon name="ticket" size={15} />
                      Select a time to open the seat map
                    </p>
                  </div>

                  <div className="schedule__times">
                    {shows.map((show) => (
                      <button
                        key={show.id}
                        type="button"
                        className="time-pill"
                        onClick={() => navigate(`/booking/${movie.id}?showtime=${show.id}`)}
                      >
                        <span className="time-pill__time">{clockTime(show.time)}</span>
                        <span className="time-pill__hall">{show.format}</span>
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-note">
              No more screenings today. Pick another date above to see the full schedule.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
