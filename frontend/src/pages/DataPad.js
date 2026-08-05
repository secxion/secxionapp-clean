import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaPlus, FaCode, FaTags } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

import UploadData from '../Components/UploadData';
import DataPadList from '../Components/DataPadList';
import LiveScript from '../Components/LiveScript';

import EmptyState from '../Components/EmptyState';
import SearchAndFilter from '../Components/SearchAndFilter';
import SecxionSpinner from '../Components/SecxionSpinner';
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

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousBodyBackground = document.body.style.backgroundColor;
    const previousHtmlOverscroll =
      document.documentElement.style.overscrollBehavior;
    const previousHtmlBackground =
      document.documentElement.style.backgroundColor;

    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.backgroundColor = '#0b1019';
    document.documentElement.style.overscrollBehavior = 'none';
    document.documentElement.style.backgroundColor = '#0b1019';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.body.style.backgroundColor = previousBodyBackground;
      document.documentElement.style.overscrollBehavior =
        previousHtmlOverscroll;
      document.documentElement.style.backgroundColor = previousHtmlBackground;
    };
  }, []);

  useEffect(() => {
    const shouldLockScroll =
      isUploadOpen || isLiveScriptOpen || Boolean(selectedPreviewImage);

    if (!shouldLockScroll) return undefined;

    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const previousOverscrollBehavior =
      document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.documentElement.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      document.documentElement.style.overscrollBehavior =
        previousOverscrollBehavior;
      window.scrollTo(0, scrollY);
    };
  }, [isUploadOpen, isLiveScriptOpen, selectedPreviewImage]);

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

  if (!user) {
    return <SecxionLoader size="large" message="Authenticating..." />;
  }

  return (
    <motion.div
      className="relative flex h-[100dvh] flex-col overflow-y-auto overscroll-none bg-brand-dark-base"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header + Search Stack */}
      <div className="sticky z-30 mt-24 md:mt-28 lg:mt-28 border-b border-white/8 bg-brand-dark-base/85 shadow-2xl backdrop-blur-2xl transition-all duration-300 lg:top-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-5">
          <div className="flex flex-col gap-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsLiveScriptOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.24em] text-violet-200 transition-all duration-300 hover:bg-violet-500/20"
                  >
                    <FaCode className="h-4 w-4" />
                    LiveScript
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenEditor()}
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand-gold px-4 py-2 text-[9px] font-black uppercase tracking-[0.24em] text-brand-dark-base shadow-brand-gold transition-all hover:bg-brand-gold-dark"
                  >
                    <FaPlus className="h-3.5 w-3.5" />
                    New Record
                  </motion.button>
                </div>
              </div>
            </div>

            {dataPads.length > 0 && (
              <div className="border-t border-white/8 pt-6 md:pt-10 lg:pt-10 mt-2">
                <SearchAndFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  sortBy={sortBy}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  availableTags={availableTags}
                  onSortByChange={setSortBy}
                  resultCount={filteredAndSortedDataPads.length}
                  totalCount={dataPads.length}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-2 -mb-24">
          <AnimatePresence mode="wait">
            {isLoading && dataPads.length === 0 ? (
              <div
                key="loading"
                className="flex min-h-[55vh] items-center justify-center"
              >
                <SecxionSpinner size="large" message="Loading your data..." />
              </div>
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
                className="flex flex-col items-center justify-center py-20 rounded-[32px] border border-white/8 bg-black/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/8 bg-white/5 text-3xl shadow-inner">
                  <FaTags className="h-8 w-8 text-brand-gold/80" />
                </div>
                <h3 className="mb-2 text-xl font-black text-white font-spaceGrotesk uppercase tracking-widest">
                  No records found
                </h3>
                <p className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                  Adjust parameters or clear filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTags([]);
                  }}
                  className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold transition-all hover:bg-brand-gold/20 hover:text-white"
                >
                  Clear Filters
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 overscroll-none touch-manipulation"
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
