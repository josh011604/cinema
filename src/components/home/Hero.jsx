import { Link } from 'react-router-dom';
import Icon from '../Icon.jsx';

const PERKS = [
  { icon: 'chip', label: 'Modern Technology' },
  { icon: 'seat', label: 'Comfortable Seats' },
  { icon: 'ticket', label: 'Fast Ticket Purchase' },
  { icon: 'popcorn', label: 'Popcorn & Drinks' }
];

// The auditorium photo behind this section is set in home.css (.hero), where a
// scrim is layered over it so the headline stays readable.
export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <h1 className="hero__title">
            Bright Emotions
            <span className="hero__title-accent">On The Big Screen</span>
          </h1>
          <p className="hero__text">
            Modern Halls, Real Comfort And The Best Movies In Town, For An Evening You Will Remember.
          </p>

          <div className="hero__actions">
            <Link to="/showtimes" className="btn btn--primary hero__cta">
              View Showtimes
              <Icon name="arrowRight" size={16} />
            </Link>
            <Link to="/movies" className="btn btn--ghost hero__cta">
              Browse Movies
            </Link>
          </div>

          <ul className="hero__perks">
            {PERKS.map((perk) => (
              <li key={perk.label}>
                <Icon name={perk.icon} size={18} />
                {perk.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
