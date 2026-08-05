import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaTimes, FaTag, FaSortAmountDown } from 'react-icons/fa';

const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  selectedTags,
  onTagsChange,
  availableTags,
  resultCount,
  totalCount,
}) => {
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
    <div className="space-y-3 px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search notes by title or content..."
            className="w-full rounded-2xl border border-white/8 bg-black/20 py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10"
          />
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-3.5 py-2.5 text-[9px] font-black uppercase tracking-[0.24em] text-gray-300">
          <FaSortAmountDown className="h-4 w-4 text-brand-gold" />
          <select
            value={sortBy || 'newest'}
            onChange={(e) => onSortByChange && onSortByChange(e.target.value)}
            className="bg-transparent text-white outline-none"
          >
            <option value="newest">Newest</option>
            <option value="updated">Recently Updated</option>
            <option value="oldest">Oldest</option>
            <option value="title_az">Title A-Z</option>
            <option value="title_za">Title Z-A</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
          {resultCount !== undefined && totalCount !== undefined && (
            <>
              Showing {resultCount} of {totalCount} notes
              {(searchQuery || (selectedTags && selectedTags.length > 0)) && (
                <button
                  onClick={clearFilters}
                  className="ml-2 text-brand-gold transition-colors hover:text-white"
                >
                  Clear filters
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {availableTags && availableTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-white/8 bg-black/20 p-4 backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center gap-2">
            <FaTag className="h-4 w-4 text-brand-gold" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/80">
              Filter by tags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 ${
                  tempTags.includes(tag)
                    ? 'border-brand-gold bg-brand-gold text-brand-dark-base'
                    : 'border-white/8 bg-white/5 text-gray-300 hover:border-brand-gold/40 hover:text-white'
                }`}
              >
                {tag}
                {tempTags.includes(tag) && (
                  <FaTimes className="ml-1 inline h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchAndFilter;
