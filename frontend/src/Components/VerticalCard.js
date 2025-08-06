import React, { useState } from "react";
import { Link } from "react-router-dom";
import scrollTop from "../helpers/scrollTop";

const VerticalCard = React.memo(({ loading, data = [] }) => {
  const loadingList = new Array(12).fill(null);
  const signature = "SXN";
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
            0.5px 0.5px 1px rgba(255,255,255,0.4), /* Reduced white shadow */
            -0.5px -0.5px 1px rgba(0,0,0,0.2); /* Subtle black shadow */
          -webkit-text-stroke: 0.2px #000; /* Thinner stroke */
          color: #333; /* Darker base color for better contrast */
        }
        /* Glossy text styles for headings, reduced intensity */
        .glossy-heading {
          text-shadow:
            0 0 3px rgba(255,255,255,0.5), /* Reduced white glow */
            1px 1px 3px rgba(0,0,0,0.2); /* Reduced black shadow */
          -webkit-text-stroke: 0.4px #333; /* Thinner stroke */
          color: #000; /* Darker base color */
        }
        /* A subtle gloss for icons */
        .glossy-icon-text {
          filter: drop-shadow(0.5px 0.5px 1px rgba(0,0,0,0.4));
        }

        /* Backdrop filter for card background */
        .vertical-card-backdrop {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
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
          border-radius: 1.5rem; /* md:rounded-3xl */
          padding: 1px;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(139, 92, 246, 0.5), /* purple-500 */
            transparent,
            rgba(59, 130, 246, 0.5), /* blue-500 */
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

        .skeleton-shimmer {
            background: linear-gradient(
                90deg,
                rgba(51, 65, 85, 0.3) 25%,
                rgba(71, 85, 105, 0.5) 50%,
                rgba(51, 65, 85, 0.3) 75%
            );
            background-size: 200% 100%;
            animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
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
            outline: 2px solid rgba(139, 92, 246, 0.8);
            outline-offset: 2px;
        }
      `}</style>

      <div className="grid grid-cols-2 gap-4 p-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-5 lg:grid-cols-5 xl:grid-cols-6 xl:gap-6">
        {loading
          ? loadingList.map((_, index) => (
              <div key={index} className="rounded-3xl overflow-hidden animate-pulse vertical-card-skeleton bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                <div className="aspect-square rounded-t-3xl skeleton-shimmer"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2 w-5/6 skeleton-shimmer"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/5 skeleton-shimmer"></div>
                </div>
              </div>
            ))
          : data.map((product) => (
              <Link
                to={`/product/${product._id}`}
                onClick={scrollTop}
                key={product._id}
                className="group relative block bg-gradient-to-br from-slate-800 to-slate-900 vertical-card-backdrop border border-gray-700 rounded-3xl overflow-hidden shadow-lg transition-all duration-400 ease-in-out hover:scale-[1.02] hover:shadow-2xl hover:border-purple-400 focus-visible-purple" // Added black border (gray-700) and yellow border (group-hover:border-yellow-500)
              >
                {/* Bold yellow border overlay */}
                <div className="absolute inset-0 rounded-3xl border-4 border-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                {/* Image Container with Enhanced Styling */}
                <div className="relative aspect-square overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-300 to-gray-800">
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {imageErrors[product._id] ? (
                      <div className="flex flex-col items-center justify-center w-full h-full text-gray-500 bg-gradient-to-br from-gray-200 to-gray-300">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mb-2 opacity-70"
                        >
                          <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" />
                        </svg>
                        <span className="text-xs font-medium opacity-80 glossy-text">No Image</span> {/* Applied glossy-text */}
                      </div>
                    ) : (
                      <img
                        src={product.productImage?.[0] || "/placeholder.jpg"}
                        alt={product.productName}
                        className="w-full h-full object-cover transition-all duration-600 ease-in-out brightness-95 contrast-105 group-hover:scale-110 group-hover:brightness-110 group-hover:contrast-110"
                        loading="lazy"
                        onError={() => handleImageError(product._id)}
                      />
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 relative z-10">
                  <h3 className="text-base font-normal text-gray-200 leading-tight my-2 line-clamp-2 transition-colors duration-300 group-hover:text-white glossy-heading"> {/* Applied glossy-heading */}
                    {product.productName}
                  </h3>
                </div>

                <div className="absolute bottom-3 right-3 z-20">
                  <span className="relative z-10 inline-block text-white text-xs font-extrabold px-2 py-1 rounded-lg tracking-wider shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg vertical-card__signature-text-gradient"> {/* Applied gradient class for text */}
                    {signature}
                  </span>
                  <div className="absolute inset-[-2px] rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-70 z-0"></div>
                </div>

                {/* Animated Border */}
                <div className="vertical-card__border-animation"></div>
              </Link>
            ))}
      </div>
    </>
  );
});

export default VerticalCard;