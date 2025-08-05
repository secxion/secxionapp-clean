import React, { useEffect, useState } from 'react';
import SummaryApi from '../common';
import ProductCard from './ProductCard';

const MarketList = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Adjust as needed
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SummaryApi.getMarket.url}?page=${page}&limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const responseData = await response.json();
      if (responseData.success) {
        setProducts(responseData.data);
        setTotalPages(responseData.totalPages);
      } else {
        console.error(responseData.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-6">
      <h2 className="text-2xl font-bold mb-4">Marketplace</h2>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p>No products available.</p>
          )}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-6">
        <button
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MarketList;
