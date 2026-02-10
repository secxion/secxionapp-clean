import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';

import UploadData from '../Components/UploadData';
import DataPadList from '../Components/DataPadList';

import EmptyState from '../Components/EmptyState';
import SearchAndFilter from '../Components/SearchAndFilter';
import SecxionLoader from '../Components/SecxionLoader';
import SummaryApi from '../common';

const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  TITLE_AZ: 'title_az',
  TITLE_ZA: 'title_za',
  UPDATED: 'updated',
};

const DataPad = () => {
  const { user } = useSelector((state) => state.user);

  const [editingDataPad, setEditingDataPad] = useState(null);
  const [dataPads, setDataPads] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null); // Removed unused error state

  // const [viewMode, setViewMode] = useState(VIEW_MODES.LIST); // Removed unused viewMode state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchDataPads = useCallback(
    async (showToast = false) => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(SummaryApi.allData.url, {
          method: SummaryApi.allData.method,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          const userDataPads = data.data.filter(
            (item) => item.userId === user?.id || item.userId === user?._id,
          );
          setDataPads(userDataPads);

          if (showToast && userDataPads.length > 0) {
            toast.success(`Loaded ${userDataPads.length} Data`, {
              position: 'top-right',
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        } else {
          throw new Error(data.message || 'Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data. Please try again.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    fetchDataPads();
  }, [fetchDataPads]);

  const filteredAndSortedDataPads = useMemo(() => {
    let filtered = dataPads;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (pad) =>
          pad.title?.toLowerCase().includes(query) ||
          pad.content?.toLowerCase().includes(query),
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((pad) =>
        pad.tags?.some((tag) => selectedTags.includes(tag)),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.NEWEST:
          return new Date(b.createdAt) - new Date(a.createdAt);
        case SORT_OPTIONS.OLDEST:
          return new Date(a.createdAt) - new Date(b.createdAt);
        case SORT_OPTIONS.UPDATED:
          return (
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
          );
        case SORT_OPTIONS.TITLE_AZ:
          return (a.title || '').localeCompare(b.title || '');
        case SORT_OPTIONS.TITLE_ZA:
          return (b.title || '').localeCompare(a.title || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [dataPads, searchQuery, selectedTags, sortBy]);

  const availableTags = useMemo(() => {
    const tagSet = new Set();
    dataPads.forEach((pad) => {
      pad.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [dataPads]);

  // Handlers
  const handleOpenEditor = useCallback((dataPad = null) => {
    setEditingDataPad(dataPad);
    setIsUploadOpen(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setIsUploadOpen(false);
    setEditingDataPad(null);
    setTimeout(() => {
      fetchDataPads();
    }, 100);
  }, [fetchDataPads]);

  const handleDeleteDataPad = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this data?')) return;

    try {
      const response = await fetch(`${SummaryApi.deleteData.url}/${id}`, {
        method: SummaryApi.deleteData.method,
        credentials: 'include',
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success('Data deleted successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setDataPads((prev) => prev.filter((item) => item._id !== id));
      } else {
        throw new Error(responseData.message || 'Failed to delete data');
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('Failed to delete data. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDataPads(true);
  }, [fetchDataPads]);

  if (!user) {
    return <SecxionLoader size="large" message="Authenticating..." />;
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 shadow-xl border-b border-purple-700/50 mt-20 lg:mt-24 md:mt-24 sm:mt-20 sticky top-16 lg:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.h1
                className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                DataPad
              </motion.h1>
              <motion.span
                className="bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium border border-yellow-400/30 backdrop-blur-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {dataPads.length}
              </motion.span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-200 disabled:opacity-50 bg-gray-800/50 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                title="Refresh"
                aria-label="Refresh notes"
              >
                <MdRefresh
                  className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                />
              </button>
              <motion.button
                onClick={() => handleOpenEditor()}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 px-4 py-2 rounded-lg font-semibold shadow-lg transition-colors duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Create new note"
                title="Create new note"
              >
                <FaPlus className="w-4 h-4" />
                <span className="hidden sm:inline">New Note</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      {dataPads.length > 0 && (
        <div className="sticky top-32 lg:top-36 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 shadow-sm">
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            availableTags={availableTags}
            showFilters={showFilters}
            onSortByChange={setSortBy}
            setShowFilters={setShowFilters}
            resultCount={filteredAndSortedDataPads.length}
            totalCount={dataPads.length}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            {isLoading && dataPads.length === 0 ? (
              <SecxionLoader
                key="loading"
                size="large"
                message="Loading your data..."
              />
            ) : dataPads.length === 0 ? (
              <EmptyState
                onCreateFirst={() => handleOpenEditor()}
                key="empty"
              />
            ) : filteredAndSortedDataPads.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-purple-600/30"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No notes found
                </h3>
                <p className="text-gray-400 text-center max-w-md mb-4">
                  Try adjusting your search terms or filters to find what you're
                  looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTags([]);
                  }}
                  className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-200"
                >
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pb-20"
              >
                {/* Always use DataPadList (list view) for now, or switch to DataPadGrid if you want grid view. */}
                <DataPadList
                  dataPads={filteredAndSortedDataPads}
                  onOpen={handleOpenEditor}
                  onDelete={handleDeleteDataPad}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <UploadData
            editingDataPad={editingDataPad}
            closeUpload={handleCloseEditor}
            refreshData={fetchDataPads}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {dataPads.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => handleOpenEditor()}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 p-4 rounded-full shadow-xl lg:hidden transition-colors duration-200 z-40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-label="Create new note"
          title="Create new note"
        >
          <FaPlus className="w-6 h-6" aria-hidden="true" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default DataPad;
