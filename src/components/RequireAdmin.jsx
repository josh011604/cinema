import { Navigate, useLocation } from 'react-router-dom';
import AppStatus from './AppStatus.jsx';
import { useCinema } from '../context/CinemaContext.jsx';

// Guards the dashboard: anyone who is not signed in is sent to the login page
// and returned to the page they wanted once they authenticate. While the saved
// session is still being checked, a loader shows instead of a false redirect.
export default function RequireAdmin({ children }) {
  const { isAdmin, authReady } = useCinema();
  const location = useLocation();

  if (!authReady) return <AppStatus loading />;

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
