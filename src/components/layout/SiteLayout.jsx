import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function SiteLayout() {
  return (
    <div className="site">
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
