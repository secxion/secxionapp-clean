import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdModeEditOutline } from 'react-icons/md';
import AdminEditProduct from './AdminEditProduct';
import { getBrandColor, getInitials } from '../helpers/brandColors';

const AdminProductCard = ({ data, fetchdata }) => {
  const { productImage, productName, brandName } = data;
  const [isEditing, setIsEditing] = useState(false);
  const hasImage = productImage && productImage.length > 0 && productImage[0];
  const brandStyle = getBrandColor(productName, brandName);

  return (
    <div className="container bg-white p-4 rounded shadow-md">
      <div className="w-40">
        <div className="w-32 h-32 flex justify-center items-center overflow-hidden rounded-lg">
          {hasImage ? (
            <img
              src={productImage[0]}
              alt={productName}
              className="mx-auto object-cover h-full w-full"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${brandStyle.bg} flex flex-col items-center justify-center text-white`}
            >
              <span className="text-3xl mb-1">{brandStyle.icon}</span>
              <span className="text-xs font-bold text-center px-1">
                {brandStyle.text}
              </span>
            </div>
          )}
        </div>
        <h1 className="text-ellipsis line-clamp-2 font-semibold mt-2">
          {productName}
        </h1>

        <div className="flex justify-end">
          <button
            className="w-fit p-3 bg-green-100 hover:bg-green-600 rounded-full hover:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={() => setIsEditing(true)}
            aria-label={`Edit ${productName}`}
            tabIndex={0}
          >
            <MdModeEditOutline />
          </button>
        </div>
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
  }).isRequired,
  fetchdata: PropTypes.func.isRequired,
};

export default AdminProductCard;
