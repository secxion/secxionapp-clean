import React from 'react';

/**
 * ProductCard - Display product information in a card format
 * Memoized for performance optimization - prevents unnecessary re-renders
 */
const ProductCard = ({ product }) => {
  return (
    <div className="container border rounded-lg p-4 shadow-md bg-white">
      <h3 className="text-lg font-bold">{product.productName}</h3>
      <p className="text-gray-600">{product.description}</p>
      <p className="font-semibold">Price: ${product.totalAmount}</p>
    </div>
  );
};

export default React.memo(ProductCard);
