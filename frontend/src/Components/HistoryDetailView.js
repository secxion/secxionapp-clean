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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4">
      <div
        className="glass-card mt-10 w-full max-w-2xl rounded-[28px] border border-white/10 p-6 shadow-2xl"
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold/70">
              Trade Detail
            </p>
            <h2 className="mt-2 text-2xl font-black text-white font-spaceGrotesk tracking-wide">
              Transaction Details
            </h2>
          </div>
          <motion.button
            onClick={onClose}
            className="fixed right-6 top-14 z-[10000] rounded-full border-2 border-white/20 bg-red-600/90 p-3 text-white shadow-2xl transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Close detail view"
          >
            <FaTimes className="w-6 h-6" />
          </motion.button>
        </div>

        {productDetails && (
          <>
            <div className="-mt-6 space-y-4 rounded-2xl border border-white/10 bg-brand-dark-elevated/70 p-4 text-sm text-gray-300 shadow-inner">
              <p className="font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold/80">
                Record ID
              </p>
              <p className="break-all text-gray-100">{productDetails._id}</p>
            </div>
            <div className="mb-6 overflow-x-hidden rounded-2xl border border-white/10 bg-brand-dark-base/70 p-4 shadow-inner">
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
                  <h3 className="text-lg font-bold font-spaceGrotesk text-white">
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
            <label className="mb-2 block font-spaceGrotesk text-xs font-black uppercase tracking-[0.3em] text-brand-gold">
              Images
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
                <p className="text-sm text-red-300">*No images uploaded</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="totalAmount"
              className="mb-2 block font-spaceGrotesk text-xs font-black uppercase tracking-[0.3em] text-brand-gold"
            >
              Total FaceValue
            </label>
            <div className="rounded-2xl border border-white/10 bg-brand-dark-elevated/70 p-3 text-gray-200">
              {productDetails.totalAmount}
            </div>
          </div>
          <div>
            <label
              htmlFor="calculatedTotalAmount"
              className="mb-2 block font-spaceGrotesk text-xs font-black uppercase tracking-[0.3em] text-brand-gold"
            >
              Total Amount
            </label>
            <div className="rounded-2xl border border-white/10 bg-brand-dark-elevated/70 p-3 text-gray-200">
              {productDetails.calculatedTotalAmount}
            </div>
          </div>
          <div>
            <label
              htmlFor="userRemark"
              className="mb-2 block font-spaceGrotesk text-xs font-black uppercase tracking-[0.3em] text-brand-gold"
            >
              Remarks
            </label>
            <div className="rounded-2xl border border-white/10 bg-brand-dark-elevated/70 p-3 text-gray-200">
              {productDetails.userRemark}
            </div>
          </div>

          {productDetails.crImage && (
            <div>
              <label className="mb-2 block font-spaceGrotesk text-xs font-black uppercase tracking-[0.3em] text-brand-gold">
                Cancel Reason Image
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
              <label className="mb-2 block font-spaceGrotesk text-xs font-black uppercase tracking-[0.3em] text-red-400">
                Cancel Reason
              </label>
              <div className="rounded-2xl border border-red-500/30 bg-red-900/20 p-3 text-red-200">
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
