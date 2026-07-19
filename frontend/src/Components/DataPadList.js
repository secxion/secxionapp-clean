import React from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaTag, FaClock, FaImage } from 'react-icons/fa';
import SecxionShimmer from './SecxionShimmer';

const DataPadList = ({
  dataPads,
  onOpen,
  onDelete,
  onImageClick,
  isLoading,
}) => {
  if (isLoading) {
    return <SecxionShimmer type="list" count={5} />;
  }

  return (
    <div className="space-y-4">
      {dataPads.map((pad, index) => (
        <motion.div
          key={pad._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="group bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-purple-600/30 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1 cursor-pointer" onClick={() => onOpen(pad)}>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-200">
                {pad.title}
              </h3>
              <p className="text-gray-300 leading-relaxed line-clamp-2 mb-4">
                {pad.content}
              </p>

              {/* Image Previews */}
              {pad.media && pad.media.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                  {pad.media.map((img, imgIdx) => (
                    <div
                      key={`${pad._id}-img-${imgIdx}`}
                      className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(img);
                      }}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {imgIdx === 2 && pad.media.length > 3 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-white">
                          +{pad.media.length - 2}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              {pad.tags && pad.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <FaTag className="text-purple-400 w-3 h-3" />
                  <div className="flex flex-wrap gap-2">
                    {pad.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={`${pad._id}-tag-${tagIndex}`}
                        className="bg-purple-600/20 text-purple-200 px-2 py-1 rounded text-xs border border-purple-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                    {pad.tags.length > 3 && (
                      <span className="text-purple-400 text-xs">
                        +{pad.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center text-gray-500 text-sm">
                <FaClock className="w-3 h-3 mr-2" />
                {new Date(pad.updatedAt || pad.createdAt).toLocaleDateString(
                  'en-US',
                  {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  },
                )}
              </div>
            </div>

            {/* Actions: always visible on mobile, hover/focus on desktop */}
            <div
              className="flex items-center gap-2 ml-4 transition-opacity duration-200
                opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(pad);
                }}
                className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                title="Edit"
                aria-label={`Edit note: ${pad.title || 'Untitled'}`}
              >
                <FaEdit className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(pad._id);
                }}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                title="Delete"
                aria-label={`Delete note: ${pad.title || 'Untitled'}`}
              >
                <FaTrash className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DataPadList;
