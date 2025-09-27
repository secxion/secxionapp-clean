import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SummaryApi from '../common';
import SecxionShimmer from './SecxionShimmer';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch(SummaryApi.getCategories.url, {
          method: SummaryApi.getCategories.method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          console.error('Failed to fetch categories:', data.message);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <SecxionShimmer type="grid" count={8} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {categories.map((category) => (
        <Link
          key={category._id}
          to={`/category/${category.slug}`}
          className="block p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white">{category.name}</h3>
          <p className="mt-1 text-sm text-gray-400">{category.description}</p>
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;
