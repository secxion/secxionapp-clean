import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaRocket, FaSearch } from 'react-icons/fa';

const EmptyState = ({
  hasDataPads,
  hasActiveFilters,
  onCreateNew,
  onClearFilters,
}) => {
  return (
    <AnimatePresence>
      {hasActiveFilters && !hasDataPads && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="flex flex-col items-center justify-center rounded-[32px] border border-white/8 bg-black/20 px-6 py-16 shadow-[0_18px_55px_rgba(0,0,0,0.25)] backdrop-blur-xl"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[26px] border border-white/8 bg-white/5 text-brand-gold shadow-inner">
            <FaSearch className="h-7 w-7" />
          </div>

          <h3 className="mb-2 text-lg font-black text-white font-spaceGrotesk uppercase tracking-[0.18em]">
            No matching notes found
          </h3>
          <p className="mb-6 max-w-md text-center text-sm leading-7 text-gray-400">
            No notes match your current search or filter criteria. Try adjusting
            your filters or search terms.
          </p>

          <button
            onClick={onClearFilters}
            className="rounded-2xl bg-brand-gold px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.24em] text-brand-dark-base transition-all hover:bg-brand-gold-dark"
          >
            Clear Filters
          </button>
        </motion.div>
      )}

      {hasActiveFilters && hasDataPads && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="flex flex-col items-center justify-center rounded-[32px] border border-white/8 bg-black/20 px-6 py-16 shadow-[0_18px_55px_rgba(0,0,0,0.25)] backdrop-blur-xl"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[26px] border border-white/8 bg-white/5 text-brand-gold shadow-inner">
            <FaSearch className="h-7 w-7" />
          </div>

          <h3 className="mb-2 text-lg font-black text-white font-spaceGrotesk uppercase tracking-[0.18em]">
            No results found
          </h3>
          <p className="mb-6 max-w-md text-center text-sm leading-7 text-gray-400">
            Your search didn't match any notes. Try different keywords or clear
            your filters.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClearFilters}
              className="rounded-2xl border border-white/8 bg-white/5 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10"
            >
              Clear Filters
            </button>
            <button
              onClick={onCreateNew}
              className="rounded-2xl bg-brand-gold px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-brand-dark-base transition-all hover:bg-brand-gold-dark"
            >
              Create New Note
            </button>
          </div>
        </motion.div>
      )}

      {/* No notes at all - first time user */}
      {!hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="flex flex-col items-center justify-center rounded-[36px] border border-white/8 bg-gradient-to-br from-white/[0.06] via-black/20 to-black/35 px-6 py-16 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] border border-brand-gold/20 bg-gradient-to-br from-brand-gold/95 to-yellow-600 shadow-2xl">
            <FaEdit className="h-10 w-10 text-brand-dark-base" />
          </div>

          <motion.h2
            className="mb-4 text-center text-2xl font-black text-white font-spaceGrotesk uppercase tracking-[0.18em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to DataPad
          </motion.h2>

          <motion.p
            className="mb-8 max-w-md text-center text-sm leading-7 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Store ideas, notes, and working drafts in a structured archive built
            for fast recall, calm editing, and clear review.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={onCreateNew}
              className="inline-flex items-center gap-3 rounded-2xl bg-brand-gold px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.24em] text-brand-dark-base shadow-brand-gold transition-all hover:bg-brand-gold-dark"
            >
              <FaPlus className="h-4 w-4" />
              Create Your First Note
            </motion.button>

            <motion.div
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <FaRocket className="h-3.5 w-3.5" />
              <span>Get started in seconds</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmptyState;
