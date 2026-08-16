import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SummaryApi from '../common';
import { FaStar } from 'react-icons/fa';
import { FaStarHalf } from 'react-icons/fa';
import displayINRCurrency from '../helpers/displayCurrency';
import addToCart from '../helpers/addToCart';
import Context from '../Context';
import CategroyWiseProductDisplay from '../Components/CategroyWiseProductDisplay';
import SecxionLoader from '../Components/SecxionLoader';

const ProductDetails = () => {
  const [data, setData] = useState({
    productName: '',
    brandName: '',
    category: '',
    productImage: [],
    description: '',
    price: '',
    sellingPrice: '',
  });
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const productImageListLoading = new Array(4).fill(null);
  const [activeImage, setActiveImage] = useState('');

  const [zoomImageCoordinate, setZoomImageCoordinate] = useState({
    x: 0,
    y: 0,
  });
  const [zoomImage, setZoomImage] = useState(false);

  const { fetchUserAddToCart } = useContext(Context);

  const navigate = useNavigate();

  const fetchProductDetails = async () => {
    setLoading(true);
    const response = await fetch(SummaryApi.productDetails.url, {
      method: SummaryApi.productDetails.method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        productId: params?.id,
      }),
    });
    setLoading(false);
    const dataReponse = await response.json();

    setData(dataReponse?.data);
    setActiveImage(dataReponse?.data?.productImage[0]);
  };

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleMouseEnterProduct = (imageURL) => {
    setActiveImage(imageURL);
  };

  const handleZoomImage = useCallback((e) => {
    setZoomImage(true);
    const { left, top, width, height } = e.target.getBoundingClientRect();
    // console.log("coordinate", left, top , width , height)

    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    setZoomImageCoordinate({
      x,
      y,
    });
  }, []);

  const handleLeaveImageZoom = () => {
    setZoomImage(false);
  };

  const handleAddToCart = async (e, id) => {
    await addToCart(e, id);
    fetchUserAddToCart();
  };

  const handleBuyProduct = async (e, id) => {
    await addToCart(e, id);
    fetchUserAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return <SecxionLoader size="large" message="Loading product details..." />;
  }

  return (
    <div className="min-h-screen premium-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        <div className="flex flex-col lg:flex-row-reverse gap-4 sm:gap-6">
          <div className="h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[480px] lg:w-[480px] bg-white rounded-3xl relative p-4 shadow-2xl overflow-hidden group/zoom">
            <img
              src={activeImage}
              alt={data?.productName || 'Product image'}
              className="h-full w-full object-contain mix-blend-multiply rounded-2xl"
              onMouseMove={handleZoomImage}
              onMouseLeave={handleLeaveImageZoom}
            />

            {zoomImage && (
              <div className="hidden lg:block absolute inset-0 pointer-events-none border-4 border-brand-gold/30 rounded-3xl z-20"></div>
            )}

            {zoomImage && (
              <div className="hidden lg:block absolute min-w-[500px] overflow-hidden min-h-[500px] bg-white p-2 -right-[520px] top-0 shadow-2xl rounded-3xl border border-brand-gold/20 z-50">
                <div
                  className="w-full h-full min-h-[500px] min-w-[500px] mix-blend-multiply scale-[2.5]"
                  style={{
                    background: `url(${activeImage})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: `${zoomImageCoordinate.x * 100}% ${zoomImageCoordinate.y * 100}% `,
                  }}
                ></div>
              </div>
            )}
          </div>

          <div className="h-full">
            <div className="flex gap-3 lg:flex-col overflow-x-auto lg:overflow-y-auto scrollbar-hide h-full pb-2">
              {data?.productImage?.map((imgURL, index) => (
                <div
                  className={`h-16 w-16 sm:h-20 sm:w-20 rounded-xl p-1.5 flex-shrink-0 transition-all duration-300 border-2 cursor-pointer ${
                    activeImage === imgURL
                      ? 'border-brand-gold bg-brand-gold/10'
                      : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                  key={imgURL}
                  onMouseEnter={() => handleMouseEnterProduct(imgURL)}
                  onClick={() => handleMouseEnterProduct(imgURL)}
                >
                  <img
                    src={imgURL}
                    alt={
                      data?.productName
                        ? `${data.productName} thumbnail`
                        : 'Product thumbnail'
                    }
                    className="w-full h-full object-contain mix-blend-multiply rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-1 w-full">
            <p className="bg-slate-200 animate-pulse  h-6 lg:h-8 w-full rounded-full inline-block"></p>
            <h2
              className="text-2xl lg:text-4xl font-medium h-6 lg:h-8  bg-slate-200 animate-pulse w-full"
              aria-label="Loading product name"
            >
              &nbsp;
            </h2>
            <p className="capitalize text-slate-400 bg-slate-200 min-w-[100px] animate-pulse h-6 lg:h-8  w-full"></p>

            <div className="text-red-600 bg-slate-200 h-6 lg:h-8  animate-pulse flex items-center gap-1 w-full"></div>

            <div className="flex items-center gap-2 text-2xl lg:text-3xl font-medium my-1 h-6 lg:h-8  animate-pulse w-full">
              <p className="text-red-600 bg-slate-200 w-full"></p>
              <p className="text-slate-400 line-through bg-slate-200 w-full"></p>
            </div>

            <div className="flex items-center gap-3 my-2 w-full">
              <button className="h-6 lg:h-8  bg-slate-200 rounded animate-pulse w-full"></button>
              <button className="h-6 lg:h-8  bg-slate-200 rounded animate-pulse w-full"></button>
            </div>

            <div className="w-full">
              <p className="text-slate-600 font-medium my-1 h-6 lg:h-8   bg-slate-200 rounded animate-pulse w-full"></p>
              <p className=" bg-slate-200 rounded animate-pulse h-10 lg:h-12  w-full"></p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-6 mt-4 lg:mt-0">
            <div className="space-y-4">
              <span className="bg-brand-gold/10 text-brand-gold px-4 py-1.5 rounded-xl inline-block text-[10px] font-black uppercase tracking-[0.3em] border border-brand-gold/20 font-spaceGrotesk">
                {data?.brandName || 'Verified Product'}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-spaceGrotesk uppercase tracking-tighter leading-none">
                {data?.productName}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 font-spaceGrotesk">
                Category:{' '}
                <span className="text-gray-300">{data?.category}</span>
              </p>

              <div className="flex items-center gap-1.5 text-brand-gold text-xs">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStarHalf className="opacity-50" />
                <span className="ml-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Quality Verified
                </span>
              </div>
            </div>

            <div className="p-8 bg-black/20 rounded-3xl border border-white/5 space-y-2">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-spaceGrotesk">
                Current Market Value
              </p>
              <div className="flex items-baseline gap-4">
                <p className="text-4xl font-black text-white font-spaceGrotesk tracking-tighter">
                  {displayINRCurrency(data.sellingPrice)}
                </p>
                <p className="text-lg font-bold text-gray-600 line-through font-spaceGrotesk opacity-50">
                  {displayINRCurrency(data.price)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              <button
                className="flex-1 bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base py-5 rounded-2xl font-black font-spaceGrotesk uppercase tracking-widest shadow-brand-gold transition-all duration-300 active:scale-95"
                onClick={(e) => handleBuyProduct(e, data?._id)}
              >
                Buy Now
              </button>
              <button
                className="flex-1 bg-white/5 hover:bg-white/10 text-brand-gold py-5 rounded-2xl font-black font-spaceGrotesk uppercase tracking-widest border border-brand-gold/30 transition-all duration-300 active:scale-95"
                onClick={(e) => handleAddToCart(e, data?._id)}
              >
                Add to Cart
              </button>
            </div>

            <div className="mt-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] font-spaceGrotesk mb-4">
                Product Description
              </h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-medium">
                {data?.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {data.category && (
        <div className="mt-20 border-t border-white/5 pt-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold/60 font-spaceGrotesk text-center mb-12">
            You May Also Like
          </h2>
          <CategroyWiseProductDisplay category={data?.category} />
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
