import React from 'react';
import { FaImage, FaCoins } from 'react-icons/fa';

/**
 * MarketCard - Displays market/product details with pricing information
 * Modern, responsive design with improved UX
 * Memoized for performance optimization
 */
const MarketCard = ({ market }) => {
  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return typeof value === 'number'
      ? value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : value;
  };

  if (!market) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <p className="text-slate-400">No market data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-yellow-500/30 transition-all">
      {/* Product Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-1">
          {market.productName || 'Unnamed Product'}
        </h3>
        {market.description && (
          <p className="text-slate-400 text-sm">{market.description}</p>
        )}
      </div>

      {/* Total Amount */}
      {market.totalAmount && (
        <div className="bg-slate-800/50 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
          <p className="text-slate-400 text-xs mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-yellow-500">
            {formatCurrency(market.totalAmount)}
          </p>
        </div>
      )}

      {/* Pricing Details */}
      {market.pricing && market.pricing.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FaCoins className="text-yellow-500" />
            <h4 className="text-white font-semibold">Pricing Details</h4>
          </div>
          <div className="space-y-3">
            {market.pricing.map((price, index) => (
              <div
                key={price._id || index}
                className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4"
              >
                <div className="mb-3">
                  <p className="text-slate-400 text-xs mb-1">Currency</p>
                  <p className="text-white font-semibold">
                    {price.currency || 'N/A'}
                  </p>
                </div>

                {/* Face Values */}
                {price.faceValues && price.faceValues.length > 0 ? (
                  <div>
                    <p className="text-slate-400 text-xs font-semibold mb-2">
                      Available Rates
                    </p>
                    <div className="space-y-2">
                      {price.faceValues.map((face, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-2 gap-3 p-3 bg-slate-900/50 rounded-lg text-sm"
                        >
                          <div>
                            <p className="text-slate-500 text-xs mb-0.5">
                              Face Value
                            </p>
                            <p className="text-white font-semibold">
                              {face.faceValue || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs mb-0.5">
                              Rate
                            </p>
                            <p className="text-emerald-400 font-bold">
                              {formatCurrency(face.sellingPrice)}
                            </p>
                          </div>
                          {face.description && (
                            <p className="col-span-2 text-slate-400 text-xs mt-1">
                              📝 {face.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">
                    No pricing tiers available
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Image */}
      {market.Image && market.Image.length > 0 ? (
        <div className="mt-4 rounded-lg overflow-hidden">
          <img
            src={market.Image[0]}
            alt={market.productName}
            className="w-full max-h-72 object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="mt-4 p-8 bg-slate-800/30 rounded-lg text-center border border-dashed border-slate-700/50">
          <FaImage className="text-slate-600 text-3xl mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No image available</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(MarketCard);
