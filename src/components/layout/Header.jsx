import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../Icon.jsx';
import Logo from './Logo.jsx';
import SearchPanel from './SearchPanel.jsx';
import { useCinema } from '../../context/CinemaContext.jsx';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/showtimes', label: 'Showtimes' },
  { to: '/movies', label: 'Movies' },
  { to: '/coming-soon', label: 'Coming Soon' },
  { to: '/promotions', label: 'Promotions' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAdmin, customer, logout } = useCinema();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Any navigation closes the mobile menu and the search panel.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', menuOpen || searchOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [menuOpen, searchOpen]);

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container site-header__inner">
          <Logo tagline />

          <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
            <Link to={isAdmin ? '/admin' : '/admin/login'} className="site-nav__link site-nav__link--admin">
              Admin
            </Link>
          </nav>

          <div className="site-header__actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search movies"
            >
              <Icon name="search" size={19} />
            </button>
            <Link
              to={isAdmin ? '/admin' : '/account'}
              className="icon-button"
              aria-label={isAdmin ? 'Open The Admin Dashboard' : customer ? 'Open Your Account' : 'Sign Up Or Sign In'}
              title={isAdmin ? 'Admin Dashboard' : customer ? 'Your Account' : 'Sign Up Or Sign In'}
            >
              <Icon name="user" size={19} />
            </Link>
            {customer ? (
              <button type="button" className="link-button site-header__signout" onClick={logout}>
                Sign Out
              </button>
            ) : null}
            <button type="button" className="btn btn--primary btn--sm" onClick={() => navigate('/showtimes')}>
              Buy Ticket
              <Icon name="ticket" size={16} />
            </button>
            <button
              type="button"
              className={`burger ${menuOpen ? 'is-open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {searchOpen ? <SearchPanel onClose={() => setSearchOpen(false)} /> : null}
    </>
  );
}
