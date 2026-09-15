import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../Icon.jsx';
import Poster from '../Poster.jsx';
import { useCinema } from '../../context/CinemaContext.jsx';

export default function SearchPanel({ onClose }) {
  const [query, setQuery] = useState('');
  const { movies } = useCinema();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return movies
      .filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          String(m.director).toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [movies, query]);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Search movies">
      <button type="button" className="overlay__backdrop" onClick={onClose} aria-label="Close search" />
      <div className="search-panel">
        <div className="search-panel__field">
          <Icon name="search" size={20} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, genre or director"
            aria-label="Search movies"
          />
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close search">
            <Icon name="close" size={18} />
          </button>
        </div>

        {query.trim() && !results.length ? (
          <p className="search-panel__empty">No movies match &ldquo;{query.trim()}&rdquo;.</p>
        ) : null}

        {results.length ? (
          <ul className="search-panel__results">
            {results.map((movie) => (
              <li key={movie.id}>
                <button
                  type="button"
                  className="search-result"
                  onClick={() => {
                    navigate(`/movies/${movie.id}`);
                    onClose();
                  }}
                >
                  <Poster movie={movie} className="poster--mini" />
                  <span className="search-result__body">
                    <span className="search-result__title">{movie.title}</span>
                    <span className="search-result__meta">
                      {movie.genres.join(', ')} · {movie.ageRating}
                    </span>
                  </span>
                  <span className="search-result__badge">
                    {movie.status === 'now-showing' ? 'Now showing' : 'Coming soon'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
