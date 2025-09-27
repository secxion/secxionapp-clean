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
          className="flex flex-col items-center justify-center py-16 px-4"
        >
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <FaSearch className="w-8 h-8 text-gray-400" />
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">
            No matching notes found
          </h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            No notes match your current search or filter criteria. Try adjusting
            your filters or search terms.
          </p>

          <button
            onClick={onClearFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
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
          className="flex flex-col items-center justify-center py-16 px-4"
        >
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <FaSearch className="w-8 h-8 text-gray-400" />
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">
            No results found
          </h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Your search didn't match any notes. Try different keywords or clear
            your filters.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Clear Filters
            </button>
            <button
              onClick={onCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
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
          className="flex flex-col items-center justify-center py-16 px-4"
        >
          <div className="relative mb-8">
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400/20 rounded-full"
            />
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute -bottom-4 -right-4 w-6 h-6 bg-purple-400/20 rounded-full"
            />

            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-2xl">
              <FaEdit className="w-12 h-12 text-white" />
            </div>
          </div>

          <motion.h2
            className="text-3xl font-bold text-white mb-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to DataPad
          </motion.h2>

          <motion.p
            className="text-gray-400 text-center max-w-md mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your personal knowledge vault. Store ideas, notes, and insights in a
            secure, organized space. Start building your digital brain today.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={onCreateNew}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center gap-3"
            >
              <FaPlus className="w-5 h-5" />
              Create Your First Note
            </motion.button>

            <motion.div
              className="flex items-center gap-2 text-gray-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <FaRocket className="w-4 h-4" />
              <span>Get started in seconds</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmptyState;
