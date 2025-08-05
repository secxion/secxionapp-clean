import Shimmer from "./Components/Shimmer";

const Loader = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-xl">
        {/* Background Skewed Layer */}
        <div className="absolute inset-0 transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 rounded-3xl border-4 border-yellow-700 bg-gradient-to-r from-emerald-400 to-blue-500 shadow-xl"></div>

        {/* Foreground Content */}
        <div className="relative bg-white dark:bg-gray-800 border-4 border-yellow-700 rounded-3xl shadow-xl px-6 py-10 sm:p-14">
          <div className="animate-pulse">
            <Shimmer type="heading" />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6">
              <Shimmer type="paragraph" />
              <Shimmer type="paragraph" />
              <Shimmer type="paragraph" />
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Shimmer type="button" />
              <Shimmer type="button" />
              <Shimmer type="button" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
