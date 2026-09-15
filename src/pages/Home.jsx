import { useMemo, useState } from 'react';
import Hero from '../components/home/Hero.jsx';
import FactsStrip from '../components/home/FactsStrip.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import CardRail from '../components/CardRail.jsx';
import MovieCard from '../components/MovieCard.jsx';
import PromoCard from '../components/PromoCard.jsx';
import { PROMOTIONS } from '../data/promotions.js';
import { useCinema } from '../context/CinemaContext.jsx';

const TABS = [
  { id: 'now', label: 'Now Showing' },
  { id: 'soon', label: 'Coming Soon' },
  { id: 'special', label: 'Special Screenings' }
];

export default function Home() {
  const { nowShowingMovies, comingSoonMovies } = useCinema();
  const [tab, setTab] = useState('now');

  const tabMovies = useMemo(() => {
    if (tab === 'soon') return comingSoonMovies;
    if (tab === 'special') return nowShowingMovies.filter((m) => m.format.includes('IMAX'));
    return nowShowingMovies;
  }, [tab, nowShowingMovies, comingSoonMovies]);

  const featuredPromo = PROMOTIONS.find((p) => p.featured);
  const otherPromos = PROMOTIONS.filter((p) => !p.featured).slice(0, 2);

  return (
    <>
      <Hero />
      <FactsStrip />

      <section className="section">
        <div className="container">
          <SectionHeading title="Showtimes" link="/showtimes">
            <div className="tabs" role="tablist" aria-label="Movie lists">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={`tabs__btn ${tab === item.id ? 'is-active' : ''}`}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </SectionHeading>

          {tabMovies.length ? (
            <CardRail>
              {tabMovies.map((movie) => (
                <div className="rail__item" key={movie.id}>
                  <MovieCard movie={movie} variant={movie.status === 'coming-soon' ? 'coming-soon' : 'now-showing'} />
                </div>
              ))}
            </CardRail>
          ) : (
            <p className="empty-note">Nothing scheduled in this list right now.</p>
          )}
        </div>
      </section>

      <section className="section section--tight">
        <div className="container promo-grid">
          {featuredPromo ? <PromoCard promo={featuredPromo} featured /> : null}
          {otherPromos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading title="Coming Soon" link="/coming-soon" />
          <CardRail>
            {comingSoonMovies.map((movie) => (
              <div className="rail__item" key={movie.id}>
                <MovieCard movie={movie} variant="coming-soon" />
              </div>
            ))}
          </CardRail>
        </div>
      </section>
    </>
  );
}
