import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NoteCard from "./NoteCard";

const DataPadList = ({ dataPads, onOpen, onDelete, isLoading }) => {
  const handleEdit = useCallback((dataPad) => {
    onOpen(dataPad);
  }, [onOpen]);

  const handleView = useCallback((dataPad) => {
    onOpen(dataPad);
  }, [onOpen]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md border border-gray-300 dark:border-gray-700 p-5 animate-pulse"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <AnimatePresence mode="popLayout">
        {dataPads.map((dataPad) => (
          <NoteCard
            key={dataPad._id}
            dataPad={dataPad}
            onEdit={handleEdit}
            onDelete={onDelete}
            onView={handleView}
          />
        ))}
      </AnimatePresence>

      {dataPads.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-500 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-200 mb-2">
            No notes found
          </h3>
          <p className="text-gray-400">
            Create your first note to get started
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default DataPadList;