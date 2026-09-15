import Icon from '../Icon.jsx';

const FACTS = [
  { icon: 'screen', title: '5 Halls', text: 'Modern screens from 2D to IMAX' },
  { icon: 'sound', title: 'Dolby Atmos', text: 'Full immersion in every film' },
  { icon: 'seat', title: 'Comfort', text: 'Wide seats and plenty of legroom' },
  { icon: 'cup', title: 'Cafe', text: 'Popcorn, drinks and snacks' },
  { icon: 'car', title: 'Parking', text: 'Free parking for our guests' }
];

export default function FactsStrip() {
  return (
    <div className="container">
      <ul className="facts">
        {FACTS.map((fact) => (
          <li className="facts__item" key={fact.title}>
            <span className="facts__icon">
              <Icon name={fact.icon} size={22} />
            </span>
            <span className="facts__body">
              <strong>{fact.title}</strong>
              <span>{fact.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
