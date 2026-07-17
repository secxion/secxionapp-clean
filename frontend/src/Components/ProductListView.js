import React from 'react';
import { Link } from 'react-router-dom';
import scrollTop from '../helpers/scrollTop';

const ProductListView = React.memo(({ loading, data = [] }) => {
  const loadingList = new Array(6).fill(null);

  const groupedByCategory = data.reduce((acc, product) => {
    const category = product?.category || 'Others';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  const groupedEntries = Object.entries(groupedByCategory);

  if (loading) {
    return (
      <div className="space-y-5">
        {loadingList.map((_, index) => (
          <div key={index} className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-800 rounded w-40"></div>
            <div className="h-3 bg-gray-800 rounded w-64"></div>
            <div className="h-3 bg-gray-800 rounded w-56"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 text-gray-200">
      {groupedEntries.map(([category, products]) => (
        <section key={category} aria-label={`${category} products`}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-yellow-400 border-b border-gray-700 pb-1">
            {category}
          </h3>
          <ul className="mt-2 space-y-1">
            {products.map((product) => (
              <li key={product._id}>
                <Link
                  to={`/product/${product._id}`}
                  onClick={scrollTop}
                  className="text-sm text-gray-200 hover:text-yellow-300 underline-offset-2 hover:underline"
                >
                  {product.productName}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
});

export default ProductListView;
