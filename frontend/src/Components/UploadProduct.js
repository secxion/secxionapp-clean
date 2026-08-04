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
    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-brand-dark-base shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-white/5 p-6 bg-white/[0.02]">
        <div className="flex items-center space-x-4">
          <div className="rounded-xl border border-brand-gold/20 bg-brand-gold/10 p-2.5 shadow-brand-gold">
            <FaCloudUploadAlt className="text-xl text-brand-gold" />
          </div>
          <h2 className="text-xl font-black text-white font-spaceGrotesk uppercase tracking-[0.3em]">
            Asset Registration
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 text-gray-500 hover:text-white transition-colors"
        >
          <CgClose size={24} />
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 space-y-5 overflow-y-auto p-5"
      >
        {/* Product Name */}
        <div className="group">
          <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 font-spaceGrotesk group-focus-within:text-brand-gold transition-colors">
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            value={data.productName}
            onChange={handleOnChange}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-medium text-white placeholder-gray-700 transition-all focus:border-brand-gold/50 outline-none"
            required
            placeholder="Enter product title..."
          />
        </div>

        {/* Brand Name */}
        <div className="group">
          <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 font-spaceGrotesk group-focus-within:text-brand-gold transition-colors">
            Brand Identity
          </label>
          <input
            type="text"
            name="brandName"
            value={data.brandName}
            onChange={handleOnChange}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-medium text-white placeholder-gray-700 transition-all focus:border-brand-gold/50 outline-none"
            required
            placeholder="Enter brand name..."
          />
        </div>

        {/* Category */}
        <div className="group">
          <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 font-spaceGrotesk group-focus-within:text-brand-gold transition-colors">
            Category
          </label>
          <select
            name="category"
            value={data.category}
            onChange={handleOnChange}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-medium text-white transition-all focus:border-brand-gold/50 outline-none appearance-none cursor-pointer"
            required
          >
            <option value="" className="bg-brand-dark-base">
              SELECT_CATEGORY
            </option>
            {productCategory.map((el) => (
              <option
                value={el.value}
                key={el.value}
                className="bg-brand-dark-base"
              >
                {el.label.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 font-spaceGrotesk">
            Attach Visual Data
          </label>
          <div className="rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02] p-8 text-center transition-all hover:border-brand-gold/30 hover:bg-white/[0.04] cursor-pointer group">
            <label htmlFor="uploadImageInput" className="cursor-pointer">
              <FaCloudUploadAlt className="mx-auto mb-4 h-12 w-12 text-gray-600 group-hover:text-brand-gold transition-colors" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">
                Select asset images
              </p>
              <p className="mt-2 text-[9px] font-bold text-gray-700 uppercase">
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
            <p className="mt-2 flex items-center text-sm text-brand-gold">
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
        <div className="group">
          <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 font-spaceGrotesk group-focus-within:text-brand-gold transition-colors">
            Detailed Specification
          </label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleOnChange}
            rows={4}
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-medium text-white placeholder-gray-700 transition-all focus:border-brand-gold/50 outline-none"
            required
            placeholder="Describe the asset in detail..."
          />
        </div>

        {/* Pricing Section */}
        <div className="border-t border-white/5 pt-8">
          <h3 className="mb-8 text-xs font-black text-brand-gold uppercase tracking-[0.4em] font-spaceGrotesk flex items-center gap-3">
            <FaPlusCircle className="opacity-50" /> Define Value
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="group">
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">
                Currency
              </label>
              <select
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-medium text-white focus:border-brand-gold/50 outline-none appearance-none"
              >
                <option value="" className="bg-brand-dark-base">
                  SELECT
                </option>
                {currencyData.map((cur) => (
                  <option
                    value={cur.value}
                    key={cur.value}
                    className="bg-brand-dark-base"
                  >
                    {cur.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">
                Face Value
              </label>
              <input
                type="text"
                placeholder="e.g. $100"
                value={newFaceValue}
                onChange={(e) => setNewFaceValue(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-medium text-white focus:border-brand-gold/50 outline-none"
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">
                Exchange Rate
              </label>
              <input
                type="number"
                placeholder="NGN Rate"
                value={newSellingPrice}
                onChange={(e) => setNewSellingPrice(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-medium text-white focus:border-brand-gold/50 outline-none"
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">
                Requirement Sequence
              </label>
              <RequirementInput
                value={newRequirement}
                onChange={(val) => setNewRequirement(val)}
                placeholder="Add requirements..."
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleAddPricing}
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-white/5 hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
              <FaPlusCircle className="text-brand-gold" /> Commit Value
            </button>
            <button
              type="button"
              onClick={() => setShowBulkImport(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gold/10 px-6 py-3 text-[10px] font-black text-brand-gold uppercase tracking-widest border border-brand-gold/20 hover:bg-brand-gold/20 transition-all active:scale-95"
            >
              <FaFileImport /> Batch Data Entry
            </button>
          </div>

          {/* Pricing List */}
          {data.pricing.length > 0 && (
            <div className="mt-10 space-y-4">
              {data.pricing.map((pricing, currencyIndex) => (
                <div
                  key={currencyIndex}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                      {pricing.currency} Sequence
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleDeleteCurrency(currencyIndex)}
                      className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-300"
                    >
                      [ Remove ]
                    </button>
                  </div>
                  <div className="space-y-4">
                    {pricing.faceValues.map((fv, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-white/5 bg-black/40 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {fv.faceValue}
                          </span>
                          <span className="text-brand-gold font-black font-mono text-sm">
                            ₦{fv.sellingPrice.toLocaleString()}
                          </span>
                        </div>
                        {fv.requirement && (
                          <div className="mt-3 text-[9px] font-bold text-gray-600 uppercase tracking-widest border-t border-white/5 pt-3 leading-relaxed">
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
        <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-white/5 pt-10 mt-10">
          <button
            type="submit"
            className="w-full sm:flex-1 rounded-2xl bg-brand-gold hover:bg-brand-gold-dark py-5 font-black text-brand-dark-base uppercase tracking-[0.3em] text-sm shadow-[0_10px_30px_rgba(212,175,55,0.2)] transition-all active:scale-95"
          >
            Submit Registration
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-10 py-5 border border-white/10 text-gray-500 rounded-2xl font-black font-spaceGrotesk text-[10px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all active:scale-95"
          >
            Abort
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
