import React, { useState } from 'react';
import { CgClose } from 'react-icons/cg';
import DisplayImage from './DisplayImage';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const HistoryDetailView = ({
  onClose = () => {},
  fetchData = () => {},
  productDetails = {},
}) => {
  const [data] = useState({
    _id: productDetails?._id || '',
    Image: productDetails?.Image || [],
    totalAmount: productDetails?.totalAmount || '',
    calculatedTotalAmount: productDetails?.calculatedTotalAmount || '',
    userRemark: productDetails?.userRemark || '',
    crImage: productDetails?.crImage || '',
    status: productDetails?.status || 'WAIT',
    cancelReason: productDetails?.cancelReason || '',
  });

  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState('');

  const handleImageClick = (imageUrl) => {
    setFullScreenImage(imageUrl);
    setOpenFullScreenImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(SummaryApi.marketRecord.url, {
        method: SummaryApi.marketRecord.method,
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success(responseData.message);
        onClose();
        fetchData();
      } else {
        toast.error(responseData.message || 'An error occurred.');
      }
    } catch (error) {
      toast.error('Failed to update record.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-70 p-4 z-50">
      <div
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 p-6 rounded-2xl w-full max-w-2xl shadow-2xl mt-10"
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-extrabold text-2xl text-yellow-400">
            Transaction Details
          </h2>
          <motion.button
            onClick={onClose}
            className="fixed top-14 right-6 z-[10000] bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500/50 border-2 border-white/20"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            whileHover={{
              rotate: 90,
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
            }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close detail view"
          >
            <FaTimes className="w-6 h-6" />
          </motion.button>
        </div>

        {productDetails && (
          <>
            <h1 className="text-yellow-400 p-4 font-semibold -mt-6 gap-3 space-y-4">
              {productDetails._id}
            </h1>
            <div className="border overflow-x-hidden rounded-lg p-4 bg-gray-950 shadow-inner mb-6">
              <div className="flex items-center gap-4">
                {productDetails?.productImage?.[0] && (
                  <img
                    src={productDetails.productImage[0]}
                    alt="Product"
                    className="w-24 h-24 object-cover rounded-lg border border-yellow-700 cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() =>
                      handleImageClick(productDetails.productImage[0])
                    }
                  />
                )}
                <div>
                  <h3 className="font-bold text-yellow-400 text-lg">
                    {productDetails.productName}
                  </h3>
                  <p className="text-gray-300">
                    Currency: {productDetails.pricing?.[0]?.currency || 'N/A'}
                  </p>
                  <p className="text-gray-300">
                    Face Value:{' '}
                    {productDetails.pricing?.[0]?.faceValues?.[0]?.faceValue ||
                      'N/A'}
                  </p>
                  <p className="text-gray-300">
                    Rate:{' '}
                    {productDetails.pricing?.[0]?.faceValues?.[0]
                      ?.sellingPrice || 'N/A'}
                  </p>
                </div>
              </div>
              {productDetails.description && (
                <p className="text-gray-400 mt-4">
                  {productDetails.description}
                </p>
              )}
            </div>
          </>
        )}

        <form className="space-y-6">
          <div>
            <label className="block font-medium text-yellow-400 mb-2">
              Images:
            </label>
            <div className="flex gap-2 mt-4 flex-wrap">
              {data?.Image.length > 0 ? (
                data.Image.map((el, index) => (
                  <div className="relative group" key={index}>
                    <img
                      src={el}
                      alt={`product-${index}`}
                      className="w-20 h-20 object-cover rounded-lg border border-yellow-700 cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={() => handleImageClick(el)}
                    />
                  </div>
                ))
              ) : (
                <p className="text-red-400 text-sm">*No images uploaded</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="totalAmount"
              className="block font-medium text-yellow-400 mb-2"
            >
              Total FaceValue:
            </label>
            <div className="text-gray-200 bg-gray-800 p-3 rounded-lg">
              {productDetails.totalAmount}
            </div>
          </div>
          <div>
            <label
              htmlFor="calculatedTotalAmount"
              className="block font-medium text-yellow-400 mb-2"
            >
              Total Amount:
            </label>
            <div className="text-gray-200 bg-gray-800 p-3 rounded-lg">
              {productDetails.calculatedTotalAmount}
            </div>
          </div>
          <div>
            <label
              htmlFor="userRemark"
              className="block font-medium text-yellow-400 mb-2"
            >
              Remarks:
            </label>
            <div className="text-gray-200 bg-gray-800 p-3 rounded-lg">
              {productDetails.userRemark}
            </div>
          </div>

          {productDetails.crImage && (
            <div>
              <label className="block font-medium text-yellow-400 mb-2">
                Cancel Reason Image:
              </label>
              <img
                src={productDetails.crImage}
                alt="Cancel Reason"
                className="w-20 h-20 object-cover rounded-lg border border-yellow-700 cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => {
                  setOpenFullScreenImage(true);
                  setFullScreenImage(productDetails.crImage);
                }}
              />
            </div>
          )}

          {data.status === 'CANCEL' && (
            <div>
              <label className="block font-medium text-red-400 mb-2">
                Cancel Reason:
              </label>
              <div className="text-red-200 bg-red-900/20 border border-red-500/30 p-3 rounded-lg">
                {data.cancelReason || 'N/A'}
              </div>
            </div>
          )}
        </form>
      </div>

      {openFullScreenImage && (
        <DisplayImage
          imgUrl={fullScreenImage}
          onClose={() => setOpenFullScreenImage(false)}
        />
      )}
    </div>
  );
};

export default HistoryDetailView;
