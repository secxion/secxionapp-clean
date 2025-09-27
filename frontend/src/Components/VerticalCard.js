import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import scrollTop from '../helpers/scrollTop';

const VerticalCard = React.memo(({ loading, data = [] }) => {
  const loadingList = new Array(12).fill(null);
  const signature = 'SXN';
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  return (
    <>
      {/* Inline styles for custom properties and animations not directly supported by Tailwind */}
      <style>{`
        /* Glossy text styles for general use, reduced intensity */
        .glossy-text {
          text-shadow:
            0.5px 0.5px 1px rgba(255,255,255,0.3), /* Reduced white shadow */
            -0.5px -0.5px 1px rgba(0,0,0,0.15); /* Subtle black shadow */
          color: #222; /* Darker base color for better contrast */
        }
        /* Glossy text styles for headings, reduced intensity */
        .glossy-heading {
          text-shadow:
            0 0 2px rgba(255,255,255,0.3), /* Reduced white glow */
            1px 1px 2px rgba(0,0,0,0.15); /* Reduced black shadow */
          color: #111; /* Darker base color */
        }
        /* A subtle gloss for icons */
        .glossy-icon-text {
          filter: drop-shadow(0.5px 0.5px 1px rgba(0,0,0,0.4));
        }

        /* Backdrop filter for card background */
        .vertical-card-backdrop {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        /* Price text gradient fill */
        .vertical-card__amount-gradient {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Signature text gradient fill */
        .vertical-card__signature-text-gradient {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Card border animation */
        .vertical-card__border-animation {
          position: absolute;
          inset: 0;
          border-radius: 1rem; /* md:rounded-3xl */
          padding: 1px;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(139, 92, 246, 0.3), /* purple-500 */
            transparent,
            rgba(59, 130, 246, 0.3), /* blue-500 */
            transparent
          );
          background-size: 300% 300%;
          animation: borderGlow 3s ease infinite;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .group:hover .vertical-card__border-animation {
          opacity: 1;
        }

        @keyframes borderGlow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        /* Skeleton animations */
        .vertical-card-skeleton {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 0.4;
          }
        }

        /* Prefers reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .vertical-card-transition,
          .vertical-card-image-transition,
          .vertical-card-overlay-transition,
          .vertical-card-signature-transition {
            transition: none !important;
          }
          .vertical-card__border-animation,
          .vertical-card-skeleton,
          .skeleton-shimmer {
            animation: none !important;
          }
        }

        /* Focus indicators for keyboard navigation */
        .focus-visible-purple:focus-visible {
            outline: 2px solid #8b5cf6;
            outline-offset: 2px;
        }
      `}</style>

      <div className="grid grid-cols-2 gap-3 p-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-5">
        {loading
          ? loadingList.map((_, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden animate-pulse vertical-card-skeleton bg-gray-900 border border-gray-700"
                style={{ minWidth: 160, maxWidth: 180 }}
              >
                <div className="aspect-square rounded-t-xl bg-gray-800"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-700 rounded mb-2 w-4/5"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))
          : data.map((product) => (
              <Link
                to={`/product/${product._id}`}
                onClick={scrollTop}
                key={product._id || `product-${product.productName}`} // Ensure unique keys
                className="group relative block bg-gray-900 vertical-card-backdrop border border-gray-700 rounded-xl overflow-hidden shadow transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:border-yellow-500 focus-visible-purple"
                style={{ minWidth: 160, maxWidth: 180 }}
              >
                {/* Animated border */}
                <div className="vertical-card__border-animation"></div>

                {/* Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-800 flex items-center justify-center">
                  {imageErrors[product._id] ? (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-500 bg-gray-200">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="mb-2 opacity-70"
                      >
                        <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" />
                      </svg>
                      <span className="text-xs font-medium opacity-80 glossy-text">
                        No Image
                      </span>
                    </div>
                  ) : (
                    <img
                      src={product.productImage?.[0] || '/placeholder.jpg'}
                      alt={product.productName}
                      className="w-full h-full object-cover transition-all duration-400 ease-in-out group-hover:scale-105"
                      loading="lazy"
                      onError={() => handleImageError(product._id)}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="p-3 relative z-10">
                  <h3 className="text-sm font-semibold text-gray-100 leading-tight my-1 line-clamp-2 transition-colors duration-300 group-hover:text-yellow-200 glossy-heading">
                    {product.productName}
                  </h3>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-xs text-gray-400">
                      {product.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {product.brand}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-bold text-yellow-600 text-base">
                      {product.amount?.toLocaleString()}
                    </span>
                    {product.oldAmount && (
                      <span className="text-xs text-gray-500 line-through">
                        {product.oldAmount?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Signature */}
                <div className="absolute bottom-2 right-2 z-20">
                  <span className="inline-block text-yellow-600 text-xs font-extrabold px-2 py-1 rounded tracking-wider shadow transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-800">
                    {signature}
                  </span>
                </div>
              </Link>
            ))}
      </div>
    </>
  );
});

export default VerticalCard;
