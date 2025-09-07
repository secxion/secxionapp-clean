import React, { useState } from 'react';
import { CgClose } from "react-icons/cg";
import DisplayImage from './DisplayImage';
import { toast } from 'react-toastify';
import SummaryApi from '../common';

const HistoryDetailView = ({
  onClose = () => {},
  fetchData = () => {},
  productDetails = {},
}) => {
  const [data] = useState({
    _id: productDetails?._id || "",
    Image: productDetails?.Image || [],
    totalAmount: productDetails?.totalAmount || "",
    calculatedTotalAmount: productDetails?.calculatedTotalAmount || "",
    userRemark: productDetails?.userRemark || "",
    crImage: productDetails?.crImage || "",
    status: productDetails?.status || "WAIT",
    cancelReason: productDetails?.cancelReason || "",
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
    <div className="fixed inset-0 flex items-start justify-center bg-gray-800 bg-opacity-50 p-4 z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-lg mt-10"
           style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-extrabold text-2xl text-gray-800">Details</h2>
          <button className="text-2xl text-gray-500 hover:text-red-600 cursor-pointer" onClick={onClose}>
            <CgClose />
          </button>
        </div>

        {productDetails && (
          <>
            <h1 className='text-blue-600 p-4 font-semibold -mt-6 gap-3 space-y-4'>{productDetails._id}</h1>
            <div className="border overflow-x-hidden rounded-lg p-4 bg-gray-50 shadow-inner mb-6">
              <div className="flex items-center gap-4">
                {productDetails?.productImage?.[0] && (
                  <img
                    src={productDetails.productImage[0]}
                    alt="Product"
                    className="w-24 h-24 object-cover rounded-lg border" />
                )}
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{productDetails.productName}</h3>
                  <p className="text-gray-600">Currency: {productDetails.pricing?.[0]?.currency || 'N/A'}</p>
                  <p className="text-gray-600">Face Value: {productDetails.pricing?.[0]?.faceValues?.[0]?.faceValue || 'N/A'}</p>
                  <p className="text-gray-600">Rate: {productDetails.pricing?.[0]?.faceValues?.[0]?.sellingPrice || 'N/A'}</p>
                </div>
              </div>
              {productDetails.description && (
                <p className="text-gray-600 mt-4">{productDetails.description}</p>
              )}
            </div>
          </>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-gray-700 mb-2">Images:</label>
            <div className="flex gap-2 mt-4 flex-wrap">
              {data?.Image.length > 0 ? (
                data.Image.map((el, index) => (
                  <div className="relative group" key={index}>
                    <img
                      src={el}
                      alt={`product-${index}`}
                      className="w-20 h-20 object-cover rounded-lg border cursor-pointer"
                      onClick={() => {
                        setOpenFullScreenImage(true);
                        setFullScreenImage(el);
                      }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-red-600 text-sm">*No image uploaded</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="totalAmount" className="block font-medium text-gray-700 mb-2">Total FaceValue:</label>
            <div className='text-gray-900'>{productDetails.totalAmount}</div>
          </div>
          <div>
            <label htmlFor="calculatedTotalAmount" className="block font-medium text-gray-700 mb-2">Total Amount:</label>
            <div className='text-gray-900'>{productDetails.calculatedTotalAmount}</div>
          </div>
          <div>
            <label htmlFor="userRemark" className="block font-medium text-gray-700 mb-2">Remarks:</label>
            <div className='text-gray-900'>{productDetails.userRemark}</div>
          </div>

          {productDetails.crImage && (
            <div>
              <label className="block font-medium text-gray-700 mb-2">Cancel Reason Image:</label>
              <img 
                src={productDetails.crImage} 
                alt="Cancel Reason" 
                className="w-20 h-20 object-cover rounded-lg border cursor-pointer" 
                onClick={() => {
                  setOpenFullScreenCrImage(true);
                  setFullScreenImage(productDetails.crImage);
                }} 
              />
            </div>
          )}

          <div>
            <label className="block font-medium text-gray-700 mb-2">Status:</label>
            <div className='text-gray-900'>{data.status || 'N/A'}</div>
          </div>

          {data.status === "CANCELLED" && (
            <div>
              <label className="block font-medium text-gray-700 mb-2">Cancel Reason:</label>
              <div className='text-red-900'>{data.cancelReason || 'N/A'}</div>
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
    </div>
  );
};

export default HistoryDetailView;
