import React from 'react';
import './LogoSimmer.css';

const LogoShimmer = ({ type }) => {
  const className = `lshimmer-wrapper ${type}`;
  return (
    <div className={className}>
      <div className="lshimmer-effect"></div>
    </div>
  );
};

export default LogoShimmer;