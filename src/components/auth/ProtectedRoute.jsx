import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AccessDenied from './AccessDenied';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isAuthorized, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071426] flex items-center justify-center text-white font-mono text-xs">
        Loading System Security Session...
      </div>
    );
  }

  // 1. Not Authenticated -> Redirect to Login immediately
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Specific Role requirement check
  if (requiredRole && user.role !== requiredRole && user.role !== 'MAIN_OFFICER') {
    return <AccessDenied pathOverride={location.pathname} />;
  }

  // 3. Permission matrix check
  if (!isAuthorized(location.pathname)) {
    return <AccessDenied pathOverride={location.pathname} />;
  }

  // 4. Authorized -> Render children
  return children;
}
