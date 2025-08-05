import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="container border rounded-lg p-4 shadow-md bg-white">
      <h3 className="text-lg font-bold">{product.productName}</h3>
      <p className="text-gray-600">{product.description}</p>
      <p className="font-semibold">Price: ${product.totalAmount}</p>
    </div>
  );
};

export default ProductCard;
