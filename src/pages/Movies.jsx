import { useMemo, useState } from 'react';
import MovieCard from '../components/MovieCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useCinema } from '../context/CinemaContext.jsx';

export default function Movies() {
  const { nowShowingMovies } = useCinema();
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('title');

  const genres = useMemo(() => {
    const set = new Set();
    nowShowingMovies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return ['All', ...Array.from(set).sort()];
  }, [nowShowingMovies]);

  const visible = useMemo(() => {
    const list = genre === 'All' ? nowShowingMovies : nowShowingMovies.filter((m) => m.genres.includes(genre));
    return list.slice().sort((a, b) => {
      if (sort === 'rating') return b.score - a.score;
      if (sort === 'duration') return a.duration - b.duration;
      return a.title.localeCompare(b.title);
    });
  }, [nowShowingMovies, genre, sort]);

  return (
    <>
      <PageHeader
        eyebrow="Now in theaters"
        title="Movies"
        text="Everything playing at Cinema House this week. Pick a film, then pick your seat."
      />

      <section className="section section--top">
        <div className="container">
          <div className="filters">
            <div className="chips" role="group" aria-label="Filter by genre">
              {genres.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`chip ${genre === item ? 'is-active' : ''}`}
                  onClick={() => setGenre(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="select-inline">
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="title">Title</option>
                <option value="rating">Rating</option>
                <option value="duration">Runtime</option>
              </select>
            </label>
          </div>

          {visible.length ? (
            <div className="movie-grid">
              {visible.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="empty-note">No movies in this genre at the moment.</p>
          )}
        </div>
      </section>
    </>
  );
}
