import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UploadProduct from "../Components/UploadProduct";
import SummaryApi from "../common";
import AdminProductCard from "../Components/AdminProductCard";
import { FaPlus, FaBoxOpen, FaExclamationTriangle } from "react-icons/fa";

const fetchAllProducts = async () => {
  try {
    const response = await fetch(SummaryApi.allProduct.url, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }

    const dataResponse = await response.json();
    return dataResponse?.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

const AllProducts = () => {
  const [openUploadProduct, setOpenUploadProduct] = useState(false);

  const { data: allProduct = [], isLoading, error, refetch } = useQuery({
    queryKey: ["allProducts"],
    queryFn: fetchAllProducts,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  return (
    <div className="container mx-auto mt-10 fixed h-screen w-screen pr-8">
      <header className="bg-white py-2 px-4 flex justify-between items-center shadow-md rounded">
      <h2 className="font-semibold text-xl text-gray-800 flex items-center">
                    <FaBoxOpen className="mr-2 text-gray-600" /> Products
                </h2>
                <button
                    className="inline-flex items-center px-4 py-2 border border-purple-500 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-150"
                    onClick={() => setOpenUploadProduct(true)}
                    aria-label="Upload Product"
                >
                    <FaPlus className="mr-2" /> Upload Product
                </button>
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8 h-[calc(100vh-190px)] overflow-y-auto">
                {isLoading ? (
                    <p className="text-center w-full text-gray-500 italic">Loading products...</p>
                ) : error ? (
                    <p className="text-center w-full text-red-500 flex items-center justify-center">
                        <FaExclamationTriangle className="mr-2" /> Error fetching products.
                    </p>
                ) : allProduct.length > 0 ? (
                    allProduct.map((product, index) => (
                        <AdminProductCard data={product} key={index} fetchdata={refetch} />
                    ))
                ) : (
                    <p className="text-center w-full text-gray-500 italic">No Products Available.</p>
                )}
            </main>

            {openUploadProduct && (
                <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center">
                    <UploadProduct onClose={() => setOpenUploadProduct(false)} fetchData={refetch} />
                </div>
            )}
        </div>
  );
};

export default AllProducts;