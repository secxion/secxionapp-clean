import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTrash,
  FaEdit,
  FaImage,
  FaCalendarAlt,
  FaEllipsisV,
  FaTh,
  FaList,
} from 'react-icons/fa';
import SearchAndFilter from './SearchAndFilter';
import EmptyState from './EmptyState';
import SecxionShimmer from './SecxionShimmer';

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

const GridCard = ({ dataPad, onEdit, onDelete, onView }) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(
    async (e) => {
      e.stopPropagation();
      setIsDeleting(true);

      try {
        await onDelete(dataPad._id);
      } catch (error) {
        console.error('Error deleting note:', error);
      } finally {
        setIsDeleting(false);
      }
    },
    [dataPad._id, onDelete],
  );

  const handleEdit = useCallback(
    (e) => {
      e.stopPropagation();
      onEdit(dataPad);
    },
    [dataPad, onEdit],
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg border border-gray-700 dark:border-gray-700 transition-all duration-200 cursor-pointer group h-full flex flex-col"
      onClick={() => onView(dataPad)}
    >
      {/* Image Preview */}
      {dataPad.media && dataPad.media.length > 0 && (
        <div className="relative h-32 overflow-hidden rounded-t-lg">
          <img
            src={dataPad.media[0]}
            alt={
              dataPad.title ? `Preview for ${dataPad.title}` : 'Note preview'
            }
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {dataPad.media.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <FaImage className="w-3 h-3 mr-1" />
              {dataPad.media.length}
            </div>
          )}
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-white dark:text-white truncate group-hover:text-blue-400 dark:group-hover:text-blue-400 transition-colors duration-200">
            {dataPad.title || 'Untitled Note'}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 text-gray-400 hover:text-gray-300 dark:hover:text-gray-300 rounded-full hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Show actions"
              title="Show actions"
            >
              <FaEllipsisV className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-32 bg-gray-800 dark:bg-gray-800 rounded-lg shadow-lg border border-gray-700 dark:border-gray-700 py-2 z-10"
                  onMouseLeave={() => setShowActions(false)}
                >
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 flex items-center space-x-2"
                    aria-label={`Edit note: ${dataPad.title || 'Untitled'}`}
                    title="Edit"
                  >
                    <FaEdit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 dark:text-red-400 hover:bg-red-900/20 dark:hover:bg-red-900/20 flex items-center space-x-2 disabled:opacity-50"
                    aria-label={`Delete note: ${dataPad.title || 'Untitled'}`}
                    title="Delete"
                  >
                    <FaTrash className="w-3 h-3" />
                    <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Content */}
        {dataPad.content && (
          <p className="text-gray-400 dark:text-gray-400 text-sm mb-3 flex-1">
            {truncateText(dataPad.content)}
          </p>
        )}
        {/* Tags */}
        {dataPad.tags && dataPad.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {dataPad.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 dark:bg-blue-900 text-blue-200 dark:text-blue-200"
              >
                {tag}
              </span>
            ))}
            {dataPad.tags.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 dark:bg-gray-700 text-gray-400 dark:text-gray-400">
                +{dataPad.tags.length - 2}
              </span>
            )}
          </div>
        )}
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-400 mt-auto">
          <div className="flex items-center">
            <FaCalendarAlt className="w-3 h-3 mr-1" />
            <span>{formatDate(dataPad.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-2 ml-4 transition-opacity duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <button
              onClick={handleEdit}
              className="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              title="Edit"
              aria-label={`Edit note: ${dataPad.title || 'Untitled'}`}
            >
              <FaEdit className="w-3 h-3" aria-hidden="true" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
              title="Delete"
              aria-label={`Delete note: ${dataPad.title || 'Untitled'}`}
            >
              <FaTrash className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ListCard = ({ dataPad, onEdit, onDelete, onView }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(
    async (e) => {
      e.stopPropagation();
      setIsDeleting(true);

      try {
        await onDelete(dataPad._id);
      } catch (error) {
        console.error('Error deleting note:', error);
      } finally {
        setIsDeleting(false);
      }
    },
    [dataPad._id, onDelete],
  );

  const handleEdit = useCallback(
    (e) => {
      e.stopPropagation();
      onEdit(dataPad);
    },
    [dataPad, onEdit],
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md border border-gray-700 dark:border-gray-700 transition-all duration-200 cursor-pointer group p-4"
      onClick={() => onView(dataPad)}
    >
      <div className="flex items-start space-x-4">
        {/* Thumbnail */}
        {dataPad.media && dataPad.media.length > 0 && (
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
            <img
              src={dataPad.media[0]}
              alt={
                dataPad.title ? `Preview for ${dataPad.title}` : 'Note preview'
              }
              className="w-full h-full object-cover"
            />
            {dataPad.media.length > 1 && (
              <div className="absolute -mt-4 -mr-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded-full">
                +{dataPad.media.length - 1}
              </div>
            )}
          </div>
        )}
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white dark:text-white truncate group-hover:text-blue-400 dark:group-hover:text-blue-400 transition-colors duration-200">
                {dataPad.title || 'Untitled Note'}
              </h3>
              {dataPad.content && (
                <p className="text-gray-400 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                  {truncateText(dataPad.content, 150)}
                </p>
              )}
              {dataPad.tags && dataPad.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {dataPad.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 dark:bg-blue-900 text-blue-200 dark:text-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                  {dataPad.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 dark:bg-gray-700 text-gray-400 dark:text-gray-400">
                      +{dataPad.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center text-xs text-gray-400 dark:text-gray-400 mt-2">
                <FaCalendarAlt className="w-3 h-3 mr-1" />
                <span>{formatDate(dataPad.createdAt)}</span>
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4 transition-opacity duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
              <button
                onClick={handleEdit}
                className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                title="Edit"
                aria-label={`Edit note: ${dataPad.title || 'Untitled'}`}
              >
                <FaEdit className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                title="Delete"
                aria-label={`Delete note: ${dataPad.title || 'Untitled'}`}
              >
                <FaTrash className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DataPadGrid = ({
  dataPads = [],
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  // Extract all unique tags from dataPads
  const allTags = useMemo(() => {
    const tags = new Set();
    dataPads.forEach((dataPad) => {
      if (dataPad.tags) {
        dataPad.tags.forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [dataPads]);

  // Filter dataPads (no sorting)
  const filteredDataPads = useMemo(() => {
    return dataPads.filter((dataPad) => {
      const matchesSearch =
        !searchQuery ||
        (dataPad.title &&
          dataPad.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (dataPad.content &&
          dataPad.content.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTags =
        selectedTags.length === 0 ||
        (dataPad.tags &&
          selectedTags.every((tag) => dataPad.tags.includes(tag)));

      return matchesSearch && matchesTags;
    });
  }, [dataPads, searchQuery, selectedTags]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
  }, []);

  if (isLoading) {
    return <SecxionShimmer type="grid" count={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1">
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            availableTags={allTags}
            resultCount={filteredDataPads.length}
            totalCount={dataPads.length}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-800 dark:bg-gray-800 rounded-lg p-1 ml-4">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors duration-200 ${
              viewMode === 'grid'
                ? 'bg-gray-700 dark:bg-gray-700 text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-gray-400 dark:text-gray-400 hover:text-gray-200 dark:hover:text-gray-200'
            }`}
          >
            <FaTh className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors duration-200 ${
              viewMode === 'list'
                ? 'bg-gray-700 dark:bg-gray-700 text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-gray-400 dark:text-gray-400 hover:text-gray-200 dark:hover:text-gray-200'
            }`}
          >
            <FaList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      {dataPads.length > 0 && (
        <div className="text-sm text-gray-400 dark:text-gray-400">
          Showing {filteredDataPads.length} of {dataPads.length} notes
        </div>
      )}

      {/* Grid/List Content */}
      {filteredDataPads.length === 0 ? (
        <EmptyState
          hasDataPads={dataPads.length > 0}
          hasActiveFilters={searchQuery || selectedTags.length > 0}
          onCreateNew={onCreateNew}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredDataPads.map((dataPad) => (
                  <GridCard
                    key={`grid-${dataPad._id}`}
                    dataPad={dataPad}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <AnimatePresence>
                {filteredDataPads.map((dataPad) => (
                  <ListCard
                    key={`list-${dataPad._id}`}
                    dataPad={dataPad}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default DataPadGrid;
