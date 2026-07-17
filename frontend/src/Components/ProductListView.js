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
    <div className="space-y-6 text-gray-200">
      {groupedEntries.map(([category, products]) => (
        <section key={category} aria-label={`${category} products`}>
          <h3 className="text-base font-extrabold uppercase tracking-[0.12em] text-yellow-300 border-b border-yellow-500/40 pb-2">
            {category}
          </h3>
          <ul className="mt-3 space-y-2">
            {products.map((product) => (
              <li key={product._id} className="border-l-2 border-gray-700 pl-3">
                <Link
                  to={`/product/${product._id}`}
                  onClick={scrollTop}
                  className="text-[15px] font-semibold tracking-tight text-gray-100 hover:text-yellow-200 transition-colors duration-150"
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
