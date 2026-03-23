import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { authError, authStatus, isAuthenticated } = useAuth();

  if (authStatus === 'checking') {
    return <p className="text-center mt-10">Checking session...</p>;
  }

  if (authStatus === 'error') {
    return <p className="text-center mt-10">{authError}</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
