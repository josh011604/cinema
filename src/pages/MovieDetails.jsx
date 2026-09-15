import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Poster from '../components/Poster.jsx';
import Icon from '../components/Icon.jsx';
import MovieCard from '../components/MovieCard.jsx';
import { toDateKey } from '../data/showtimes.js';
import { clockTime, releaseLabel, runtime } from '../lib/format.js';
import { useCinema } from '../context/CinemaContext.jsx';

export default function MovieDetails() {
  const { movieId } = useParams();
  const { findMovie, nowShowingMovies, showtimes } = useCinema();
  const navigate = useNavigate();
  const movie = findMovie(movieId);

  const todayShows = useMemo(() => {
    if (!movie) return [];
    const key = toDateKey(new Date());
    return showtimes.filter((s) => s.movieId === movie.id && s.date === key).sort((a, b) => a.time.localeCompare(b.time));
  }, [movie, showtimes]);

  const related = useMemo(() => {
    if (!movie) return [];
    return nowShowingMovies
      .filter((m) => m.id !== movie.id && m.genres.some((g) => movie.genres.includes(g)))
      .slice(0, 4);
  }, [movie, nowShowingMovies]);

  if (!movie) {
    return (
      <section className="section section--top">
        <div className="container narrow center">
          <h1 className="page-header__title">Movie not found</h1>
          <p className="page-header__text">This title is no longer in our catalog.</p>
          <Link to="/movies" className="btn btn--primary">
            Back to movies
          </Link>
        </div>
      </section>
    );
  }

  const isComingSoon = movie.status === 'coming-soon';

  return (
    <>
      <section className="movie-hero">
        <div className="container movie-hero__inner">
          <div className="movie-hero__poster">
            <Poster movie={movie} />
          </div>

          <div className="movie-hero__body">
            <span className="movie-hero__eyebrow">
              {isComingSoon
                ? `In theaters ${movie.releaseDate ? releaseLabel(movie.releaseDate) : 'soon'}`
                : 'Now showing'}
            </span>
            <h1 className="movie-hero__title">{movie.title}</h1>
            <p className="movie-hero__tagline">{movie.tagline}</p>

            <ul className="movie-hero__facts">
              <li>
                <Icon name="star" size={15} filled /> {movie.score.toFixed(1)} / 10
              </li>
              <li>
                <Icon name="clock" size={15} /> {runtime(movie.duration)}
              </li>
              <li>
                <span className="pill">{movie.ageRating}</span>
              </li>
              <li>{movie.genres.join(', ')}</li>
              <li>{movie.format.join(' · ')}</li>
            </ul>

            <p className="movie-hero__synopsis">{movie.synopsis}</p>

            <dl className="movie-hero__credits">
              <div>
                <dt>Director</dt>
                <dd>{movie.director}</dd>
              </div>
              <div>
                <dt>Cast</dt>
                <dd>{movie.cast.join(', ')}</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>{movie.year}</dd>
              </div>
            </dl>

            {isComingSoon ? (
              <div className="movie-hero__actions">
                <button type="button" className="btn btn--ghost" disabled>
                  Tickets open closer to release
                </button>
              </div>
            ) : (
              <div className="movie-hero__actions">
                <button type="button" className="btn btn--primary" onClick={() => navigate(`/booking/${movie.id}`)}>
                  Buy Ticket
                  <Icon name="ticket" size={16} />
                </button>
                <Link to="/showtimes" className="btn btn--ghost">
                  All showtimes
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {!isComingSoon && todayShows.length ? (
        <section className="section section--tight">
          <div className="container">
            <h2 className="section-heading__title">Today</h2>
            <div className="times-inline">
              {todayShows.map((show) => (
                <button
                  key={show.id}
                  type="button"
                  className="time-pill"
                  onClick={() => navigate(`/booking/${movie.id}?showtime=${show.id}`)}
                >
                  <span className="time-pill__time">{clockTime(show.time)}</span>
                  <span className="time-pill__hall">{show.hallName}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="section">
          <div className="container">
            <h2 className="section-heading__title">You might also like</h2>
            <div className="movie-grid movie-grid--compact">
              {related.map((item) => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
