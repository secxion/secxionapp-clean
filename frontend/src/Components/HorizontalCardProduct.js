import React, { useEffect, useState } from "react";
import SummaryApi from "../common";
import { Link } from "react-router-dom";
import SecxionShimmer from './SecxionShimmer'

const HorizontalCardProduct = ({ heading }) => {
  const [categoryProduct, setCategoryProduct] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Default true for better UX
  const [error, setError] = useState(null);

  const fetchCategoryProduct = async () => {
    setLoading(true);
    setError(null); // ✅ Reset error before fetching

    try {
      const response = await fetch(SummaryApi.categoryProduct.url, {
        headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const dataResponse = await response.json();
      setCategoryProduct(dataResponse.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryProduct();
  }, []);

  if (loading) {
    return (
      <div className='container mx-auto px-4 my-6 relative'>
        <h2 className='text-2xl font-semibold py-4'>{heading}</h2>
        <SecxionShimmer type="list" count={4} />
      </div>
    )
  }

  return (
    <div className="grid container mx-auto p-4">
      <h2 className="text-2xl font-semibold py-4">{heading}</h2>

      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="flex items-center gap-2 justify-between overflow-scroll scrollbar-none">
          {categoryProduct.map((product, index) => (
            <Link
              to={`product/${product?._id}`}
              className="p-2 cursor-pointer"
              key={product?._id || index}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden p-4 bg-slate-100 flex items-center justify-center">
                <img
                  src={product?.productImage?.[0]}
                  alt={product?.category}
                  className="h-full object-scale-down mix-blend-multiply hover:scale-150 transition-all"
                />
              </div>
              <p className="text-center font-bold text-sm md:text-base capitalize">
                {product?.category}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HorizontalCardProduct;
