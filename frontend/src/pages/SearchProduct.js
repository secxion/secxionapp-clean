import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SummaryApi from '../common';
import VerticalCard from '../Components/VerticalCard';

const SearchProduct = () => {
    const query = useLocation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProduct = async () => {
        setLoading(true);
        setError(null); 
        try {
            const response = await fetch(SummaryApi.searchProduct.url + query.search);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const dataResponse = await response.json();
            setData(dataResponse.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (query.search) {
            fetchProduct();
        }
    }, [query]);

    return (
        <div className='container mx-auto p-4 mt-16'>
            {loading && (
                <p className='text-lg text-center mt-24'>Looking...</p>
            )}

            {error && (
                <p className='bg-red-100 text-red-600 text-lg text-center p-4 rounded'>
                    {error}
                </p>
            )}

            <p className='text-lg font-semibold my-3 mt-24'>Search Results: {data.length}</p>

            {data.length === 0 && !loading && !error && (
                <p className='bg-white text-lg text-center p-4 rounded shadow'>
                    No Data Found...
                </p>
            )}

            {data.length > 0 && !loading && (
                <VerticalCard loading={loading} data={data} />
            )}
        </div>
    );
};

export default SearchProduct;