import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTrash, 
  FaEdit, 
  FaImage, 
  FaCalendarAlt,
  FaEllipsisV,
  FaAnchor,
  FaList,
} from "react-icons/fa";
import SearchAndFilter from "./SearchAndFilter";
import EmptyState from "./EmptyState";

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

const GridCard = ({ dataPad, onEdit, onDelete, onView }) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    
    try {
      await onDelete(dataPad._id);
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [dataPad._id, onDelete]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    onEdit(dataPad);
  }, [dataPad, onEdit]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-lg border border-gray-200 transition-all duration-200 cursor-pointer group h-full flex flex-col"
      onClick={() => onView(dataPad)}
    >
      {/* Image Preview */}
      {dataPad.media && dataPad.media.length > 0 && (
        <div className="relative h-32 overflow-hidden rounded-t-lg">
          <img
            src={dataPad.media[0]}
            alt="Note preview"
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {dataPad.title || "Untitled Note"}
          </h3>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 opacity-0 group-hover:opacity-100"
            >
              <FaEllipsisV className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10"
                  onMouseLeave={() => setShowActions(false)}
                >
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <FaEdit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 disabled:opacity-50"
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
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 flex-1">
            {truncateText(dataPad.content)}
          </p>
        )}

        {/* Tags */}
        {dataPad.tags && dataPad.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {dataPad.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {tag}
              </span>
            ))}
            {dataPad.tags.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                +{dataPad.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
          <div className="flex items-center">
            <FaCalendarAlt className="w-3 h-3 mr-1" />
            <span>{formatDate(dataPad.createdAt)}</span>
          </div>
          
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors duration-200"
            >
              <FaEdit className="w-3 h-3" />
            </button>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors duration-200 disabled:opacity-50"
            >
              <FaTrash className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ListCard = ({ dataPad, onEdit, onDelete, onView }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    
    try {
      await onDelete(dataPad._id);
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [dataPad._id, onDelete]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    onEdit(dataPad);
  }, [dataPad, onEdit]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer group p-4"
      onClick={() => onView(dataPad)}
    >
      <div className="flex items-start space-x-4">
        {/* Thumbnail */}
        {dataPad.media && dataPad.media.length > 0 && (
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
            <img
              src={dataPad.media[0]}
              alt="Note preview"
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {dataPad.title || "Untitled Note"}
              </h3>
              
              {dataPad.content && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                  {truncateText(dataPad.content, 150)}
                </p>
              )}

              {dataPad.tags && dataPad.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {dataPad.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                  {dataPad.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      +{dataPad.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                <FaCalendarAlt className="w-3 h-3 mr-1" />
                <span>{formatDate(dataPad.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4">
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <FaEdit className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
              >
                <FaTrash className="w-4 h-4" />
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
  onCreateNew 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  // Extract all unique tags from dataPads
  const allTags = useMemo(() => {
    const tags = new Set();
    dataPads.forEach(dataPad => {
      if (dataPad.tags) {
        dataPad.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [dataPads]);

  // Filter and sort dataPads
  const filteredAndSortedDataPads = useMemo(() => {
    let filtered = dataPads.filter(dataPad => {
      // Search filter
      const matchesSearch = !searchQuery || 
        (dataPad.title && dataPad.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (dataPad.content && dataPad.content.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Tag filter
      const matchesTags = selectedTags.length === 0 || 
        (dataPad.tags && selectedTags.every(tag => dataPad.tags.includes(tag)));
      
      return matchesSearch && matchesTags;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "title":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "updatedAt":
          aValue = new Date(a.updatedAt || a.createdAt);
          bValue = new Date(b.updatedAt || b.createdAt);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [dataPads, searchQuery, selectedTags, sortBy, sortOrder]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTags([]);
    setSortBy("createdAt");
    setSortOrder("desc");
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          availableTags={allTags}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onClearFilters={handleClearFilters}
        />

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors duration-200 ${
              viewMode === "grid"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <FaAnchor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors duration-200 ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <FaList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      {dataPads.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredAndSortedDataPads.length} of {dataPads.length} notes
        </div>
      )}

      {/* Grid/List Content */}
      {filteredAndSortedDataPads.length === 0 ? (
        <EmptyState 
          hasDataPads={dataPads.length > 0}
          hasActiveFilters={searchQuery || selectedTags.length > 0}
          onCreateNew={onCreateNew}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredAndSortedDataPads.map((dataPad) => (
                  <GridCard
                    key={dataPad._id}
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
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <AnimatePresence>
                {filteredAndSortedDataPads.map((dataPad) => (
                  <ListCard
                    key={dataPad._id}
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