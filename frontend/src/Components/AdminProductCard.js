import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdModeEditOutline } from "react-icons/md";
import AdminEditProduct from './AdminEditProduct';

const AdminProductCard = ({ data, fetchdata }) => {
    const { productImage, productName } = data;
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className='container bg-white p-4 rounded shadow-md'>
            <div className='w-40'>
                <div className='w-32 h-32 flex justify-center items-center'>
                    <img 
                        src={productImage[0]} 
                        alt={productName} 
                        className='mx-auto object-cover h-full' 
                    />
                </div>
                <h1 className='text-ellipsis line-clamp-2 font-semibold'>{productName}</h1>

                <div className='flex justify-end'>
                    <button
                        className='w-fit p-3 bg-green-100 hover:bg-green-600 rounded-full hover:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500'
                        onClick={() => setIsEditing(true)}
                        aria-label={`Edit ${productName}`}
                        tabIndex={0}
                    >
                        <MdModeEditOutline />
                    </button>
                </div>
            </div>

            {isEditing && (
                <AdminEditProduct 
                    productData={data} 
                    onClose={() => setIsEditing(false)} 
                    fetchdata={fetchdata} 
                />
            )}
        </div>
    );
};

AdminProductCard.propTypes = {
    data: PropTypes.shape({
        productImage: PropTypes.arrayOf(PropTypes.string).isRequired,
        productName: PropTypes.string.isRequired,
    }).isRequired,
    fetchdata: PropTypes.func.isRequired,
};

export default AdminProductCard;