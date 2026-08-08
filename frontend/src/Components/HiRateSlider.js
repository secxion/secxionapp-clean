import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SummaryApi from '../common';
import FireIcon from '../app/Icons/fireicon.png';
import EthereumIcon from '../app/Icons/ethereumicon.png';
import SecxionShimmer from './SecxionShimmer';

const ethApiUrl =
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
const HIRATE_CACHE_KEY = 'secxion_hirate_slider_cache_v1';
const HIRATE_CACHE_MAX_STALE_MS = 24 * 60 * 60 * 1000;
const HIRATE_FETCH_TIMEOUT_MS = 8000;

let hiRateSlidesMemoryCache = {
  slides: null,
  timestamp: 0,
};

const isUsableCache = (timestamp) =>
  Number.isFinite(timestamp) &&
  Date.now() - timestamp < HIRATE_CACHE_MAX_STALE_MS;

const readHiRateCache = () => {
  if (
    hiRateSlidesMemoryCache.slides &&
    isUsableCache(hiRateSlidesMemoryCache.timestamp)
  ) {
    return hiRateSlidesMemoryCache.slides;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(HIRATE_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.slides || !Array.isArray(parsed.slides)) {
      return null;
    }

    if (!isUsableCache(parsed.timestamp)) {
      return null;
    }

    hiRateSlidesMemoryCache = {
      slides: parsed.slides,
      timestamp: parsed.timestamp,
    };

    return parsed.slides;
  } catch (error) {
    return null;
  }
};

const writeHiRateCache = (slides) => {
  const payload = {
    slides,
    timestamp: Date.now(),
  };

  hiRateSlidesMemoryCache = payload;

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(HIRATE_CACHE_KEY, JSON.stringify(payload));
  } catch (error) {
    // Ignore cache write failures (e.g. quota/private mode) and keep UI responsive.
  }
};

const buildHiRateSlides = (allProducts, ethRate = 0) => {
  const selectedCurrencies = ['USD', 'GBP', 'CAD', 'CNY', 'SGD', 'AUD'];
  const topNPerNewCurrency = 2;
  const combinedProductRates = [];
  const otherCurrencyTopRates = [];
  const productsByCurrency = new Map();

  allProducts.forEach((product) => {
    product.pricing.forEach((priceBlock) => {
      if (selectedCurrencies.includes(priceBlock.currency)) {
        priceBlock.faceValues.forEach((faceValue) => {
          if (faceValue.sellingPrice) {
            const slideData = {
              productName: product.productName,
              image: product.productImage?.[0] || '',
              sellingPrice: faceValue.sellingPrice,
              currency: priceBlock.currency,
            };

            if (
              priceBlock.currency === 'USD' ||
              priceBlock.currency === 'GBP'
            ) {
              combinedProductRates.push(slideData);
            } else {
              if (!productsByCurrency.has(priceBlock.currency)) {
                productsByCurrency.set(priceBlock.currency, []);
              }
              productsByCurrency.get(priceBlock.currency).push(slideData);
            }
          }
        });
      }
    });
  });

  productsByCurrency.forEach((products) => {
    const sortedCurrencyProducts = products.sort(
      (first, second) => second.sellingPrice - first.sellingPrice,
    );
    otherCurrencyTopRates.push(
      ...sortedCurrencyProducts.slice(0, topNPerNewCurrency),
    );
  });

  combinedProductRates.push(...otherCurrencyTopRates);

  const sortedRates = combinedProductRates.sort(
    (first, second) => second.sellingPrice - first.sellingPrice,
  );
  const ethSlide = {
    productName: 'Ethereum',
    image: null,
    isEthereum: true,
    sellingPrice: ethRate,
    currency: 'USD',
  };
  const topProductsToShow = 20;
  const cyclicalProductSlides = sortedRates.slice(0, topProductsToShow);

  if (sortedRates.length > topProductsToShow) {
    let currentProductIndex = 0;
    const targetLength = Math.max(topProductsToShow * 2, 40);

    while (cyclicalProductSlides.length < targetLength) {
      cyclicalProductSlides.push(sortedRates[currentProductIndex]);
      currentProductIndex = (currentProductIndex + 1) % sortedRates.length;
    }
  }

  const finalSlides = [];
  const insertInterval = 7;

  cyclicalProductSlides.forEach((slide, index) => {
    finalSlides.push(slide);
    if (
      ethRate > 0 &&
      (index + 1) % insertInterval === 0 &&
      index < cyclicalProductSlides.length - 1
    ) {
      finalSlides.push(ethSlide);
    }
  });

  if (ethRate > 0) {
    if (finalSlides.length === 0) {
      finalSlides.push(ethSlide);
    } else if (!finalSlides[finalSlides.length - 1]?.isEthereum) {
      finalSlides.push(ethSlide);
    }
  }

  return finalSlides.length > 0 ? [...finalSlides, ...finalSlides] : [];
};

const HiRateSlider = ({ visible = true }) => {
  const location = useLocation();
  const [slides, setSlides] = useState(() => readHiRateCache() || []);
  const [loading, setLoading] = useState(slides.length === 0);
  const isWalletDashboard = location.pathname === '/mywallet';

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, HIRATE_FETCH_TIMEOUT_MS);

    const fetchData = async () => {
      try {
        const ethRateRequest = fetch(ethApiUrl, {
          signal: controller.signal,
        })
          .then(async (response) => {
            if (!response.ok) return 0;
            const data = await response.json();
            return Number(data?.ethereum?.usd) || 0;
          })
          .catch(() => 0);

        const productRes = await fetch(SummaryApi.allProduct.url, {
          method: 'GET',
          signal: controller.signal,
        });

        if (!productRes.ok) {
          throw new Error('Failed to fetch product rate data');
        }

        const productData = await productRes.json();
        const allProducts = productData?.data || [];
        const productSlides = buildHiRateSlides(allProducts);

        if (!isMounted) {
          return;
        }

        if (productSlides.length > 0) {
          setSlides(productSlides);
          writeHiRateCache(productSlides);
        }
        setLoading(false);

        const ethRate = await ethRateRequest;
        const enrichedSlides = buildHiRateSlides(allProducts, ethRate);

        if (isMounted && ethRate > 0 && enrichedSlides.length > 0) {
          setSlides(enrichedSlides);
          writeHiRateCache(enrichedSlides);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Slider Fetch Error:', error);
        }
        if (isMounted) {
          setLoading(false);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  if (!visible) {
    return null;
  }

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-dark-base via-brand-dark-elevated to-black p-6 shadow-[0_0_24px_rgba(0,0,0,0.25)]">
        <div className="relative z-10">
          <h2 className="mb-4 font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">
            Loading Rates...
          </h2>
          <SecxionShimmer type="grid" count={4} />
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const animationDuration = slides.length * 5;
  return (
    <div
      className={`fixed left-0 right-0 z-30 w-full overflow-hidden border-b border-white/5 bg-brand-dark-base/60 py-0.5 shadow-2xl backdrop-blur-xl ${
        isWalletDashboard
          ? 'top-[113px] md:top-[120px]'
          : 'top-[89px] md:top-20 md:mt-9'
      }`}
    >
      <div
        className="hirate-slider-track"
        style={{ animationDuration: `${animationDuration}s` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="hirate-slide px-8 border-r border-white/5 flex items-center gap-4"
          >
            {slide.isEthereum ? (
              <div className="p-1.5 bg-brand-gold/10 rounded-lg">
                <img
                  src={EthereumIcon}
                  alt="Ethereum"
                  className="w-4 h-4 object-contain"
                />
              </div>
            ) : (
              slide.image && (
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-black/40 p-1">
                  <img
                    src={slide.image}
                    alt={slide.productName}
                    className="w-full h-full object-contain"
                  />
                </div>
              )
            )}
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <img
                  src={FireIcon}
                  alt="Fire"
                  className="w-2.5 h-2.5 opacity-50"
                />
                {slide.productName}
              </span>
              <span className="text-xs font-black font-spaceGrotesk text-white tracking-tight mt-0.5">
                1 {slide.currency === 'GBP' ? '£' : slide.currency} ={' '}
                <span className="text-brand-gold">
                  ₦
                  {Number(slide.sellingPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiRateSlider;
