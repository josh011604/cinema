import { Link, useNavigate } from 'react-router-dom';
import Poster from './Poster.jsx';
import Icon from './Icon.jsx';
import { releaseLabel, runtime } from '../lib/format.js';

export default function MovieCard({ movie, variant = 'now-showing' }) {
  const navigate = useNavigate();
  const isComingSoon = variant === 'coming-soon';

  return (
    <article className={`movie-card ${isComingSoon ? 'movie-card--soon' : ''}`}>
      <Link to={`/movies/${movie.id}`} className="movie-card__art" aria-label={`Open ${movie.title}`}>
        <Poster movie={movie} />
        <span className="movie-card__age">{movie.ageRating}</span>
        {!isComingSoon ? (
          <span className="movie-card__score">
            <Icon name="star" size={12} filled />
            {movie.score.toFixed(1)}
          </span>
        ) : null}
        <span className="movie-card__hover">
          <Icon name="play" size={20} filled />
        </span>
      </Link>

      <div className="movie-card__body">
        {isComingSoon && movie.releaseDate ? (
          <span className="movie-card__release">{releaseLabel(movie.releaseDate)}</span>
        ) : null}
        <h3 className="movie-card__title">
          <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
        </h3>
        <p className="movie-card__meta">{movie.genres.join(', ')}</p>
        {!isComingSoon ? (
          <>
            <p className="movie-card__runtime">{runtime(movie.duration)}</p>
            <button type="button" className="btn btn--primary btn--block" onClick={() => navigate(`/booking/${movie.id}`)}>
              Buy Ticket
            </button>
          </>
        ) : (
          <Link to={`/movies/${movie.id}`} className="btn btn--ghost btn--block">
            Details
          </Link>
        )}
      </div>
    </article>
  );
}
