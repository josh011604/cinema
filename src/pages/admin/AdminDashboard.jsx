import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import Logo from '../../components/layout/Logo.jsx';
import AdminOverview from './AdminOverview.jsx';
import AdminBookings from './AdminBookings.jsx';
import AdminMovies from './AdminMovies.jsx';
import AdminPricing from './AdminPricing.jsx';
import { timestamp } from '../../lib/format.js';
import { useCinema } from '../../context/CinemaContext.jsx';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'grid', text: 'A Quick Look At Sales, Bookings And Screenings.' },
  { id: 'bookings', label: 'Bookings', icon: 'ticket', text: 'Search And Manage Customer Bookings.' },
  { id: 'movies', label: 'Movies', icon: 'film', text: 'Add, Edit And Organize The Movie Catalog.' },
  { id: 'pricing', label: 'Pricing', icon: 'wallet', text: 'Set Ticket Prices For Each Room Type.' }
];

const todayLabel = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

export default function AdminDashboard() {
  const { admin, logout, refreshBookings } = useCinema();
  const [tab, setTab] = useState('overview');
  const navigate = useNavigate();

  const current = TABS.find((item) => item.id === tab) || TABS[0];
  const name = admin?.username || 'Admin';

  // Bookings change whenever customers check out, so they are re-read each
  // time a tab that shows them is opened.
  useEffect(() => {
    if (tab === 'overview' || tab === 'bookings') refreshBookings();
  }, [tab, refreshBookings]);

  const signOut = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="admin">
      <header className="admin__topbar">
        <div className="container admin__topbar-inner">
          <Logo to="/admin" />

          <nav className="admin__nav" aria-label="Dashboard Sections">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin__tab ${tab === item.id ? 'is-active' : ''}`}
                onClick={() => setTab(item.id)}
                aria-current={tab === item.id ? 'page' : undefined}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="admin__user">
            <Link to="/" className="admin__view-site">
              View Site
            </Link>

            <div
              className="admin__account"
              title={admin ? `Signed In ${timestamp(admin.signedInAt)}` : undefined}
            >
              <span className="admin__avatar" aria-hidden="true">
                {name.charAt(0).toUpperCase()}
              </span>
              <span className="admin__account-meta">
                <strong>{name}</strong>
                <span>Administrator</span>
              </span>
            </div>

            <button type="button" className="btn btn--ghost btn--sm admin__signout" onClick={signOut}>
              <Icon name="logout" size={16} />
              <span className="admin__signout-label">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="admin__body">
        <div className="container">
          <div className="admin__page-head">
            <div>
              <h1 className="admin__page-title">{current.label}</h1>
              <p className="admin__page-text">{current.text}</p>
            </div>
            <p className="admin__date">{todayLabel()}</p>
          </div>

          {tab === 'overview' ? <AdminOverview onOpenBookings={() => setTab('bookings')} /> : null}
          {tab === 'bookings' ? <AdminBookings /> : null}
          {tab === 'movies' ? <AdminMovies /> : null}
          {tab === 'pricing' ? <AdminPricing /> : null}
        </div>
      </main>
    </div>
  );
}
