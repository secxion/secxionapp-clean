import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RedirectIfLoggedIn = ({ children }) => {
  const { user, loading } = useSelector((state) => state.user);
  const isDevAuthBypass =
    process.env.REACT_APP_DEV_AUTH_BYPASS === 'true' &&
    process.env.NODE_ENV !== 'production';

  if (isDevAuthBypass) {
    return <Navigate to="/home" replace />;
  }

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default RedirectIfLoggedIn;
