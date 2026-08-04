import React, { useState } from 'react';
import HistoryDetailView from './HistoryDetailView';
import { motion } from 'framer-motion';
import DisplayImage from './DisplayImage'; // Import the DisplayImage component

const HistoryCard = ({ data, isDetailViewOpen, onCloseDetailView }) => {
  const [showDetailView, setShowDetailView] = useState(false);
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false); // State for full-screen image
  const [fullScreenImage, setFullScreenImage] = useState(''); // State for the selected image

  const initialStatus = data.status || 'WAIT';

  const handleViewMore = () => {
    setShowDetailView(true);
  };

  const handleImageClick = (imageUrl) => {
    setFullScreenImage(imageUrl); // Set the selected image URL
    setOpenFullScreenImage(true); // Open the full-screen image viewer
  };

  const renderStatusIndicator = (status) => {
    let colorClass = 'text-gray-400';
    let indicator = '⏳ WAIT';

    switch (status) {
      case 'PROCESSING':
        colorClass = 'text-brand-gold';
        indicator = (
          <div className="flex items-center">
            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-4 border-brand-gold border-t-transparent"></div>
            <span>PROCESSING</span>
          </div>
        );
        break;
      case 'DONE':
        colorClass = 'text-emerald-400';
        indicator = '👍✨ DONE';
        break;
      case 'CANCEL':
        colorClass = 'text-red-400';
        indicator = '👎 CANCEL';
        break;
      case 'WAIT':
        colorClass = 'text-gray-400';
        indicator = (
          <div className="flex items-center">
            <div className="mr-2 h-5 w-5 animate-pulse">
              <svg
                className="h-full w-full text-gray-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
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
        className="glass-card mt-4 cursor-pointer rounded-3xl border border-white/10 p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40"
        onClick={onCloseDetailView}
      >
        <div className="w-full">
          <p className="font-spaceGrotesk text-sm font-black uppercase tracking-[0.28em] text-brand-gold/80">
            Market ID
          </p>
          <span className="mt-2 block truncate text-sm text-gray-200">
            {data._id}
          </span>
          <p className="mt-4 text-sm text-gray-400">
            Created At:{' '}
            <span className="mt-1 block truncate text-gray-200">
              {data.timestamp
                ? new Date(data.timestamp).toLocaleString()
                : 'N/A'}
            </span>
          </p>
          <p className="mt-3 text-sm text-gray-400">
            Status:{' '}
            <span className="mt-1 block">
              {renderStatusIndicator(initialStatus)}
            </span>
          </p>
          {initialStatus === 'CANCEL' && (
            <p className="mt-3 text-sm text-gray-400">
              Cancel Reason:{' '}
              <span className="mt-1 block truncate text-gray-200">
                {data.cancelReason || 'N/A'}
              </span>
            </p>
          )}
          {/* Messages */}
          {data.image && (
            <div className="mt-4">
              <img
                key={`${data.image}-${data._id}`} // Ensure unique keys
                src={data.image}
                alt="Transaction"
                className="h-40 w-full rounded-2xl border border-white/10 object-cover transition-transform duration-300 hover:scale-[1.02]"
                onClick={() => {
                  setFullScreenImage(data.image);
                  setOpenFullScreenImage(true);
                }}
              />
            </div>
          )}
          <button
            onClick={handleViewMore}
            className="mt-5 w-full rounded-2xl bg-brand-gold px-4 py-3 font-bold text-brand-dark-base shadow-[0_0_20px_rgba(212,175,55,0.2)] transition duration-200 hover:bg-brand-gold-dark"
          >
            View More
          </button>
        </div>
      </motion.div>

      {/* Full-Screen Image Viewer */}
      {openFullScreenImage && fullScreenImage && (
        <DisplayImage
          imgUrl={fullScreenImage}
          onClose={() => {
            setOpenFullScreenImage(false);
          }}
        />
      )}

      {showDetailView && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <HistoryDetailView
            productDetails={{
              ...data,
              crImage: data.crImage || data.cancelImage || data.image || null,
            }}
            onClose={() => setShowDetailView(false)}
          />
        </div>
      )}
    </>
  );
};

export default HistoryCard;
