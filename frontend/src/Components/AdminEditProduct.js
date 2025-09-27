import React, { useState } from 'react';
import { CgClose } from 'react-icons/cg';
import productCategory from '../helpers/productCategory';
import currencyData from '../helpers/currencyData';
import { FaCloudUploadAlt } from 'react-icons/fa';
import uploadImage from '../helpers/uploadImage';
import DisplayImage from './DisplayImage';
import { MdDelete, MdAddCircleOutline } from 'react-icons/md';
import SummaryApi from '../common';
import { toast } from 'react-toastify';

const AdminEditProduct = ({ onClose, productData, fetchdata }) => {
  const [data, setData] = useState({
    _id: productData?._id || '',
    productName: productData?.productName || '',
    brandName: productData?.brandName || '',
    category: productData?.category || '',
    productImage: productData?.productImage || [],
    description: productData?.description || '',
    pricing: productData?.pricing || [],
  });

  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadProduct = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.warn('Please select a file.');
      return;
    }
    setUploading(true);
    try {
      const uploadImageCloudinary = await uploadImage(file);
      setData((prev) => ({
        ...prev,
        productImage: [...prev.productImage, uploadImageCloudinary.url],
      }));
    } catch (error) {
      toast.error('Error uploading image.');
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProductImage = (index) => {
    const newProductImage = [...data.productImage];
    newProductImage.splice(index, 1);
    setData((prev) => ({ ...prev, productImage: newProductImage }));
  };

  const handleAddCurrency = () => {
    setData((prev) => ({
      ...prev,
      pricing: [...prev.pricing, { currency: '', faceValues: [] }],
    }));
  };

  const handleAddFaceValue = (currencyIndex) => {
    const updatedPricing = [...data.pricing];
    if (!updatedPricing[currencyIndex]) {
      console.error('Currency index out of bounds:', currencyIndex);
      return;
    }
    updatedPricing[currencyIndex].faceValues.push({
      faceValue: '',
      sellingPrice: '',
      requirement: '',
    });
    setData((prev) => ({ ...prev, pricing: updatedPricing }));
  };

  const handleUpdatePricing = (currencyIndex, faceValueIndex, field, value) => {
    setData((prev) => {
      const updatedPricing = [...prev.pricing];
      if (!updatedPricing[currencyIndex]) return prev;
      if (faceValueIndex !== undefined) {
        if (!updatedPricing[currencyIndex].faceValues[faceValueIndex])
          return prev;
        updatedPricing[currencyIndex].faceValues[faceValueIndex][field] = value;
      } else {
        updatedPricing[currencyIndex].currency = value;
      }
      return { ...prev, pricing: updatedPricing };
    });
  };

  const handleDeleteFaceValue = (currencyIndex, faceValueIndex) => {
    setData((prev) => {
      const updatedPricing = [...prev.pricing];
      if (!updatedPricing[currencyIndex]?.faceValues[faceValueIndex])
        return prev;
      updatedPricing[currencyIndex].faceValues.splice(faceValueIndex, 1);
      return { ...prev, pricing: updatedPricing };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data._id) {
      toast.error('Product ID (_id) is required');
      return;
    }

    const transformedData = {
      ...data,
      pricing: data.pricing.map((currency) => ({
        ...currency,
        faceValues: currency.faceValues.map((fv) => ({
          ...fv,
          faceValue: fv.faceValue || '',
          sellingPrice: parseFloat(fv.sellingPrice) || 0,
          requirement: fv.requirement || '',
        })),
      })),
    };

    try {
      const response = await fetch(SummaryApi.updateProduct.url, {
        method: SummaryApi.updateProduct.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(transformedData),
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success(responseData?.message);
        onClose();
        fetchdata();
      }

      if (responseData.error) {
        toast.error(responseData?.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
      console.error('Update error:', error);
    }
  };

  return (
    <div className="container fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md mt-40 shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-xl text-gray-800">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CgClose className="h-6 w-6" />
          </button>
        </div>

        <form
          className="space-y-4 overflow-y-auto pb-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="productName"
              className="block text-sm font-medium text-gray-700"
            >
              Product Name:
            </label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={data.productName}
              onChange={handleOnChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              placeholder="Enter product name"
            />
          </div>
          <div>
            <label
              htmlFor="brandName"
              className="block text-sm font-medium text-gray-700"
            >
              Brand Name:
            </label>
            <input
              type="text"
              id="brandName"
              name="brandName"
              value={data.brandName}
              onChange={handleOnChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              placeholder="Enter brand name"
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category:
            </label>
            <select
              id="category"
              name="category"
              value={data.category}
              onChange={handleOnChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select Category</option>
              {productCategory.map((el) => (
                <option value={el.value} key={el.value}>
                  {el.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="uploadImageInput"
              className="block text-sm font-medium text-gray-700"
            >
              Product Image:
            </label>
            <div className="mt-1 flex items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-md py-6">
              <label htmlFor="uploadImageInput" className="cursor-pointer">
                <div className="space-y-1 text-center">
                  <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <span>Upload a file</span>
                    <input
                      id="uploadImageInput"
                      name="productImage"
                      type="file"
                      className="sr-only"
                      onChange={handleUploadProduct}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </label>
            </div>
            <div className="mt-2 flex space-x-2">
              {data.productImage.map((img, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 rounded-md overflow-hidden shadow-sm"
                >
                  <img
                    src={img}
                    alt={`product-${index}`}
                    className="object-cover w-full h-full cursor-pointer"
                    onClick={() => {
                      setOpenFullScreenImage(true);
                      setFullScreenImage(img);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteProductImage(index)}
                    className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full text-xs hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <MdDelete className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {uploading && (
                <p
                  className="text-blue-500 text-sm"
                  aria-live="polite"
                  role="status"
                  tabIndex={0}
                >
                  Uploading image...
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pricing:
            </label>
            {data.pricing.map((currency, currencyIndex) => (
              <div
                key={currencyIndex}
                className="mb-4 border rounded p-4 bg-gray-50 shadow-sm"
              >
                <div className="mb-2">
                  <label
                    htmlFor={`currency-${currencyIndex}`}
                    className="block text-xs font-medium text-gray-700"
                  >
                    Currency:
                  </label>
                  <select
                    id={`currency-${currencyIndex}`}
                    value={currency.currency}
                    onChange={(e) =>
                      handleUpdatePricing(
                        currencyIndex,
                        undefined,
                        'currency',
                        e.target.value,
                      )
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Currency</option>
                    {currencyData.map((cur) => (
                      <option value={cur.value} key={cur.value}>
                        {cur.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Face Values:
                  </label>
                  {currency.faceValues.map((faceValue, faceValueIndex) => (
                    <div key={faceValueIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Face Value"
                        value={faceValue.faceValue}
                        onChange={(e) =>
                          handleUpdatePricing(
                            currencyIndex,
                            faceValueIndex,
                            'faceValue',
                            e.target.value,
                          )
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Selling Price"
                        value={faceValue.sellingPrice}
                        onChange={(e) =>
                          handleUpdatePricing(
                            currencyIndex,
                            faceValueIndex,
                            'sellingPrice',
                            e.target.value,
                          )
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <input
                        type="text"
                        placeholder="requirement"
                        value={faceValue.requirement}
                        onChange={(e) =>
                          handleUpdatePricing(
                            currencyIndex,
                            faceValueIndex,
                            'requirement',
                            e.target.value,
                          )
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteFaceValue(currencyIndex, faceValueIndex)
                        }
                        className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        tabIndex={0}
                        aria-label="Delete Face Value"
                      >
                        <MdDelete className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddFaceValue(currencyIndex)}
                    className="inline-flex items-center mt-2 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    tabIndex={0}
                    aria-label="Add Face Value"
                  >
                    <MdAddCircleOutline className="mr-1 h-4 w-4" /> Add Face
                    Value
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCurrency}
              className="inline-flex items-center px-4 py-2 border border-green-500 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              tabIndex={0}
              aria-label="Add Currency"
            >
              <MdAddCircleOutline className="mr-2" /> Add Currency
            </button>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description:
            </label>
            <textarea
              id="description"
              name="description"
              value={data.description}
              onChange={handleOnChange}
              rows="4"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              tabIndex={0}
              aria-label="Update Product"
            >
              Update Product
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              tabIndex={0}
              aria-label="Cancel Edit"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {openFullScreenImage && (
        <DisplayImage
          onClose={() => setOpenFullScreenImage(false)}
          imgUrl={fullScreenImage}
        />
      )}
    </div>
  );
};

export default AdminEditProduct;
