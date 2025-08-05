// src/Components/SafeLink.jsx
import React from "react";
import { Link } from "react-router-dom";
import { obscureRoute } from "../utils/obscureRoute";

// Utility: Check if link is external
const isExternal = (url) => /^https?:\/\//i.test(url);

// Utility: Check if already obfuscated (very naive check, improve if needed)
const isObscured = (url) => /^[a-z0-9]{6,}-[a-z0-9]{6,}$/i.test(url.replace(/^\//, ""));

const SafeLink = ({ to = "#", className = "", children, ...rest }) => {
  if (!to) return <span className={className} {...rest}>{children}</span>;

  if (isExternal(to)) {
    return (
      <a href={to} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  const path = isObscured(to) ? to : obscureRoute(to);

  return (
    <Link to={path} className={className} {...rest}>
      {children}
    </Link>
  );
};

export default SafeLink;
