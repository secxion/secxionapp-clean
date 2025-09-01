import React from 'react';
import SecxionShimmer from './SecxionShimmer';

const Shimmer = ({ type = "card", count = 3 }) => {
  return <SecxionShimmer type={type} count={count} />;
};

export default Shimmer;
