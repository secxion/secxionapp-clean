import React, { useState } from 'react';
import { CgClose } from 'react-icons/cg';
import productCategory from '../helpers/productCategory';
import currencyData from '../helpers/currencyData';
import { FaCloudUploadAlt, FaPlusCircle, FaFileImport } from 'react-icons/fa';
import uploadImage from '../helpers/uploadImage';
import { MdDelete } from 'react-icons/md';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import RequirementInput from './RequirementInput';
import BulkImportModal from './BulkImportModal';

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
  const [showBulkImport, setShowBulkImport] = useState(false);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle bulk import data
  const handleBulkImport = (importedData) => {
    // importedData is { currency: [{ faceValue, sellingPrice, requirement }] }
    setData((prev) => {
      const updatedPricing = [...prev.pricing];

      for (const [currency, faceValues] of Object.entries(importedData)) {
        if (currency === 'UNKNOWN') continue; // Skip unknown currencies

        const existingIndex = updatedPricing.findIndex(
          (p) => p.currency === currency,
        );

        if (existingIndex !== -1) {
          // Add to existing currency
          for (const fv of faceValues) {
            updatedPricing[existingIndex].faceValues.push({
              faceValue: fv.faceValue,
              sellingPrice: parseFloat(fv.sellingPrice) || 0,
              requirement: fv.requirement || '',
            });
          }
        } else {
          // Create new currency entry
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
    <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-500/10 rounded-xl">
            <FaCloudUploadAlt className="text-yellow-500 text-lg" />
          </div>
          <h2 className="text-lg font-semibold text-white">Upload Product</h2>
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
              <option value={el.value} key={el.value} className="bg-slate-900">
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
              <p className="text-slate-500 text-xs mt-1">PNG, JPG up to 10MB</p>
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
                    className="w-full h-full object-cover"
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
            required
            placeholder="Enter product description"
          />
        </div>

        {/* Pricing Section */}
        <div className="border-t border-slate-700 pt-5">
          <h3 className="text-white font-semibold mb-4">Pricing</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Currency
              </label>
              <select
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
              >
                <option value="" className="bg-slate-900">
                  Select
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
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Face Value
              </label>
              <input
                type="text"
                placeholder="e.g. $10"
                value={newFaceValue}
                onChange={(e) => setNewFaceValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Rate</label>
              <input
                type="number"
                placeholder="Enter rate"
                value={newSellingPrice}
                onChange={(e) => setNewSellingPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">
                Requirement (click to expand)
              </label>
              <RequirementInput
                value={newRequirement}
                onChange={(val) => setNewRequirement(val)}
                placeholder="Click to add requirements..."
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAddPricing}
              className="inline-flex items-center px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:border-yellow-500/50 transition-colors"
            >
              <FaPlusCircle className="mr-2 text-yellow-500" /> Add Pricing
            </button>
            <button
              type="button"
              onClick={() => setShowBulkImport(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-lg text-sm text-yellow-400 hover:from-yellow-500/30 hover:to-yellow-600/30 transition-colors"
            >
              <FaFileImport className="mr-2" /> Bulk Import
            </button>
          </div>

          {/* Pricing List */}
          {data.pricing.length > 0 && (
            <div className="mt-4 space-y-3">
              {data.pricing.map((pricing, currencyIndex) => (
                <div
                  key={currencyIndex}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">
                      {pricing.currency}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleDeleteCurrency(currencyIndex)}
                      className="text-red-400 text-xs hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-3">
                    {pricing.faceValues.map((fv, index) => (
                      <div
                        key={index}
                        className="bg-slate-700/30 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">
                            {fv.faceValue}
                          </span>
                          <span className="text-yellow-500 font-semibold">
                            ₦{fv.sellingPrice}
                          </span>
                        </div>
                        {fv.requirement && (
                          <div className="text-slate-400 text-xs whitespace-pre-line border-t border-slate-600/50 pt-2 mt-2">
                            {fv.requirement}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center space-x-3 pt-4 border-t border-slate-700">
          <button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all"
          >
            Upload Product
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

export default UploadProduct;
