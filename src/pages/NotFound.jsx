import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section section--top">
      <div className="container narrow center">
        <p className="notfound__code">404</p>
        <h1 className="page-header__title">This screening does not exist</h1>
        <p className="page-header__text">The page you were looking for has left the theater.</p>
        <div className="confirm__actions">
          <Link to="/" className="btn btn--primary">
            Back to home
          </Link>
          <Link to="/showtimes" className="btn btn--ghost">
            See showtimes
          </Link>
        </div>
      </div>
    </section>
  );
}
