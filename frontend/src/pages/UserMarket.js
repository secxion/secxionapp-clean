import React, { useContext, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import SummaryApi from "../common";
import UserUploadMarket from "../Components/UserUploadMarket";
import HistoryCard from "../Components/HistoryCard";
import HistoryDetailView from "../Components/HistoryDetailView";
import UserContext from "../Context";
import SecxionShimmer from "../Components/SecxionShimmer";
import { motion } from "framer-motion"; 

const UserMarket = () => {
  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [allProduct, setAllProduct] = useState([]);
  const { user } = useContext(UserContext);
  const { marketId } = useParams();
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);

  const fetchAllProduct = useCallback(async () => {
    if (!user || !user._id) {
      console.warn("User is not defined or userId is missing.");
      return;
    }

    try {
      const response = await fetch(`${SummaryApi.myMarket.url}?userId=${user._id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include",
      });

      const dataResponse = await response.json();
      console.log("all product data", dataResponse);
      setAllProduct(dataResponse?.data || []);
    } catch (error) {
      console.error("Failed to fetch all products:", error);
    }
  }, [user]);

  const fetchProductById = useCallback(async (id) => {
    if (!user || !user._id || !id) {
      console.warn("User or market ID is missing.");
      setAllProduct([]);
      return;
    }

    try {
      const response = await fetch(SummaryApi.myMarketById.url.replace(':marketId', id), {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include",
      });

      const dataResponse = await response.json();
      console.log("specific product data", dataResponse);
      setAllProduct(dataResponse?.data ? [dataResponse.data] : []);
      setSelectedProductForDetail(dataResponse?.data || null);
    } catch (error) {
      console.error(`Failed to fetch product with ID ${id}:`, error);
      setAllProduct([]);
      setSelectedProductForDetail(null);
    }
  }, [user]);

  useEffect(() => {
    if (marketId) {
      fetchProductById(marketId);
    } else if (user && user._id) {
      fetchAllProduct();
    }
  }, [fetchAllProduct, fetchProductById, marketId, user]);

  const handleOpenDetailView = (product) => {
    setSelectedProductForDetail(product);
  };

  const handleCloseDetailView = () => {
    setSelectedProductForDetail(null);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Fixed Status Header - positioned absolutely below main header */}
      <div className="fixed top-20 mt-1 md:mt-3 lg:mt-3 sm:mt-1 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 shadow-lg">
        <div className="py-2 px-6 flex justify-between items-center">
          <motion.h2
            className="font-extrabold text-2xl tracking-tight text-yellow-400"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Trade Status Dashboard
          </motion.h2>
          
          {/* Summary stats and controls */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              {allProduct.length} transaction{allProduct.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={() => {
                if (marketId) {
                  fetchProductById(marketId);
                } else {
                  fetchAllProduct();
                }
              }}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-gray-900 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - with top padding to account for fixed header */}
      <div className="pt-40 pb-6">
        <div className="flex items-center flex-wrap gap-6 py-4 px-6"> 
          {allProduct.map((product) => (
            <HistoryCard
              key={product._id}
              data={{
                ...product,
                crImage: product.crImage || product.cancelImage || product.image || null
              }}
              isDetailViewOpen={selectedProductForDetail?._id === product._id}
              onCloseDetailView={() => handleCloseDetailView()}
            />
          ))}
          
          {/* Empty State */}
          {allProduct.length === 0 && !marketId && (
            <div className="w-full flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-700/10 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                  <div className="relative px-4 py-10 bg-gray-900/80 shadow-lg sm:rounded-3xl sm:p-20">
                    <SecxionShimmer type="card" count={3} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Not Found State */}
          {allProduct.length === 0 && marketId && (
            <div className="w-full flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl text-gray-600 mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Transaction Not Found</h3>
                <p className="text-gray-400 mb-4">The requested market record could not be found.</p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-gray-900 rounded-lg font-medium transition-colors duration-200"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedProductForDetail && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
          <HistoryDetailView
            productDetails={{
              ...selectedProductForDetail,
              crImage: selectedProductForDetail.crImage || selectedProductForDetail.cancelImage || selectedProductForDetail.image || null
            }}
            onClose={handleCloseDetailView}
          />
        </div>
      )}

      {openUploadProduct && (
        <UserUploadMarket onClose={() => setOpenUploadProduct(false)} fetchData={fetchAllProduct} />
      )}
    </motion.div>
  );
};

export default UserMarket;