import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SummaryApi from '../common';
import VerticalCard from '../Components/VerticalCard';
import SecxionSpinner from '../Components/SecxionSpinner';

const Search = () => {
  const query = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log('query', query.search);

  const fetchProduct = async () => {
    setLoading(true);
    const response = await fetch(SummaryApi.searchProduct.url + query.search);
    const dataResponse = await response.json();
    setLoading(false);

    console.log('dataResponse', dataResponse);
    setData(dataResponse.data);
  };

  useEffect(() => {
    fetchProduct();
  }, [query]);

  return (
    <div className="container mx-auto p-4">
      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <SecxionSpinner size="large" message="Searching..." />
        </div>
      )}

      <p className="text-lg font-semibold my-3">
        Search Results : {data.length}
      </p>

      {data.length === 0 && !loading && (
        <p className="bg-white text-lg text-center p-4">No Data Found....</p>
      )}

      {data.length !== 0 && !loading && (
        <VerticalCard loading={loading} data={data} />
      )}
    </div>
  );
};

export default Search;
