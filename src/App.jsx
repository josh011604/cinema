import { Route, Routes } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';
import Home from './pages/Home.jsx';
import Movies from './pages/Movies.jsx';
import MovieDetails from './pages/MovieDetails.jsx';
import Showtimes from './pages/Showtimes.jsx';
import ComingSoon from './pages/ComingSoon.jsx';
import Promotions from './pages/Promotions.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Booking from './pages/Booking.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';
import NotFound from './pages/NotFound.jsx';
import Account from './pages/Account.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public website */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:movieId" element={<MovieDetails />} />
          <Route path="/showtimes" element={<Showtimes />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/account" element={<Account />} />
          <Route path="/booking/:movieId" element={<Booking />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation/:code" element={<Confirmation />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Staff area */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
      </Routes>
    </>
  );
}
