import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaTimes, FaTag } from 'react-icons/fa';

const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
  availableTags,
  resultCount,
  totalCount,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [tempTags, setTempTags] = useState(selectedTags || []);

  // Ensure tempTags stays in sync with selectedTags
  useEffect(() => {
    setTempTags(selectedTags || []);
  }, [selectedTags]);

  const toggleTag = (tag) => {
    const newTags = tempTags.includes(tag)
      ? tempTags.filter((t) => t !== tag)
      : [...tempTags, tag];
    setTempTags(newTags);
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  const clearFilters = () => {
    if (onSearchChange) onSearchChange('');
    setTempTags([]);
    if (onTagsChange) onTagsChange([]);
  };

  return (
    <div className="space-y-4 p-4">
      {/* Search Bar and Filter Button */}
      <div className="flex items-center mt-2 gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search notes by title or content..."
            className="w-full bg-gray-800 dark:bg-gray-800 border border-gray-600 dark:border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center pl-6 justify-between">
        <div className="text-gray-400 dark:text-gray-400 text-sm">
          {resultCount !== undefined && totalCount !== undefined && (
            <>
              Showing {resultCount} of {totalCount} notes
              {(searchQuery || (selectedTags && selectedTags.length > 0)) && (
                <button
                  onClick={clearFilters}
                  className="ml-2 text-blue-400 hover:text-blue-300 underline"
                >
                  Clear filters
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800/50 dark:bg-gray-800/50 border border-gray-700 dark:border-gray-700 rounded-lg p-4"
          >
            {/* Tags Filter */}
            {availableTags && availableTags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaTag className="text-blue-500 w-4 h-4" />
                  <span className="text-white dark:text-white font-medium">
                    Filter by Tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag} // Ensure unique keys
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm border transition-all duration-200 ${
                        tempTags.includes(tag)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-gray-700 dark:bg-gray-700 text-gray-300 dark:text-gray-300 border-gray-600 dark:border-gray-600 hover:border-blue-400 hover:text-blue-400'
                      }`}
                    >
                      {tag}
                      {tempTags.includes(tag) && (
                        <FaTimes className="inline ml-1 w-3 h-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchAndFilter;
