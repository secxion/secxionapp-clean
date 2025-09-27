/* eslint-disable jsx-a11y/img-redundant-alt */
import React from 'react';

const ProductImageCarousel = ({ images }) => {
  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">No Images</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {images.map((image, index) => (
        <img
          key={index} // Using index as key for now - ideally use a unique ID if available in your image data
          src={image} // Assuming 'image' is the URL string
          alt={`Product image ${index + 1}`}
          height={4}
          width={4}
          className="w-24 h-24 object-cover rounded-lg border"
        />
      ))}
    </div>
  );
};

export default ProductImageCarousel;
