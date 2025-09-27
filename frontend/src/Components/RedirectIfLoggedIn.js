import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RedirectIfLoggedIn = ({ children }) => {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default RedirectIfLoggedIn;
