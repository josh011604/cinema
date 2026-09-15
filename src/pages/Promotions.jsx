import PageHeader from '../components/PageHeader.jsx';
import Icon from '../components/Icon.jsx';
import { PROMOTIONS } from '../data/promotions.js';

export default function Promotions() {
  return (
    <>
      <PageHeader
        eyebrow="Save on every visit"
        title="Promotions"
        text="Discounts, bundles and perks that run all year at Cinema House."
      />

      <section className="section section--top">
        <div className="container">
          <ul className="promo-list">
            {PROMOTIONS.map((promo) => (
              <li className={`promo-detail promo--${promo.accent}`} id={promo.id} key={promo.id}>
                <div className="promo-detail__badge">{promo.eyebrow}</div>
                <div className="promo-detail__body">
                  <h2>{promo.title}</h2>
                  <p>{promo.text}</p>
                  <p className="promo-detail__terms">
                    <Icon name="shield" size={15} />
                    {promo.terms}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
