import React, { useEffect, useState } from 'react';
import SummaryApi from '../common';
import FireIcon from '../app/Icons/fireicon.png';
import EthereumIcon from '../app/Icons/ethereumicon.png';
import SecxionShimmer from './SecxionShimmer';

const ethApiUrl =
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
const HIRATE_CACHE_KEY = 'secxion_hirate_slider_cache_v1';
const HIRATE_CACHE_TTL_MS = 5 * 60 * 1000;

let hiRateSlidesMemoryCache = {
  slides: null,
  timestamp: 0,
};

const isFreshCache = (timestamp) =>
  Date.now() - timestamp < HIRATE_CACHE_TTL_MS;

const readHiRateCache = () => {
  if (
    hiRateSlidesMemoryCache.slides &&
    isFreshCache(hiRateSlidesMemoryCache.timestamp)
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

    if (!isFreshCache(parsed.timestamp)) {
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

const HiRateSlider = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const cachedSlides = readHiRateCache();
    if (cachedSlides?.length) {
      setSlides(cachedSlides);
      setLoading(false);
    }

    const fetchData = async () => {
      try {
        const [productRes, ethRes] = await Promise.all([
          fetch(SummaryApi.allProduct.url, {
            method: 'GET',
          }),
          fetch(ethApiUrl),
        ]);

        const productData = await productRes.json();
        const ethData = await ethRes.json();

        const allProducts = productData?.data || [];
        const ethRate = ethData?.ethereum?.usd || 0;

        const selectedCurrencies = ['USD', 'GBP', 'CAD', 'CNY', 'SGD', 'AUD'];
        const topNPerNewCurrency = 2;

        let combinedProductRates = [];
        let otherCurrencyTopRates = [];

        const productsByCurrency = new Map();

        allProducts.forEach((product) => {
          product.pricing.forEach((priceBlock) => {
            if (selectedCurrencies.includes(priceBlock.currency)) {
              priceBlock.faceValues.forEach((fv) => {
                if (fv.sellingPrice) {
                  const slideData = {
                    productName: product.productName,
                    image: product.productImage?.[0] || '',
                    sellingPrice: fv.sellingPrice,
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

        productsByCurrency.forEach((products, currency) => {
          const sortedCurrencyProducts = products.sort(
            (a, b) => b.sellingPrice - a.sellingPrice,
          );
          otherCurrencyTopRates.push(
            ...sortedCurrencyProducts.slice(0, topNPerNewCurrency),
          );
        });

        combinedProductRates.push(...otherCurrencyTopRates);

        const sortedRates = combinedProductRates.sort(
          (a, b) => b.sellingPrice - a.sellingPrice,
        );
        const ethSlide = {
          productName: 'Ethereum',
          image: null,
          isEthereum: true,
          sellingPrice: ethRate,
          currency: 'USD',
        };

        const topProductsToShow = 20;
        let cyclicalProductSlides = [];

        if (sortedRates.length > 0) {
          const initialSlice = sortedRates.slice(0, topProductsToShow);
          cyclicalProductSlides.push(...initialSlice);

          if (sortedRates.length > topProductsToShow) {
            let currentProductIndex = 0;
            const targetLength = Math.max(topProductsToShow * 2, 40);

            while (cyclicalProductSlides.length < targetLength) {
              cyclicalProductSlides.push(sortedRates[currentProductIndex]);
              currentProductIndex =
                (currentProductIndex + 1) % sortedRates.length;
            }
          }
        }

        const finalSlides = [];
        const insertInterval = 7;

        for (let i = 0; i < cyclicalProductSlides.length; i++) {
          finalSlides.push(cyclicalProductSlides[i]);
          if (
            (i + 1) % insertInterval === 0 &&
            i < cyclicalProductSlides.length - 1
          ) {
            finalSlides.push(ethSlide);
          }
        }

        if (finalSlides.length === 0 && sortedRates.length === 0) {
          finalSlides.push(ethSlide);
        } else if (
          finalSlides.length > 0 &&
          !finalSlides[finalSlides.length - 1]?.isEthereum
        ) {
          finalSlides.push(ethSlide);
        }

        const nextSlides =
          finalSlides.length > 0 ? [...finalSlides, ...finalSlides] : [];

        if (!isMounted) {
          return;
        }

        setSlides(nextSlides);
        if (nextSlides.length > 0) {
          writeHiRateCache(nextSlides);
        }
        setLoading(false);
      } catch (error) {
        console.error('Slider Fetch Error:', error);
        if (isMounted && !cachedSlides?.length) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 p-6 shadow-inner border border-gray-200">
        <div className="relative z-10">
          <h2 className="text-gray-800 text-2xl font-semibold mb-4">
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
    <div className="fixed top-20 py-2.5 md:mt-9 lg:mt-9 left-0 right-0 z-30 w-full bg-brand-dark-base/60 backdrop-blur-xl border-b border-white/5 overflow-hidden shadow-2xl">
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
