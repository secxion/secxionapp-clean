import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import giftCardImages from "../helper/heroimages";
import ExploreMarketButtonImg from "../app/Buttons/exploremarketbutton.png";
import "./Hero.css";

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? "100vw" : "-100vw",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? "100vw" : "-100vw",
    opacity: 0,
  }),
};

const Hero = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [heroImages] = useState(giftCardImages);

  const imageIndex = ((page % heroImages.length) + heroImages.length) % heroImages.length;

  const paginate = React.useCallback(
    (newDirection) => {
      setPage([page + newDirection, newDirection]);
    },
    [page]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(interval);
  }, [page, paginate]);

  const currentImage = heroImages[imageIndex];

    return (
      <header className="relative w-full h-56 sm:h-72 md:h-[75vh] md:h-[80vh] overflow-hidden rounded-2xl shadow-xl border-4 border-yellow-800 mt-6">
      {/* Image Slider */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          className="absolute inset-0 w-full h-full"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 200, damping: 30 },
            opacity: { duration: 0.3 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
        >
          <img
            src={currentImage.url}
            alt={currentImage.title}
            className="w-full h-full object-contain sm:object-cover"
            style={{ background: '#222' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-[2]" />

      {/* Navigation Arrows */}
      <button
        onClick={() => paginate(-1)}
        className="hero-swiper-nav prev left-2 sm:left-4 md:left-10 z-[3] top-1/2 -translate-y-1/2"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} className="text-white" />
      </button>
      <button
        onClick={() => paginate(1)}
        className="hero-swiper-nav next right-2 sm:right-4 md:right-10 z-[3] top-1/2 -translate-y-1/2"
        aria-label="Next slide"
      >
        <ChevronRight size={24} className="text-white" />
      </button>

      {/* Pagination Dots */}
  <div className="hero-swiper-pagination z-[3] mb-2 sm:mb-0">
        {heroImages.map((_, i) => (
          <div
            key={i}
            className={`hero-swiper-dot ${i === imageIndex ? "active" : ""}`}
            onClick={() => setPage([i, i > imageIndex ? 1 : -1])}
          />
        ))}
      </div>

      {/* Hero Content */}
  <div className="relative z-[3] text-center flex flex-col items-center justify-center h-full px-2 sm:px-4">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link
            to="/section"
            className="inline-block focus:outline-none focus:ring-4 focus:ring-yellow-400 rounded-lg"
            tabIndex={0}
            aria-label="Explore Market"
          >
            <img
              src={ExploreMarketButtonImg}
              alt="Explore Market"
              className="h-32 xs:h-40 sm:h-56 md:h-60 w-auto object-contain hover:scale-110 transition-transform duration-200 drop-shadow-2xl rounded-2xl shadow-lg"
            />
          </Link>
          <div className="mt-3 sm:mt-6 text-white text-base xs:text-lg sm:text-xl md:text-2xl font-semibold drop-shadow-lg bg-black/40 px-2 py-1 rounded-lg inline-block">
            {currentImage.title}
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default Hero;
