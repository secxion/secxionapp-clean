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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {loadingList.map((_, index) => (
          <div
            key={index}
            className="glass-card p-6 rounded-2xl animate-pulse space-y-4"
          >
            <div className="h-4 bg-white/10 rounded-full w-3/4"></div>
            <div className="h-3 bg-white/5 rounded-full w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {groupedEntries.map(([category, products]) => (
        <section
          key={category}
          aria-label={`${category} products`}
          className="group"
        >
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold/80 mb-6 flex items-center gap-4 font-spaceGrotesk">
            <span className="h-[1px] bg-gradient-to-r from-brand-gold/40 to-transparent flex-1"></span>
            {category}
            <span className="h-[1px] bg-gradient-to-l from-brand-gold/40 to-transparent flex-1"></span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <li key={product._id} className="relative">
                <Link
                  to={`/product/${product._id}`}
                  onClick={scrollTop}
                  className="block glass-card p-4 rounded-xl hover:border-brand-gold/30 group/item transition-all duration-300"
                >
                  <span className="text-sm font-bold font-spaceGrotesk tracking-wide text-gray-200 group-hover/item:text-brand-gold transition-colors uppercase">
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
