import PageHeader from '../components/PageHeader.jsx';
import Icon from '../components/Icon.jsx';

const SERVICES = [
  { icon: 'screen', title: 'Five halls', text: 'One 96 seat IMAX hall and four 62 seat Standard halls.' },
  { icon: 'sound', title: 'Dolby Atmos', text: 'Object based sound in every hall, tuned twice a year.' },
  { icon: 'seat', title: 'Recliners and sofas', text: 'VIP recliners in the middle rows, love seats on the back row.' },
  { icon: 'cup', title: 'Cafe and bar', text: 'Fresh popcorn, hot food, coffee and cold drinks until closing.' },
  { icon: 'car', title: 'Free parking', text: 'Three basement levels, free for guests with a ticket.' },
  { icon: 'ticket', title: 'Private screenings', text: 'Rent a hall for a birthday, a team night or a school event.' }
];

const RULES = [
  'Please arrive 15 minutes before the screening starts.',
  'Age ratings are enforced. Bring a valid ID for 16+ and 18+ films.',
  'Outside food and drinks are not allowed inside the halls.',
  'Recording any part of a film is prohibited and reported.',
  'Tickets can be refunded up to 2 hours before the screening.',
  'Children under 7 must be accompanied by an adult.'
];

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="Since 2014"
        title="About Cinema House"
        text="A neighborhood theater built around one idea: the movie should feel bigger here than anywhere else."
      />

      <section className="section section--top">
        <div className="container about-grid">
          <div className="about-text">
            <h2>Our story</h2>
            <p>
              Cinema House opened with two halls and a very loud projector. Ten years later we run five halls, a
              cafe and a bar, and we still program every week by hand: the big premieres, the small dramas, the
              afternoon classics.
            </p>
            <p>
              We keep the rooms dark, the sound calibrated and the seats wide. Everything else, from the popcorn
              to the online booking, exists to make those two hours easier to get to.
            </p>
          </div>

          <ul className="about-stats">
            <li>
              <strong>5</strong>
              <span>halls</span>
            </li>
            <li>
              <strong>344</strong>
              <span>seats</span>
            </li>
            <li>
              <strong>32</strong>
              <span>screenings a day</span>
            </li>
            <li>
              <strong>10 yrs</strong>
              <span>in the neighborhood</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="section" id="services">
        <div className="container">
          <h2 className="section-heading__title">Services</h2>
          <ul className="service-grid">
            {SERVICES.map((service) => (
              <li key={service.title}>
                <span className="service-grid__icon">
                  <Icon name={service.icon} size={22} />
                </span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="rules">
        <div className="container narrow">
          <h2 className="section-heading__title">Visitor rules</h2>
          <ul className="rules">
            {RULES.map((rule) => (
              <li key={rule}>
                <Icon name="check" size={16} />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="privacy">
        <div className="container narrow">
          <h2 className="section-heading__title">Privacy policy</h2>
          <p className="muted">
            We collect only what a booking needs: your name, email and mobile number, so we can send the ticket and
            reach you if a screening changes. Payment details are handled by the payment provider and are never
            stored in full on our side. In this demo build, bookings live in your own browser storage and are never
            sent anywhere.
          </p>
        </div>
      </section>
    </>
  );
}
