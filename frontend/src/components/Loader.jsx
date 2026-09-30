const Loader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto"></div>
        </div>

        {/* Loading Text */}
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loader;
