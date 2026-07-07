import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAuthenticated } from '../utils/tokenStorage';

/**
 * Wraps routes that require the user to be logged in.
 * Redirects to /login if no JWT token is found.
 */
function ProtectedRoute() {
  const { isAuthenticated: authState } = useSelector((state) => state.auth);
  const hasToken = isAuthenticated();

  if (!hasToken && !authState) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
