import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RedirectIfLoggedIn = ({ children }) => {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default RedirectIfLoggedIn;
