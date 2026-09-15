import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

export default function PromoCard({ promo, featured = false }) {
  return (
    <article className={`promo promo--${promo.accent} ${featured ? 'promo--featured' : ''}`}>
      {featured ? (
        <div className="promo__art" aria-hidden="true">
          <Icon name="popcorn" size={92} />
        </div>
      ) : null}

      <div className="promo__body">
        <span className="promo__eyebrow">{promo.eyebrow}</span>
        <h3 className="promo__title">{promo.title}</h3>
        <p className="promo__text">{promo.text}</p>
        <Link to={`/promotions#${promo.id}`} className={featured ? 'btn btn--primary btn--sm' : 'promo__link'}>
          Learn more
          <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </article>
  );
}
