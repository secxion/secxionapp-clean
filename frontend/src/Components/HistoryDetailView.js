import React, { useState } from 'react';
import { CgClose } from "react-icons/cg";
import DisplayImage from './DisplayImage';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import { motion } from "framer-motion"; // Import motion

const HistoryDetailView = ({
  onClose = () => { },
  fetchData = () => { },
  productDetails = {},
}) => {
  // Fix: Ensure crImage and cancelReason are picked from all possible sources
  const [data] = useState({
    _id: productDetails?._id || "",
    Image: productDetails?.Image || [],
    totalAmount: productDetails?.totalAmount || "",
    calculatedTotalAmount: productDetails?.calculatedTotalAmount || "",
    userRemark: productDetails?.userRemark || "",
    crImage: productDetails?.crImage || productDetails?.image || productDetails?.cancelImage || "",
    status: productDetails?.status || "WAIT",
    cancelReason: productDetails?.cancelReason || productDetails?.reason || "",
  });

  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");
  const [openFullScreenCrImage, setOpenFullScreenCrImage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(SummaryApi.marketRecord.url, {
        method: SummaryApi.marketRecord.method,
        credentials: 'include',
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success(responseData.message);
        onClose();
        fetchData();
      } else {
        toast.error(responseData.message || "An error occurred.");
      }
    } catch (error) {
      toast.error("Failed to update record.");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-70 p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 p-6 rounded-2xl w-full max-w-2xl shadow-2xl mt-10"
        style={{ maxHeight: '85vh', overflowY: 'auto' }}>

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-extrabold text-2xl text-yellow-400">Details</h2>
          <button className="text-2xl text-gray-400 hover:text-yellow-400 cursor-pointer" onClick={onClose}>
            <CgClose />
          </button>
        </div>

        {productDetails && (
          <div className="border overflow-x-hidden rounded-lg p-4 bg-gray-950 shadow-inner mb-6">
            <div className="flex items-center gap-4">
              {productDetails?.productImage?.[0] && (
                <img
                  src={productDetails.productImage[0]}
                  alt="Product"
                  className="w-24 h-24 object-cover rounded-lg border border-yellow-700"
                />
              )}
              <div>
                <h3 className="font-bold text-yellow-400 text-lg">{productDetails.productName}</h3>
                <p className="text-gray-300">Currency: {productDetails.pricing?.[0]?.currency || 'N/A'}</p>

                <p className="text-gray-300">Face Value: {productDetails.pricing?.[0]?.faceValues?.[0]?.faceValue || 'N/A'}</p>
                <p className="text-gray-300">Rate: {productDetails.pricing?.[0]?.faceValues?.[0]?.sellingPrice || 'N/A'}</p>
              </div>
            </div>
            {productDetails.description && (
              <p className="text-gray-400 mt-4">{productDetails.description}</p>
            )}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-yellow-400 mb-2">Images:</label>
            <div className="flex gap-2 mt-4 flex-wrap">
              {data?.Image.length > 0 ? (
                data.Image.map((el, index) => (
                  <div className="relative group" key={index}>
                    <img
                      src={el}
                      alt={`product-${index}`}
                      className="w-20 h-20 object-cover rounded-lg border border-yellow-700 cursor-pointer "
                      onClick={() => {
                        setOpenFullScreenImage(true);
                        setFullScreenImage(el);
                      }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-red-400 text-sm">*No image uploaded</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="totalAmount" className="block font-medium text-yellow-400 mb-2">Total FaceValue:</label>
            <div className="text-gray-200">{productDetails.totalAmount}</div>
          </div>
          <div>
            <label htmlFor="calculatedTotalAmount" className="block font-medium text-yellow-400 mb-2">Total Amount:</label>
            <div className="text-gray-200">{productDetails.calculatedTotalAmount}</div>
          </div>
          <div>
            <label htmlFor="userRemark" className="block font-medium text-yellow-400 mb-2">Remarks:</label>
            <div className="text-gray-200">{productDetails.userRemark}</div>
          </div>

          {/* Cancel Reason Image (fix: use data.crImage) */}
          {data.crImage && (
            <div>
              <label className="block font-medium text-yellow-400 mb-2">Cancel Reason Image:</label>
              <img
                src={data.crImage}
                alt="Cancel Reason"
                className="w-20 h-20 object-cover rounded-lg border border-yellow-700 cursor-pointer"
                onClick={() => {
                  setOpenFullScreenCrImage(true);
                  setFullScreenImage(data.crImage);
                }}
              />
            </div>
          )}

          <div>
            <label className="block font-medium text-yellow-400 mb-2">Status:</label>
            <div className="text-gray-200">{data.status || 'N/A'}</div>
          </div>

          {data.status === "CANCELLED" && (
            <div>
              <label className="block font-medium text-yellow-400 mb-2">Cancel Reason:</label>
              <div className="text-gray-200">{data.cancelReason || 'N/A'}</div>
            </div>
          )}
        </form>
      </div>

      {openFullScreenImage && (
        <DisplayImage
          onClose={() => setOpenFullScreenImage(false)}
          imgUrl={fullScreenImage}
        />
      )}

      {openFullScreenCrImage && (
        <DisplayImage
          onClose={() => setOpenFullScreenCrImage(false)}
          imgUrl={fullScreenImage}
        />
      )}
    </motion.div>
  );
};

export default HistoryDetailView;