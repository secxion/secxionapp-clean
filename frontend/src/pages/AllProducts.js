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
  <main className="container mx-auto mt-10 fixed h-screen w-screen pr-8" role="main" aria-label="All Products Main Content">
  <header className="bg-white py-2 px-4 flex justify-between items-center shadow-md rounded" aria-label="Products Header">
      <h2 className="font-semibold text-xl text-gray-800 flex items-center">
                    <FaBoxOpen className="mr-2 text-gray-600" /> Products
                </h2>
        <button
          className="inline-flex items-center px-4 py-2 border border-purple-500 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-150"
          onClick={() => setOpenUploadProduct(true)}
          aria-label="Upload Product"
        >
          <FaPlus className="mr-2" aria-hidden="true" /> Upload Product
        </button>
      </header>

    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8 h-[calc(100vh-190px)] overflow-y-auto" aria-label="Products List">
        {isLoading ? (
          <p
            className="text-center w-full text-gray-500 italic"
            aria-live="polite"
            role="status"
            tabIndex={0}
          >
            Loading products...
          </p>
        ) : error ? (
          <p
            className="text-center w-full text-red-500 flex items-center justify-center"
            aria-live="assertive"
            role="alert"
            tabIndex={0}
          >
            <FaExclamationTriangle className="mr-2" aria-hidden="true" /> Error fetching products.
          </p>
        ) : allProduct.length > 0 ? (
          allProduct.map((product, index) => (
            <AdminProductCard data={product} key={index} fetchdata={refetch} tabIndex={0} aria-label={`Product card for ${product?.name || 'product'}`} />
          ))
        ) : (
          <p
            className="text-center w-full text-gray-500 italic"
            aria-live="polite"
            role="status"
            tabIndex={0}
          >
            No Products Available.
          </p>
        )}
      </section>

      {openUploadProduct && (
        <div
          className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center"
          aria-modal="true"
          role="dialog"
          aria-label="Upload Product Modal"
          tabIndex={-1}
        >
          <UploadProduct onClose={() => setOpenUploadProduct(false)} fetchData={refetch} />
        </div>
      )}
    </main>
  );
};

export default AllProducts;