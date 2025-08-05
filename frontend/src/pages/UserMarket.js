import React, { useContext, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import SummaryApi from "../common";
import UserUploadMarket from "../Components/UserUploadMarket";
import HistoryCard from "../Components/HistoryCard";
import HistoryDetailView from "../Components/HistoryDetailView";
import UserContext from "../Context";
import Shimmer from "../Components/Shimmer";
import { motion } from "framer-motion"; 
import SXNSignature from "./signature"; 

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
      className="mt-28 min-h-screen bg-white text-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="py-1 px-2 flex justify-between items-center bg-deep-golden-yellow-500 text-black shadow-md rounded-md">
        <motion.h2
          className="font-extrabold text-2xl tracking-tight"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Status
        </motion.h2>
       
      </div>

      <div className="flex items-center flex-wrap gap-4 py-4 px-6 overflow-y-auto">
        {allProduct.map((product) => (
          <HistoryCard
            key={product._id}
            data={product}
            isDetailViewOpen={selectedProductForDetail?._id === product._id}
            onCloseDetailView={() => handleCloseDetailView()}
          />
        ))}
        {allProduct.length === 0 && !marketId && (
          <div className="text-gray-600 text-center w-full">
            <div className="min-h-screen py-6 flex flex-col justify-center sm:py-12">
              <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-deep-golden-yellow-400 to-deep-golden-yellow-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                  <Shimmer type="heading" />
                  <div className="mt-6 grid grid-cols-1 gap-6">
                    <Shimmer type="paragraph" />
                    <Shimmer type="paragraph" />
                    <Shimmer type="paragraph" />
                    <Shimmer type="button" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {allProduct.length === 0 && marketId && (
          <p className="text-gray-600 text-center w-full">Market record not found.</p>
        )}
      </div>

      {selectedProductForDetail && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <HistoryDetailView
            productDetails={{
              ...selectedProductForDetail,
              crImage: selectedProductForDetail.crImage || null
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