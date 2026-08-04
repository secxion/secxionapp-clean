import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaPlus, FaCode, FaTimes } from 'react-icons/fa';
import { MdRefresh, MdClose } from 'react-icons/md';

import UploadData from '../Components/UploadData';
import DataPadList from '../Components/DataPadList';
import LiveScript from '../Components/LiveScript';

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
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveScriptOpen, setIsLiveScriptOpen] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
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
      className="min-h-screen premium-bg flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="bg-brand-dark-base/80 backdrop-blur-xl shadow-2xl border-b border-white/5 mt-20 lg:mt-28 md:mt-28 sticky top-16 lg:top-20 z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <motion.h1
                className="text-2xl sm:text-3xl font-black neon-gold-text font-spaceGrotesk uppercase tracking-tighter"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                DataPad
              </motion.h1>
              <motion.div
                className="hidden sm:flex items-center gap-2 bg-brand-gold/10 px-4 py-1 rounded-full border border-brand-gold/20 backdrop-blur-sm shadow-brand-gold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="w-1.5 h-1.5 bg-brand-gold rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold font-spaceGrotesk">
                  {dataPads.length} Items
                </span>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-3 text-gray-500 hover:text-brand-gold transition-all duration-300 disabled:opacity-30 bg-white/5 rounded-xl border border-white/5 active:scale-95"
                title="Synchronize"
              >
                <MdRefresh
                  className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                />
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsLiveScriptOpen(true)}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-2xl font-black font-spaceGrotesk text-[10px] uppercase tracking-widest shadow-lg transition-all"
              >
                <FaCode className="w-4 h-4" />
                <span>LiveScript</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenEditor()}
                className="bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base px-6 py-3 rounded-2xl font-black font-spaceGrotesk text-[10px] uppercase tracking-widest shadow-brand-gold transition-all flex items-center space-x-2"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>New Record</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      {dataPads.length > 0 && (
        <div className="sticky top-[144px] lg:top-[160px] z-20 bg-brand-dark-base/90 backdrop-blur-md border-b border-white/5 shadow-xl transition-all duration-300">
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
                onCreateNew={() => handleOpenEditor()}
                hasDataPads={false}
                hasActiveFilters={false}
                key="empty"
              />
            ) : filteredAndSortedDataPads.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-20 glass-card rounded-3xl border-white/5"
              >
                <div className="text-6xl mb-6 opacity-20 filter grayscale">
                  🔍
                </div>
                <h3 className="text-xl font-black text-white font-spaceGrotesk uppercase tracking-widest mb-2">
                  No records found
                </h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                  Adjust parameters or clear filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTags([]);
                  }}
                  className="text-brand-gold hover:text-white font-black font-spaceGrotesk text-[10px] uppercase tracking-[0.4em] transition-all"
                >
                  [ Clear Filters ]
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
                  onImageClick={(url) => setSelectedPreviewImage(url)}
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
          className="fixed bottom-24 right-6 bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base p-5 rounded-2xl shadow-brand-gold lg:hidden transition-all duration-300 z-40 active:scale-90"
          aria-label="Create new note"
          title="Create new note"
        >
          <FaPlus className="w-6 h-6" aria-hidden="true" />
        </motion.button>
      )}

      {/* LiveScript Modal */}
      <LiveScript
        isOpen={isLiveScriptOpen}
        onClose={() => setIsLiveScriptOpen(false)}
      />

      {/* Full Image Preview Modal */}
      <AnimatePresence>
        {selectedPreviewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 touch-manipulation"
            onClick={() => setSelectedPreviewImage(null)}
          >
            <button
              className="absolute top-14 right-6 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 z-10 touch-manipulation backdrop-blur-md"
              onClick={() => setSelectedPreviewImage(null)}
            >
              <MdClose className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={selectedPreviewImage}
              alt="Full Preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DataPad;
