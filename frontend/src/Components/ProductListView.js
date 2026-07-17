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
    <div className="space-y-8 text-gray-200">
      {groupedEntries.map(([category, products]) => (
        <section
          key={category}
          aria-label={`${category} products`}
          className="group"
        >
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-yellow-500/90 mb-4 flex items-center gap-3">
            <span className="h-px bg-gradient-to-r from-yellow-500/60 to-transparent flex-1"></span>
            {category}
            <span className="h-px bg-gradient-to-l from-yellow-500/60 to-transparent flex-1"></span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {products.map((product) => (
              <li key={product._id} className="relative group/item">
                <Link
                  to={`/product/${product._id}`}
                  onClick={scrollTop}
                  className="block px-4 py-2.5 rounded-xl bg-gray-800/30 hover:bg-gray-800/60 border border-gray-700/30 hover:border-yellow-500/40 transition-all duration-200"
                >
                  <span className="text-[14px] font-bold tracking-tight text-gray-100 group-hover/item:text-yellow-400 transition-colors">
                    {product.productName}
                  </span>
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
