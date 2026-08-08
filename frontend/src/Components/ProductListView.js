import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import scrollTop from '../helpers/scrollTop';
import { ensureHttpsUrl } from '../utils/secureUrl';

const ProductThumbnail = ({ product }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = product?.productImage?.[0];

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-black/30 p-0.5 shadow-inner">
      {imageUrl && !imageFailed ? (
        <img
          src={ensureHttpsUrl(imageUrl)}
          alt=""
          className="h-full w-full object-contain transition-transform duration-300 group-hover/item:scale-105"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <ImageIcon
          className="h-3.5 w-3.5 text-brand-gold/35"
          aria-hidden="true"
        />
      )}
    </span>
  );
};

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
            className="glass-card flex items-center justify-between gap-2.5 rounded-xl p-2.5 animate-pulse"
          >
            <div className="h-4 w-1/2 rounded-full bg-white/10"></div>
            <div className="h-8 w-8 shrink-0 rounded-md bg-white/5"></div>
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
                  className="group/item flex min-h-16 items-center gap-2.5 rounded-xl p-2.5 glass-card transition-all duration-300 hover:border-brand-gold/30"
                >
                  <ProductThumbnail product={product} />
                  <span className="min-w-0 text-sm font-bold font-spaceGrotesk tracking-wide text-gray-200 group-hover/item:text-brand-gold transition-colors uppercase">
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
