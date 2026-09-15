import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon.jsx';
import Logo from './Logo.jsx';

const NAVIGATION = [
  { to: '/', label: 'Home' },
  { to: '/showtimes', label: 'Showtimes' },
  { to: '/movies', label: 'Movies' },
  { to: '/coming-soon', label: 'Coming Soon' },
  { to: '/promotions', label: 'Promotions' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' }
];

const INFORMATION = [
  { to: '/about#rules', label: 'Visitor Rules' },
  { to: '/about#services', label: 'Services' },
  { to: '/promotions', label: 'Gift Cards' },
  { to: '/contact#advertising', label: 'Advertising' },
  { to: '/contact#careers', label: 'Careers' }
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo />
          <p className="site-footer__blurb">
            A new generation movie theater. Five halls, Dolby Atmos sound and the best seats in the city.
          </p>
          <div className="social">
            <a href="#facebook" className="social__link" aria-label="Facebook">
              <Icon name="facebook" size={18} filled />
            </a>
            <a href="#instagram" className="social__link" aria-label="Instagram">
              <Icon name="instagram" size={18} />
            </a>
            <a href="#youtube" className="social__link" aria-label="YouTube">
              <Icon name="youtube" size={18} />
            </a>
          </div>
        </div>

        <div className="site-footer__col">
          <h3>Navigation</h3>
          <ul>
            {NAVIGATION.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col">
          <h3>Information</h3>
          <ul>
            {INFORMATION.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/admin/login">Staff Login</Link>
            </li>
          </ul>
        </div>

        <div className="site-footer__col">
          <h3>Contacts</h3>
          <ul className="site-footer__contacts">
            <li>
              <Icon name="phone" size={16} />
              <a href="tel:+6328123456">+63 (2) 8123-4567</a>
            </li>
            <li>
              <Icon name="mail" size={16} />
              <a href="mailto:hello@cinemahouse.com">hello@cinemahouse.com</a>
            </li>
            <li>
              <Icon name="pin" size={16} />
              <span>Tagbilaran City, Bohol</span>
            </li>
            <li>
              <Icon name="clock" size={16} />
              <span>Open daily, 9:30 AM to 8:00 PM</span>
            </li>
          </ul>
        </div>

        <div className="site-footer__news">
          <h3>Stay in the loop</h3>
          <p>Subscribe for premiere news and special offers.</p>
          {subscribed ? (
            <p className="site-footer__thanks">
              <Icon name="check" size={16} /> Thank you, your subscription is confirmed.
            </p>
          ) : (
            <form className="newsletter" onSubmit={submit} noValidate>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your e-mail"
                aria-label="Your e-mail address"
                required
              />
              <button type="submit" className="newsletter__submit" aria-label="Subscribe">
                <Icon name="arrowRight" size={18} />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} Cinema House. All rights reserved.</span>
        <Link to="/about#privacy">Privacy Policy</Link>
      </div>
    </footer>
  );
}
