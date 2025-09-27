import { useEffect, useState } from 'react';
import { CgClose } from 'react-icons/cg';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import uploadImage from '../helpers/uploadImage';
import DisplayImage from './DisplayImage';
import SummaryApi from '../common';
import currencyData from '../helpers/currencyData';
import flagImageMap from '../helpers/flagImageMap';
import { FaTimes } from 'react-icons/fa';

const UserUploadMarket = ({
  onClose = () => {},
  fetchData = () => {},
  productDetails = {},
}) => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState({
    Image: [],
    totalAmount: '',
    calculatedTotalAmount: '',
    userRemark: '',
    productImage: productDetails.productImage || '',
    productName: productDetails.productName || '',
    brandName: productDetails.brandName || '',
    category: productDetails.category || '',
    description: productDetails.description || '',
    pricing: Array.isArray(productDetails.pricing)
      ? productDetails.pricing
      : [],
    cardcode: '',
  });

  const [selectedRate, setSelectedRate] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState('');

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      productImage: productDetails.productImage || '',
      productName: productDetails.productName || '',
      brandName: productDetails.brandName || '',
      category: productDetails.category || '',
      requirement: productDetails.requirement || '',
      pricing:
        productDetails.currency &&
        productDetails.faceValue &&
        productDetails.rate
          ? [
              {
                currency: productDetails.currency,
                faceValues: [
                  {
                    faceValue: productDetails.faceValue,
                    sellingPrice: productDetails.rate,
                  },
                ],
              },
            ]
          : [],
      code: '', // Ensure code is reset or initialized appropriately with productDetails if it exists there
    }));

    if (productDetails.currency) {
      setCurrencySymbol(
        currencyData[productDetails.currency] || productDetails.currency,
      );
    }

    if (productDetails.rate) {
      setSelectedRate(productDetails.rate);
    }
  }, [productDetails]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'totalAmount') {
        const total = calculateTotalAmount(value);
        updated.calculatedTotalAmount = total.toFixed(2);
      }

      return updated;
    });
  };

  const calculateTotalAmount = (value) => {
    const amount = parseFloat(value) || 0;
    return amount * selectedRate;
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadImage(file);
      setData((prev) => ({
        ...prev,
        Image: [...prev.Image, result.url],
      }));
    } catch (err) {
      toast.error('⚠️ Error uploading image. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (index) => {
    const newImages = [...data.Image];
    newImages.splice(index, 1);
    setData((prev) => ({ ...prev, Image: newImages }));
    toast.info('🗑️ Image removed.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.pricing || data.pricing.length === 0) {
      toast.error('💰 Please add at least one pricing entry.');
      return;
    }

    try {
      const res = await fetch(SummaryApi.userMarket.url, {
        method: SummaryApi.userMarket.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`🎉 ${result.message}`);
        onClose();
        fetchData();
        navigate('/record');
      } else {
        toast.error(`🚨 ${result.message}`);
      }
    } catch (err) {
      toast.error('❌ Submission failed. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start z-50 overflow-y-auto pt-12 px-4">
      <div className="w-full max-w-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 p-6 rounded-2xl shadow-2xl relative border-2 border-yellow-700">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4 border-gray-800">
          <h2 className="text-xl md:text-2xl font-bold text-yellow-400">
            📦 Upload Product Details
          </h2>
          <motion.button
            onClick={onClose}
            className="fixed top-14 right-6 z-[10000] bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500/50 border-2 border-white/20"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            whileHover={{
              rotate: 90,
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
            }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close upload market"
          >
            <FaTimes className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Product Overview */}
        {productDetails.productImage && (
          <div className="flex gap-4 items-center border border-yellow-700 rounded-lg p-4 bg-gray-950 mb-6 shadow-sm">
            <img
              src={productDetails.productImage}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg shadow-inner"
            />
            <div className="flex flex-col gap-1 text-sm text-gray-200">
              <p>
                <span className="font-semibold text-yellow-400">Name:</span>{' '}
                {productDetails.productName}
              </p>
              <p>
                <span className="font-semibold text-yellow-400">Currency:</span>
                {flagImageMap[productDetails.currency] && (
                  <img
                    src={flagImageMap[productDetails.currency]}
                    className="w-5 h-5 inline-block ml-1"
                    alt={productDetails.currency}
                  />
                )}{' '}
                {productDetails.currency}
              </p>
              <p>
                <span className="font-semibold text-yellow-400">
                  Face Value:
                </span>{' '}
                {productDetails.faceValue}
              </p>
              <p>
                <span className="font-semibold text-yellow-400">Rate:</span>{' '}
                {productDetails.rate}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          className="space-y-6 overflow-y-auto max-h-[60vh] pr-2"
          onSubmit={handleSubmit}
        >
          {/* Image Upload */}
          <div>
            <label className="block font-semibold text-yellow-400 mb-2">
              📸 Upload Additional Images
            </label>
            <label
              htmlFor="uploadInput"
              className={`flex flex-col items-center justify-center border-2 border-yellow-700 rounded-lg p-5 bg-gray-950 cursor-pointer transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <FaCloudUploadAlt className="text-4xl text-yellow-500 mb-1" />
              <p className="text-gray-200">
                {uploading ? 'Uploading...' : 'Click or drag to upload'}
              </p>
            </label>
            <input
              type="file"
              id="uploadInput"
              className="hidden"
              onChange={handleUploadImage}
              disabled={uploading}
            />
            <div className="flex gap-3 mt-4 flex-wrap">
              {data.Image.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    onClick={() => {
                      setFullScreenImage(img);
                      setOpenFullScreenImage(true);
                    }}
                    className="w-20 h-20 rounded-md border border-yellow-700 object-cover cursor-pointer hover:scale-105 transition"
                    alt={`Uploaded product image ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(idx)}
                    className="absolute top-1 right-1 text-white bg-red-500 rounded-full p-1 hidden group-hover:block"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Total Face Value Input */}
          <div>
            <label className="block font-semibold text-yellow-400 mb-2">
              💰 Total Face Value ({currencySymbol})
            </label>
            <input
              type="number"
              name="totalAmount"
              value={data.totalAmount}
              onChange={handleOnChange}
              placeholder="Enter total face value"
              className="w-full border border-gray-700 p-3 rounded-lg shadow-sm text-gray-200 bg-gray-950"
              required
            />
          </div>

          {/* Calculated Amount Display */}
          <div>
            <label className="block font-semibold text-yellow-400 mb-2">
              = Calculated Total Amount:
            </label>
            <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 text-yellow-400 font-bold tracking-wide">
              ₦
              {parseFloat(data.calculatedTotalAmount || 0).toLocaleString(
                'en-NG',
                { minimumFractionDigits: 2 },
              )}
            </div>
          </div>

          {/* New Code Input */}
          <div>
            <label className="block font-semibold text-yellow-400 mb-2">
              Code
            </label>
            <input
              type="text"
              name="cardcode"
              value={data.cardcode}
              onChange={handleOnChange}
              placeholder="Enter code / pin (e.g., card code)"
              className="w-full border border-gray-700 p-3 rounded-lg shadow-sm text-gray-200 bg-gray-950"
              required
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-yellow-400 mb-2">
              📝 Additional Remarks
            </label>
            <textarea
              name="userRemark"
              rows={4}
              placeholder="Code, notes, details..."
              value={data.userRemark}
              onChange={handleOnChange}
              className="w-full border border-gray-700 p-3 rounded-lg shadow-sm text-gray-200 bg-gray-950"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg shadow-md hover:shadow-lg transition"
            disabled={uploading}
          >
            {uploading ? '⏳ Submitting...' : '✅ Submit Product'}
          </button>
        </form>
      </div>

      {/* Fullscreen Image Preview */}
      {openFullScreenImage && (
        <DisplayImage
          imgUrl={fullScreenImage}
          onClose={() => setOpenFullScreenImage(false)}
        />
      )}
    </div>
  );
};

export default UserUploadMarket;
