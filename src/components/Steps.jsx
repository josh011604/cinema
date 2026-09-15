import Icon from './Icon.jsx';

const STEPS = [
  { id: 1, label: 'Showtime & seats' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Ticket ready' }
];

export default function Steps({ current }) {
  return (
    <ol className="steps" aria-label="Booking progress">
      {STEPS.map((step) => {
        const state = step.id < current ? 'is-done' : step.id === current ? 'is-current' : '';
        return (
          <li key={step.id} className={`steps__item ${state}`}>
            <span className="steps__bullet">{step.id < current ? <Icon name="check" size={14} /> : step.id}</span>
            <span className="steps__label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
