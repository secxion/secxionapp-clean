import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import UploadProduct from '../Components/UploadProduct';
import SummaryApi from '../common';
import AdminProductCard from '../Components/AdminProductCard';
import {
  FaPlus,
  FaBoxOpen,
  FaExclamationTriangle,
  FaSearch,
} from 'react-icons/fa';

const fetchAllProducts = async () => {
  try {
    const response = await fetch(SummaryApi.allProduct.url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        `Network error: ${response.status} ${response.statusText}`,
      );
    }

    const dataResponse = await response.json();
    return dataResponse?.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

const AllProducts = () => {
  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: allProduct = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['allProducts'],
    queryFn: fetchAllProducts,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const filteredProducts = allProduct.filter(
    (product) =>
      product?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-500/10 rounded-xl">
            <FaBoxOpen className="text-yellow-500 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Products</h2>
            <p className="text-slate-400 text-sm">
              {allProduct.length} total products
            </p>
          </div>
        </div>
        <button
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 rounded-xl text-sm font-semibold shadow-lg shadow-yellow-500/20 transition-all duration-200"
          onClick={() => setOpenUploadProduct(true)}
        >
          <FaPlus className="mr-2" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-colors"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading ? (
          // Loading skeleton
          [...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-xl p-4 animate-pulse"
            >
              <div className="aspect-square bg-slate-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-red-400">
            <FaExclamationTriangle className="text-4xl mb-3" />
            <p>Error fetching products</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <AdminProductCard
              data={product}
              key={product._id || index}
              fetchdata={refetch}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
            <FaBoxOpen className="text-4xl mb-3" />
            <p>
              {searchTerm
                ? 'No products match your search'
                : 'No products available'}
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {openUploadProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
          <UploadProduct
            onClose={() => setOpenUploadProduct(false)}
            fetchData={refetch}
          />
        </div>
      )}
    </div>
  );
};

export default AllProducts;
