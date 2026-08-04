import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import giftCardImages from '../helper/heroimages';
import ExploreMarketButtonImg from '../app/Buttons/exploremarketbutton.png';
import './Hero.css';

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '100vw' : '-100vw',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100vw' : '-100vw',
    opacity: 0,
  }),
};

const Hero = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [heroImages] = useState(giftCardImages);

  const imageIndex =
    ((page % heroImages.length) + heroImages.length) % heroImages.length;

  const paginate = React.useCallback(
    (newDirection) => {
      setPage([page + newDirection, newDirection]);
    },
    [page],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(interval);
  }, [page, paginate]);

  const currentImage = heroImages[imageIndex];

  return (
    <header className="relative w-full lg:h-screen lg:mt-10 overflow-hidden bg-black/20 shadow-[0_0_30px_rgba(0,0,0,0.25)] md:h-full  md:mt-10 aspect-[21/9] sm:aspect-video lg:aspect-[21/7] mb-12">
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
            x: { type: 'spring', stiffness: 200, damping: 30 },
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
            className="h-full w-full object-contain sm:object-cover"
            style={{ background: '#222' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/35 via-black/20 to-black/50" />

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
            className={`hero-swiper-dot ${i === imageIndex ? 'active' : ''}`}
            onClick={() => setPage([i, i > imageIndex ? 1 : -1])}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-[3] flex h-full flex-col items-center justify-center px-2 py-6 text-center sm:px-4">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link
            to="/section"
            className="inline-block border-0 outline-none"
            tabIndex={0}
            aria-label="Explore Market"
          >
            <img
              src={ExploreMarketButtonImg}
              alt="Explore Market"
              className="h-24 w-auto object-contain drop-shadow-2xl transition-transform duration-200 hover:scale-110 sm:h-32 md:h-40 lg:h-44"
            />
          </Link>
          <div className="mt-3 inline-block rounded-full bg-black/35 px-3 py-1.5 text-base font-semibold text-white drop-shadow-lg sm:mt-5 sm:text-lg md:text-xl">
            {currentImage.title}
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default Hero;
