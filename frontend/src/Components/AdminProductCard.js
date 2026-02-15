import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdModeEditOutline } from 'react-icons/md';
import AdminEditProduct from './AdminEditProduct';
import { getBrandColor } from '../helpers/brandColors';

const AdminProductCard = ({ data, fetchdata }) => {
  const { productImage, productName, brandName, category } = data;
  const [isEditing, setIsEditing] = useState(false);
  const hasImage = productImage && productImage.length > 0 && productImage[0];
  const brandStyle = getBrandColor(productName, brandName);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden group hover:border-yellow-500/30 transition-all duration-200">
      {/* Image */}
      <div className="aspect-square relative overflow-hidden">
        {hasImage ? (
          <img
            src={productImage[0]}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${brandStyle.bg} flex flex-col items-center justify-center`}
          >
            <span className="text-4xl mb-2">{brandStyle.icon}</span>
            <span className="text-xs font-bold text-center px-2 text-white/80">
              {brandStyle.text}
            </span>
          </div>
        )}
        {/* Edit overlay */}
        <button
          onClick={() => setIsEditing(true)}
          className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
          aria-label={`Edit ${productName}`}
        >
          <div className="p-3 bg-yellow-500 rounded-full text-slate-900 transform scale-75 group-hover:scale-100 transition-transform">
            <MdModeEditOutline size={18} />
          </div>
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white font-medium text-sm line-clamp-2 leading-tight">
          {productName}
        </h3>
        {brandName && (
          <p className="text-slate-400 text-xs mt-1 truncate">{brandName}</p>
        )}
        {category && (
          <span className="inline-block mt-2 px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-400">
            {category}
          </span>
        )}
      </div>

      {isEditing && (
        <AdminEditProduct
          productData={data}
          onClose={() => setIsEditing(false)}
          fetchdata={fetchdata}
        />
      )}
    </div>
  );
};

AdminProductCard.propTypes = {
  data: PropTypes.shape({
    productImage: PropTypes.arrayOf(PropTypes.string).isRequired,
    productName: PropTypes.string.isRequired,
    brandName: PropTypes.string,
    category: PropTypes.string,
  }).isRequired,
  fetchdata: PropTypes.func.isRequired,
};

export default AdminProductCard;
