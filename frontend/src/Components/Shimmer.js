import React from 'react';
import './Shimmer.css';

const Shimmer = ({ type }) => {
  const className = `shimmer-wrapper ${type}`;
  return (
    <div className={className}>
      <div className="shimmer-effect"></div>
    </div>
  );
};

export default Shimmer;
