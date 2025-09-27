import React, { useState } from 'react';
import { CgClose } from 'react-icons/cg';
import productCategory from '../helpers/productCategory';
import currencyData from '../helpers/currencyData';
import { FaCloudUploadAlt, FaPlusCircle } from 'react-icons/fa';
import uploadImage from '../helpers/uploadImage';
import { MdDelete } from 'react-icons/md';
import SummaryApi from '../common';
import { toast } from 'react-toastify';

const UploadProduct = ({ onClose, fetchData }) => {
  const [data, setData] = useState({
    productName: '',
    brandName: '',
    category: '',
    productImage: [],
    description: '',
    pricing: [],
  });
  const [newCurrency, setNewCurrency] = useState('');
  const [newFaceValue, setNewFaceValue] = useState('');
  const [newSellingPrice, setNewSellingPrice] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPricing = () => {
    if (!newCurrency || !newFaceValue || !newSellingPrice || !newRequirement) {
      toast.error('Please fill in all pricing fields.');
      return;
    }

    const currencyIndex = data.pricing.findIndex(
      (p) => p.currency === newCurrency,
    );
    if (currencyIndex !== -1) {
      const updatedPricing = [...data.pricing];
      updatedPricing[currencyIndex].faceValues.push({
        faceValue: newFaceValue,
        sellingPrice: parseFloat(newSellingPrice),
        requirement: newRequirement,
      });
      setData((prev) => ({ ...prev, pricing: updatedPricing }));
    } else {
      setData((prev) => ({
        ...prev,
        pricing: [
          ...prev.pricing,
          {
            currency: newCurrency,
            faceValues: [
              {
                faceValue: newFaceValue,
                sellingPrice: parseFloat(newSellingPrice),
                requirement: newRequirement,
              },
            ],
          },
        ],
      }));
    }

    setNewCurrency('');
    setNewFaceValue('');
    setNewSellingPrice('');
    setNewRequirement('');
  };

  const handleDeleteCurrency = (currencyIndex) => {
    const updatedPricing = [...data.pricing];
    updatedPricing.splice(currencyIndex, 1);
    setData((prev) => ({ ...prev, pricing: updatedPricing }));
  };

  const handleUploadProduct = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error('Please select a file.');
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
    const updatedImages = [...data.productImage];
    updatedImages.splice(index, 1);
    setData((prev) => ({ ...prev, productImage: updatedImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.productImage.length === 0) {
      toast.error('Please upload at least one product image.');
      return;
    }

    try {
      const response = await fetch(SummaryApi.uploadProduct.url, {
        method: SummaryApi.uploadProduct.method,
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success(responseData?.message);
        onClose();
        fetchData();
      }

      if (responseData.error) {
        toast.error(responseData?.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="fixed w-full h-full bg-slate-200 bg-opacity-35 left-0 right-0 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded w-full max-w-2xl max-h-[80%] overflow-y-auto mb-4 mt-44">
        <div className="flex justify-between items-center pb-3">
          <h2 className="font-semibold text-xl text-gray-800">
            Upload Product
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CgClose className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              {data.productImage.map((el, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 rounded-md overflow-hidden shadow-sm"
                >
                  <img
                    src={el}
                    alt={`Uploaded-${index}`}
                    className="object-cover w-full h-full"
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
            </div>
            {!data.productImage[0] && (
              <p
                className="text-red-500 text-sm"
                aria-live="assertive"
                role="alert"
                tabIndex={0}
              >
                *Please upload a product image
              </p>
            )}
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

          <div>
            <label
              htmlFor="brandName"
              className="block text-sm font-medium text-gray-700"
            >
              Description:
            </label>
            <textarea
              className="w-full p-3 border-none outline-none bg-gray-50"
              rows={4}
              autoFocus
              type="text"
              id="description"
              name="description"
              value={data.description}
              onChange={handleOnChange}
              required
              placeholder="Enter Description"
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Add Pricing</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label
                  htmlFor="newCurrency"
                  className="block text-sm font-medium text-gray-700"
                >
                  Currency:
                </label>
                <select
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
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
                <label htmlFor="faceValue" className="mt-3">
                  FaceValue :
                </label>
                <input
                  type="text"
                  placeholder="Enter face value"
                  value={newFaceValue}
                  onChange={(e) => setNewFaceValue(e.target.value)}
                  className="p-2 bg-slate-100 border rounded"
                />
              </div>
              <div>
                <label
                  htmlFor="newSellingPrice"
                  className="block text-sm font-medium text-gray-700"
                >
                  Rate:
                </label>
                <input
                  type="number"
                  placeholder="Enter Rate"
                  value={newSellingPrice}
                  onChange={(e) => setNewSellingPrice(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="newRequirement"
                  className="block text-sm font-medium text-gray-700"
                >
                  Requirement:
                </label>
                <input
                  type="text"
                  placeholder="Enter FV Requirement"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddPricing}
              className="inline-flex items-center px-4 py-2 border border-green-500 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              tabIndex={0}
              aria-label="Add Pricing"
            >
              <FaPlusCircle className="mr-2" /> Add Pricing
            </button>
            <div className="mt-4">
              {data.pricing.map((pricing, currencyIndex) => (
                <div key={currencyIndex} className="mb-3 border rounded p-3">
                  <h4 className="font-semibold">{pricing.currency}</h4>
                  <ul className="list-disc pl-4">
                    {pricing.faceValues.map((fv, index) => (
                      <li key={index}>
                        {fv.faceValue} - {fv.sellingPrice} <br />
                        <span className="text-gray-500">
                          requirement: {fv.requirement}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleDeleteCurrency(currencyIndex)}
                    className="text-red-500 text-sm hover:text-red-700 focus:outline-none"
                  >
                    Delete {pricing.currency} Pricing
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              tabIndex={0}
              aria-label="Upload Product"
            >
              Upload Product
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              tabIndex={0}
              aria-label="Cancel Upload"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadProduct;
