import { motion } from "framer-motion";
import { 
  FaSearch, 
  FaTimes, 
  
} from "react-icons/fa";

const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  selectedTags,
 
  onClearFilters
}) => {


  const hasActiveFilters = searchQuery || selectedTags.length > 0;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center p-6 space-y-4 lg:space-y-0 lg:space-x-4">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3">

        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onClearFilters}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Clear filters
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;