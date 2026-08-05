import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SecxionSpinner from './SecxionSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="premium-bg flex h-screen items-center justify-center">
        <SecxionSpinner size="large" message="" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
