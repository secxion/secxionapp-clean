import React, { useState } from "react";
import HistoryDetailView from './HistoryDetailView';
import { motion } from "framer-motion";
import DisplayImage from './DisplayImage'; // Import the DisplayImage component

const HistoryCard = ({ data, isDetailViewOpen, onCloseDetailView }) => {
  const [showDetailView, setShowDetailView] = useState(false);
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false); // State for full-screen image
  const [fullScreenImage, setFullScreenImage] = useState(""); // State for the selected image

  const initialStatus = data.status || 'WAIT';

  const handleViewMore = () => {
    setShowDetailView(true);
  };

  const handleImageClick = (imageUrl) => {
    setFullScreenImage(imageUrl); // Set the selected image URL
    setOpenFullScreenImage(true); // Open the full-screen image viewer
  };

  const renderStatusIndicator = (status) => {
    let colorClass = "text-gray-500";
    let indicator = "⏳ WAIT";

    switch (status) {
      case 'PROCESSING':
        colorClass = "text-deep-golden-yellow-500";
        indicator = (
          <div className="flex items-center">
            <div className="animate-spin h-5 w-5 border-4 border-deep-golden-yellow-500 rounded-full border-t-transparent mr-2"></div>
            <span>PROCESSING</span>
          </div>
        );
        break;
      case 'DONE':
        colorClass = "text-green-500";
        indicator = "👍✨ DONE";
        break;
      case 'CANCEL':
        colorClass = "text-red-500";
        indicator = "👎 CANCEL";
        break;
      case 'WAIT':
        colorClass = "text-gray-500";
        indicator = (
          <div className="flex items-center">
            <div className="animate-pulse h-5 w-5 mr-2">
              <svg className="h-full w-full text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C10.34 2 9 3.34 9 5v6H7c-1.66 0-3 1.34-3 3s1.34 3 3 3h2v6c0 1.66 1.34 3 3 3s3-1.34 3-3v-6h2c1.66 0 3-1.34 3-3s-1.34-3-3-3h-2V5c0-1.66-1.34-3-3-3z" />
              </svg>
            </div>
            <span>WAIT</span>
          </div>
        );
        break;
      default:
        return null;
    }

    return <span className={colorClass}>{indicator}</span>;
  };

  return (
    <>
      <motion.div
        className='container mt-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300 cursor-pointer border border-yellow-700/30'
        onClick={onCloseDetailView}
        whileHover={{ backgroundColor: "#232323" }}
      >
        <div className='w-full'>
          <p className="text-yellow-400 font-semibold">
            Market ID: <span className='truncate block text-gray-200'>{data._id}</span>
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Created At: <span className='truncate block'>{data.timestamp ? new Date(data.timestamp).toLocaleString() : "N/A"}</span>
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Status: <span className='truncate block'>{renderStatusIndicator(initialStatus)}</span>
          </p>
          {initialStatus === 'CANCEL' && (
            <p className="text-gray-400 text-sm mt-1">
              Cancel Reason: <span className='truncate block'>{data.cancelReason || 'N/A'}</span>
            </p>
          )}
          {/* Messages */}
          {data.image && (
            <div className="mt-4">
              <img
                key={`${data.image}-${data._id}`} // Ensure unique keys
                src={data.image}
                alt="Transaction"
                className="w-full h-40 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  setFullScreenImage(data.image);
                  setOpenFullScreenImage(true);
                }}
              />
            </div>
          )}
          <button
            onClick={handleViewMore}
            className="mt-4 bg-yellow-500 text-gray-900 font-bold p-2 rounded-lg hover:bg-yellow-600 transition duration-200 w-full shadow"
          >
            View More
          </button>
        </div>
      </motion.div>

      {/* Full-Screen Image Viewer */}
      {openFullScreenImage && fullScreenImage && (
        console.log("Rendering DisplayImage with:", fullScreenImage), // Debug log
        <DisplayImage
          imgUrl={fullScreenImage} // Pass the selected image URL
          onClose={() => {
            console.log("Closing DisplayImage from HistoryCard"); // Debug log
            setOpenFullScreenImage(false);
          }}
        />
      )}

      {showDetailView && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <HistoryDetailView
            productDetails={{
              ...data,
              crImage: data.crImage || data.cancelImage || data.image || null
            }}
            onClose={() => setShowDetailView(false)}
          />
        </div>
      )}

    </>
  );
};

export default HistoryCard;