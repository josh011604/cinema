import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Poster from '../components/Poster.jsx';
import Icon from '../components/Icon.jsx';
import { releaseLabel, runtime } from '../lib/format.js';
import { useCinema } from '../context/CinemaContext.jsx';

export default function ComingSoon() {
  const { comingSoonMovies } = useCinema();

  return (
    <>
      <PageHeader
        eyebrow="Save the date"
        title="Coming Soon"
        text="Premieres landing at Cinema House over the next few weeks."
      />

      <section className="section section--top">
        <div className="container">
          {comingSoonMovies.length ? (
            <ul className="soon-list">
              {comingSoonMovies.map((movie) => (
                <li className="soon-row" key={movie.id}>
                  <Link to={`/movies/${movie.id}`} className="soon-row__art">
                    <Poster movie={movie} />
                  </Link>
                  <div className="soon-row__body">
                    <span className="soon-row__date">
                      <Icon name="calendar" size={15} />
                      {movie.releaseDate ? releaseLabel(movie.releaseDate) : 'Date to be announced'}
                    </span>
                    <h2>
                      <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
                    </h2>
                    <p className="soon-row__meta">
                      {movie.genres.join(', ')} · {runtime(movie.duration)} · {movie.ageRating}
                    </p>
                    <p className="soon-row__text">{movie.synopsis}</p>
                    <Link to={`/movies/${movie.id}`} className="btn btn--ghost btn--sm">
                      Movie details
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-note">No upcoming premieres have been announced yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
