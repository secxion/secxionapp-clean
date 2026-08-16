import { useEffect, useState } from 'react';
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
import { emitTransactionActivity } from '../utils/transactionEvents';
import { toUserSafeMessage } from '../utils/userSafeMessage';

const UserUploadMarket = ({
  onClose = () => {},
  fetchData = () => {},
  productDetails = {},
}) => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
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
    if (submitError) setSubmitError(null);

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
      toast.error(
        toUserSafeMessage(
          err,
          'We could not upload the image. Please try again.',
        ),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (index) => {
    const newImages = [...data.Image];
    newImages.splice(index, 1);
    setData((prev) => ({ ...prev, Image: newImages }));
    toast.info('Image removed.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!data.pricing || data.pricing.length === 0) {
      toast.error('Add at least one pricing entry before continuing.');
      return;
    }

    if (
      !Number.isFinite(Number(data.calculatedTotalAmount)) ||
      Number(data.calculatedTotalAmount) <= 0
    ) {
      const message = 'Please enter a valid amount before submitting.';
      setSubmitError({ message });
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(SummaryApi.userMarket.url, {
        method: SummaryApi.userMarket.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      let result = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        result = await res.json();
      } else {
        const fallbackText = await res.text();
        result = {
          success: false,
          message: fallbackText || 'Unable to submit market upload.',
        };
      }

      if (res.ok && result.success) {
        toast.success(
          'Trade submitted successfully! You can track its progress in your records.',
        );
        emitTransactionActivity({
          source: 'user-market-upload',
          status: 'submitted',
        });
        onClose();
        fetchData();
        navigate('/record');
      } else {
        const message =
          result?.message || 'Submission was blocked. Please try again.';
        if (
          res.status === 403 ||
          result.code === 'UNVERIFIED_MARKET_SUBMISSION_BLOCKED'
        ) {
          setSubmitError({
            message:
              message ||
              "You've reached the cumulative transaction limit for unverified accounts. Identity verification is required to continue.",
            kycRedirectPath: result.kycRedirectPath || '/kyc',
          });
          toast.warning(
            'KYC Verification Required: Transaction limit reached.',
            { autoClose: 10000 },
          );
        } else {
          const safeMessage = toUserSafeMessage(
            message,
            'We could not submit this trade. Please try again.',
            { status: res.status },
          );
          setSubmitError({ message: safeMessage });
          toast.error(safeMessage);
        }
      }
    } catch (err) {
      const message = toUserSafeMessage(
        err,
        'We could not submit this trade. Please try again.',
      );
      setSubmitError({ message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed mt-10 inset-0 z-50 flex items-start justify-center overflow-hidden bg-black/85 backdrop-blur-sm">
      <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-gradient-to-br from-brand-dark-base via-brand-dark-elevated to-black p-6 shadow-[0_0_48px_rgba(0,0,0,0.36)]">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between pb-2">
          <h2 className="font-spaceGrotesk text-xl font-black uppercase tracking-[0.1em] text-brand-gold md:text-2xl">
            Upload Product Details
          </h2>
          <motion.button
            onClick={onClose}
            className="fixed top-14 right-6 z-[10000] rounded-full border border-rose-300/30 bg-rose-500/20 p-3 text-rose-300 shadow-2xl transition-all duration-200 hover:scale-110 hover:bg-rose-500/30 focus:outline-none focus:ring-4 focus:ring-rose-400/40"
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
              boxShadow: '0 0 30px rgba(251, 113, 133, 0.45)',
            }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close upload market"
          >
            <FaTimes className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Product Overview */}
        {productDetails.productImage && (
          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-white/[0.03] p-4 shadow-sm">
            <img
              src={productDetails.productImage}
              alt="Preview"
              className="h-24 w-24 rounded-xl object-cover shadow-inner"
            />
            <div className="flex flex-col gap-1 text-sm text-gray-200">
              <p>
                <span className="font-semibold text-brand-gold">Name:</span>{' '}
                {productDetails.productName}
              </p>
              <p>
                <span className="font-semibold text-brand-gold">Currency:</span>
                {flagImageMap[productDetails.currency] && (
                  <img
                    src={flagImageMap[productDetails.currency]}
                    className="ml-1 inline-block h-5 w-5"
                    alt={productDetails.currency}
                  />
                )}{' '}
                {productDetails.currency}
              </p>
              <p>
                <span className="font-semibold text-brand-gold">
                  Face Value:
                </span>{' '}
                {productDetails.faceValue}
              </p>
              <p>
                <span className="font-semibold text-brand-gold">Rate:</span>{' '}
                {productDetails.rate}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-2 pb-6"
          onSubmit={handleSubmit}
        >
          {/* Image Upload */}
          <div>
            <label className="mb-2 block font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold">
              Upload Additional Images
            </label>
            <label
              htmlFor="uploadInput"
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-black/20 p-5 transition hover:bg-white/[0.03] ${uploading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <FaCloudUploadAlt className="mb-1 text-4xl text-brand-gold" />
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
                    className="h-20 w-20 cursor-pointer rounded-xl object-cover transition hover:scale-105"
                    alt={`Uploaded product ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(idx)}
                    className="absolute right-1 top-1 hidden rounded-full bg-rose-500/20 p-1 text-rose-200 group-hover:block"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Total Face Value Input */}
          <div>
            <label className="mb-2 block font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold">
              Total Face Value ({currencySymbol})
            </label>
            <input
              type="number"
              name="totalAmount"
              value={data.totalAmount}
              onChange={handleOnChange}
              placeholder="Enter total face value"
              className="w-full rounded-xl bg-black/20 p-3 text-gray-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-gold/50"
              required
            />
          </div>

          {/* Calculated Amount Display */}
          <div>
            <label className="mb-2 block font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold">
              = Calculated Total Amount:
            </label>
            <div className="rounded-xl bg-brand-gold/10 p-3 font-spaceGrotesk text-brand-gold-light font-bold tracking-wide">
              ₦
              {parseFloat(data.calculatedTotalAmount || 0).toLocaleString(
                'en-NG',
                { minimumFractionDigits: 2 },
              )}
            </div>
          </div>

          {/* New Code Input */}
          <div>
            <label className="mb-2 block font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold">
              Code
            </label>
            <input
              type="text"
              name="cardcode"
              value={data.cardcode}
              onChange={handleOnChange}
              placeholder="Enter code / pin (e.g., card code)"
              className="w-full rounded-xl bg-black/20 p-3 text-gray-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-gold/50"
              required
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="mb-2 block font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold">
              Additional Remarks
            </label>
            <textarea
              name="userRemark"
              rows={4}
              placeholder="Code, notes, details..."
              value={data.userRemark}
              onChange={handleOnChange}
              className="w-full rounded-xl bg-black/20 p-3 text-gray-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-gold/50"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-brand-gold to-yellow-500 py-3 font-bold text-brand-dark-base shadow-md transition hover:from-yellow-400 hover:to-brand-gold hover:shadow-lg"
            disabled={uploading || isSubmitting}
          >
            {isSubmitting ? '⏳ Submitting...' : '✅ Submit Product'}
          </button>
        </form>

        {submitError && (
          <div className="absolute inset-0 z-[12000] flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-2xl border border-rose-300/30 bg-[#1a0d12] p-5 text-rose-100 shadow-2xl">
              <h3 className="font-spaceGrotesk text-base font-bold uppercase tracking-[0.08em] text-rose-200">
                SUBMISSION BLOCKED
              </h3>
              <p className="mt-3 text-sm leading-relaxed">
                {submitError.message}
              </p>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                  onClick={() => setSubmitError(null)}
                >
                  Close
                </button>

                {submitError.kycRedirectPath && (
                  <button
                    type="button"
                    className="rounded-md bg-brand-gold px-3 py-2 text-xs font-semibold text-black"
                    onClick={() => {
                      setSubmitError(null);
                      navigate(submitError.kycRedirectPath);
                    }}
                  >
                    Complete KYC Verification
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
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
