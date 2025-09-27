import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SecxionShimmer from './SecxionShimmer';

const BannerProduct = () => {
  const [loading, setLoading] = useState(true);
  const [bannerData, setBannerData] = useState(null);

  useEffect(() => {
    const fetchBannerData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        const response = await new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, data: mockData }), 1000),
        );

        if (response.success) {
          setBannerData(response.data);
        }
      } catch (error) {
        console.error('Error fetching banner data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBannerData();
  }, []);

  if (loading) {
    return <SecxionShimmer type="card" count={1} />;
  }

  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
      {bannerData && (
        <Link to={`/product/${bannerData._id}`} className="block w-full h-full">
          <img
            src={bannerData.image}
            alt={bannerData.title}
            className="object-cover w-full h-full rounded-lg"
          />
        </Link>
      )}
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4">
        {bannerData && (
          <Link to={`/product/${bannerData._id}`} className="text-center">
            <h3 className="text-lg font-semibold text-white mb-1">
              {bannerData.title}
            </h3>
            <p className="text-sm text-gray-200">{bannerData.description}</p>
          </Link>
        )}
      </div>
    </div>
  );
};

const mockData = {
  _id: '123',
  title: 'Sample Product',
  description: 'This is a sample product description.',
  image: 'https://via.placeholder.com/800x400.png?text=Product+Image',
};

export default BannerProduct;
