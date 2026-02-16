import React, { useState } from 'react';
import { CgClose } from 'react-icons/cg';
import productCategory from '../helpers/productCategory';
import currencyData from '../helpers/currencyData';
import { FaCloudUploadAlt, FaFileImport } from 'react-icons/fa';
import uploadImage from '../helpers/uploadImage';
import DisplayImage from './DisplayImage';
import {
  MdDelete,
  MdAddCircleOutline,
  MdModeEditOutline,
} from 'react-icons/md';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import RequirementInput from './RequirementInput';
import BulkImportModal from './BulkImportModal';

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
  const [showBulkImport, setShowBulkImport] = useState(false);

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

  // Handle bulk import data
  const handleBulkImport = (importedData) => {
    setData((prev) => {
      const updatedPricing = [...prev.pricing];

      for (const [currency, faceValues] of Object.entries(importedData)) {
        if (currency === 'UNKNOWN') continue;

        const existingIndex = updatedPricing.findIndex(
          (p) => p.currency === currency,
        );

        if (existingIndex !== -1) {
          for (const fv of faceValues) {
            updatedPricing[existingIndex].faceValues.push({
              faceValue: fv.faceValue,
              sellingPrice: parseFloat(fv.sellingPrice) || 0,
              requirement: fv.requirement || '',
            });
          }
        } else {
          updatedPricing.push({
            currency,
            faceValues: faceValues.map((fv) => ({
              faceValue: fv.faceValue,
              sellingPrice: parseFloat(fv.sellingPrice) || 0,
              requirement: fv.requirement || '',
            })),
          });
        }
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/10 rounded-xl">
              <MdModeEditOutline className="text-yellow-500 text-lg" />
            </div>
            <h2 className="text-lg font-semibold text-white">Edit Product</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <CgClose size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-5"
        >
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              value={data.productName}
              onChange={handleOnChange}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-colors"
              required
              placeholder="Enter product name"
            />
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Brand Name
            </label>
            <input
              type="text"
              name="brandName"
              value={data.brandName}
              onChange={handleOnChange}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-colors"
              required
              placeholder="Enter brand name"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Category
            </label>
            <select
              name="category"
              value={data.category}
              onChange={handleOnChange}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
              required
            >
              <option value="" className="bg-slate-900">
                Select Category
              </option>
              {productCategory.map((el) => (
                <option
                  value={el.value}
                  key={el.value}
                  className="bg-slate-900"
                >
                  {el.label}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Product Images
            </label>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-yellow-500/50 transition-colors">
              <label htmlFor="uploadImageInput" className="cursor-pointer">
                <FaCloudUploadAlt className="mx-auto h-10 w-10 text-slate-500 mb-2" />
                <p className="text-slate-400 text-sm">Click to upload images</p>
                <p className="text-slate-500 text-xs mt-1">
                  PNG, JPG up to 10MB
                </p>
                <input
                  id="uploadImageInput"
                  type="file"
                  className="hidden"
                  onChange={handleUploadProduct}
                />
              </label>
            </div>
            {uploading && (
              <p className="text-yellow-500 text-sm mt-2 flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent mr-2"></span>
                Uploading...
              </p>
            )}
            {data.productImage.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {data.productImage.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-16 h-16 rounded-lg overflow-hidden group"
                  >
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => {
                        setOpenFullScreenImage(true);
                        setFullScreenImage(img);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteProductImage(index)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MdDelete className="text-red-400" size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="border-t border-slate-700 pt-5">
            <h3 className="text-white font-semibold mb-4">Pricing</h3>
            {data.pricing.map((currency, currencyIndex) => (
              <div
                key={currencyIndex}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-4"
              >
                <div className="mb-3">
                  <label className="block text-xs text-slate-400 mb-1">
                    Currency
                  </label>
                  <select
                    value={currency.currency}
                    onChange={(e) =>
                      handleUpdatePricing(
                        currencyIndex,
                        undefined,
                        'currency',
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
                  >
                    <option value="" className="bg-slate-900">
                      Select Currency
                    </option>
                    {currencyData.map((cur) => (
                      <option
                        value={cur.value}
                        key={cur.value}
                        className="bg-slate-900"
                      >
                        {cur.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs text-slate-400">
                    Face Values
                  </label>
                  {currency.faceValues.map((faceValue, faceValueIndex) => (
                    <div
                      key={faceValueIndex}
                      className="bg-slate-700/30 rounded-lg p-3 space-y-2"
                    >
                      <div className="grid grid-cols-3 gap-2 items-center">
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
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
                        />
                        <input
                          type="text"
                          placeholder="Rate"
                          value={faceValue.sellingPrice}
                          onChange={(e) =>
                            handleUpdatePricing(
                              currencyIndex,
                              faceValueIndex,
                              'sellingPrice',
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteFaceValue(currencyIndex, faceValueIndex)
                          }
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors justify-self-end"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Requirement (click to expand)
                        </label>
                        <RequirementInput
                          value={faceValue.requirement}
                          onChange={(val) =>
                            handleUpdatePricing(
                              currencyIndex,
                              faceValueIndex,
                              'requirement',
                              val,
                            )
                          }
                          placeholder="Click to add requirements..."
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddFaceValue(currencyIndex)}
                    className="inline-flex items-center mt-2 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 hover:border-yellow-500/50 transition-colors"
                  >
                    <MdAddCircleOutline className="mr-1" /> Add Face Value
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCurrency}
              className="inline-flex items-center px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:border-yellow-500/50 transition-colors"
            >
              <MdAddCircleOutline className="mr-2 text-yellow-500" /> Add
              Currency
            </button>
            <button
              type="button"
              onClick={() => setShowBulkImport(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-lg text-sm text-yellow-400 hover:from-yellow-500/30 hover:to-yellow-600/30 transition-colors"
            >
              <FaFileImport className="mr-2" /> Bulk Import
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={data.description}
              onChange={handleOnChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-colors resize-none"
              placeholder="Enter product description"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center space-x-3 pt-4 border-t border-slate-700">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all"
            >
              Update Product
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-colors"
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

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onImport={handleBulkImport}
        existingCurrencies={data.pricing.map((p) => p.currency)}
      />
    </div>
  );
};

export default AdminEditProduct;
