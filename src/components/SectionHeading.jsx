import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

export default function SectionHeading({ title, link, linkLabel = 'View all', children }) {
  return (
    <div className="section-heading">
      <h2 className="section-heading__title">{title}</h2>
      {children ? <div className="section-heading__slot">{children}</div> : null}
      {link ? (
        <Link to={link} className="section-heading__link">
          {linkLabel}
          <Icon name="arrowRight" size={16} />
        </Link>
      ) : null}
    </div>
  );
}
