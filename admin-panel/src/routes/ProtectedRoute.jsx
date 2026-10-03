import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, allowedRoles, requireOnboarding = true }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // Wait for session restoration before making a decision
  if (loading) return null;

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Enforce onboarding for employees
  if (requireOnboarding && role === 'employee' && !user.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // If allowedRoles is specified, check if user's role is permitted
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}