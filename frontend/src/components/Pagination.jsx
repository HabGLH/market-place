import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage && currentPage <= 1}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          !hasPrevPage && currentPage <= 1
            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm hover:shadow-md"
        }`}
      >
        Previous
      </button>

      <span className="text-gray-600 dark:text-gray-400 font-medium">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage && currentPage >= totalPages}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          !hasNextPage && currentPage >= totalPages
            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm hover:shadow-md"
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
