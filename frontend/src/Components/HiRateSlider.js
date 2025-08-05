import React, { useEffect, useState } from "react";
import SummaryApi from "../common";
import { FaFire, FaEthereum } from 'react-icons/fa';

const ethApiUrl = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

const HiRateSlider = () => {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, ethRes] = await Promise.all([
          fetch(SummaryApi.allProduct.url, {
            method: "GET",
          }),
          fetch(ethApiUrl),
        ]);

        const productData = await productRes.json();
        const ethData = await ethRes.json();

        const allProducts = productData?.data || [];
        const ethRate = ethData?.ethereum?.usd || 0;

        const selectedCurrencies = ["USD", "GBP", "CAD", "CNY", "SGD", "AUD"];
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
                    image: product.productImage?.[0] || "",
                    sellingPrice: fv.sellingPrice,
                    currency: priceBlock.currency,
                  };

                  if (priceBlock.currency === "USD" || priceBlock.currency === "GBP") {
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
          const sortedCurrencyProducts = products.sort((a, b) => b.sellingPrice - a.sellingPrice);
          otherCurrencyTopRates.push(...sortedCurrencyProducts.slice(0, topNPerNewCurrency));
        });

        combinedProductRates.push(...otherCurrencyTopRates);

        const sortedRates = combinedProductRates.sort(
          (a, b) => b.sellingPrice - a.sellingPrice
        );
        const ethSlide = {
          productName: "Ethereum",
          image: null,
          isEthereum: true,
          sellingPrice: ethRate,
          currency: "USD",
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
              currentProductIndex = (currentProductIndex + 1) % sortedRates.length;
            }
          }
        }

        const finalSlides = [];
        const insertInterval = 7;

        for (let i = 0; i < cyclicalProductSlides.length; i++) {
          finalSlides.push(cyclicalProductSlides[i]);
          if ((i + 1) % insertInterval === 0 && i < cyclicalProductSlides.length - 1) {
            finalSlides.push(ethSlide);
          }
        }

        if (finalSlides.length === 0 && sortedRates.length === 0) {
            finalSlides.push(ethSlide);
        } else if (finalSlides.length > 0 && !(finalSlides[finalSlides.length - 1]?.isEthereum)) {
            finalSlides.push(ethSlide);
        }

        if (finalSlides.length > 0) {
          const repeatedSlides = [...finalSlides, ...finalSlides];
          setSlides(repeatedSlides);
        } else {
          setSlides([]);
        }

      } catch (error) {
        console.error("Slider Fetch Error:", error);
      }
    };

    fetchData();
  }, []);

  if (slides.length === 0) {
    return null;
  }

  const animationDuration = slides.length * 5;
  return (
    <div className="fixed top-20 py-1 mt-1 left-0 right-0 shadow-sm md:mt-4 lg:mt-4 z-30 w-full bg-white overflow-hidden">
      <div className="hirate-slider-track" style={{ animationDuration: `${animationDuration}s`}}>
        {slides.map((slide, index) => (
          <div key={index} className="hirate-slide">
            {slide.isEthereum ? (
              <FaEthereum className="slide-ethereum-icon" />
            ) : (
              slide.image && (
                <img src={slide.image} alt={slide.productName} className="slide-image" />
              )
            )}
            <p className="slide-text">
              <span className="slide-product-name">
                <FaFire className="fire-icon" />
                {slide.productName}
              </span>
              <span className="slide-price">
                 1 {slide.currency === "GBP" ? "£" : slide.currency} ={" "}
                    {Number(slide.sellingPrice).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiRateSlider;