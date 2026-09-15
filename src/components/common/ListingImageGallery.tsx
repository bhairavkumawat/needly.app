import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface ListingImageGalleryProps {
  images: string[];
  title: string;
  badge?: React.ReactNode;
  aspectRatio?: string;
  showThumbnails?: boolean;
  className?: string;
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 0.98,
  }),
};

export const ListingImageGallery: React.FC<ListingImageGalleryProps> = ({
  images,
  title,
  badge,
  aspectRatio = 'aspect-[16/10] sm:aspect-[16/11]',
  showThumbnails = true,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Fallback if images array is empty
  const validImages = useMemo(() => {
    if (!images || images.length === 0) {
      return ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80'];
    }
    return images;
  }, [images]);

  const total = validImages.length;

  // Seamless looping navigation
  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToIndex = useCallback((index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Touch Swipe Gesture Handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isPointerDown = useRef<boolean>(false);
  const pointerStartX = useRef<number>(0);
  const pointerStartY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || total <= 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - (touchStartY.current || 0);

    // If gesture is horizontal, give subtle resistance drag feedback
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setDragOffset(Math.max(-50, Math.min(50, diffX * 0.4)));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - (touchStartY.current || 0);

    setDragOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;

    if (total > 1 && Math.abs(diffX) > 36 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        goToNext(); // Swipe left moves forward
      } else {
        goToPrev(); // Swipe right moves backward
      }
    }
  };

  // Pointer / Mouse Drag Handling for Desktop
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || total <= 1) return;
    isPointerDown.current = true;
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current || total <= 1) return;
    const diffX = e.clientX - pointerStartX.current;
    const diffY = e.clientY - pointerStartY.current;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setDragOffset(Math.max(-50, Math.min(50, diffX * 0.4)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    const diffX = e.clientX - pointerStartX.current;
    const diffY = e.clientY - pointerStartY.current;
    setDragOffset(0);

    if (total > 1 && Math.abs(diffX) > 36 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  const handlePointerCancel = () => {
    isPointerDown.current = false;
    setDragOffset(0);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, isFullscreen]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Main Image Container */}
      <div
        className={`relative ${aspectRatio} w-full bg-slate-950 overflow-hidden select-none touch-pan-y cursor-grab active:cursor-grabbing`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
      >
        {/* Animated Image Slide */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ transform: `translateX(${dragOffset}px)`, transition: dragOffset === 0 ? 'transform 0.2s ease-out' : 'none' }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-900"
            >
              <img
                src={validImages[currentIndex]}
                alt={`${title} - photo ${currentIndex + 1} of ${total}`}
                className="w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Subtle Dark Gradient Scrims for Maximum Contrast */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-950/60 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none" />

        {/* Previous Arrow Button */}
        {total > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            aria-label="Previous photo"
            className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/70 hover:bg-slate-900/95 active:scale-90 text-white backdrop-blur-md shadow-lg border border-white/20 flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 group"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
        )}

        {/* Next Arrow Button */}
        {total > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Next photo"
            className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/70 hover:bg-slate-900/95 active:scale-90 text-white backdrop-blur-md shadow-lg border border-white/20 flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 group"
          >
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}

        {/* Top-Right: Expand Photo Button */}
        <div className="absolute top-3 right-14 sm:right-16 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            aria-label="Expand photo"
            className="p-2 rounded-full bg-slate-900/75 backdrop-blur-md text-white/90 hover:text-white hover:bg-slate-900 transition-colors shadow-md border border-white/15 active:scale-95 cursor-pointer flex items-center justify-center"
            title="Expand photo"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom-Left Slot: Distance / Area Badge */}
        {badge && (
          <div className="absolute bottom-3 left-3 z-20 pointer-events-auto">
            {badge}
          </div>
        )}

        {/* Bottom-Right / Center: Clickable Dot Pagination */}
        {total > 1 && (
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1 bg-slate-900/75 backdrop-blur-md rounded-full border border-white/10 shadow-md">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToIndex(idx);
                }}
                aria-label={`Go to photo ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-4 h-1.5 bg-teal-400'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniature Thumbnail Preview Strip */}
      {total > 1 && showThumbnails && (
        <div 
          className="flex items-center gap-2 px-3.5 py-2 overflow-x-auto no-scrollbar scroll-smooth"
          aria-label="Photo thumbnails"
        >
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToIndex(idx)}
              aria-label={`Switch to photo ${idx + 1}`}
              className={`relative shrink-0 w-14 h-10 rounded-lg overflow-hidden transition-all cursor-pointer border ${
                currentIndex === idx
                  ? 'border-teal-600 ring-2 ring-teal-500/40 scale-102 opacity-100 shadow-sm'
                  : 'border-slate-200/80 opacity-70 hover:opacity-100 hover:border-slate-300'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {currentIndex === idx && (
                <div className="absolute inset-0 bg-teal-500/10 pointer-events-none" />
              )}
            </button>
          ))}
          <span className="text-[10px] text-slate-500 font-medium px-1 shrink-0">
            Swipe or use arrows to navigate
          </span>
        </div>
      )}

      {/* Fullscreen Modal Lightbox */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Top Bar in Fullscreen */}
            <div className="w-full max-w-4xl flex items-center justify-end z-30 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(false);
                }}
                className="p-2.5 rounded-full bg-slate-800/90 text-white hover:bg-slate-700 transition-colors cursor-pointer border border-white/10 shadow-lg active:scale-95 flex items-center justify-center"
                aria-label="Close fullscreen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Fullscreen Image Area with Swipe Handlers */}
            <div 
              className="relative flex-1 w-full max-w-4xl flex items-center justify-center my-4 overflow-hidden touch-pan-y"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 280, damping: 28 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute inset-0 flex items-center justify-center p-2"
                >
                  <img
                    src={validImages[currentIndex]}
                    alt={`${title} fullscreen`}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Fullscreen Arrow Buttons */}
              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrev();
                    }}
                    aria-label="Previous photo"
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md shadow-xl border border-white/20 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    aria-label="Next photo"
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md shadow-xl border border-white/20 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom thumbnail bar in fullscreen */}
            {total > 1 && (
              <div 
                className="w-full max-w-lg flex items-center justify-center gap-2 overflow-x-auto py-2 z-30"
                onClick={(e) => e.stopPropagation()}
              >
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToIndex(idx)}
                    className={`w-12 h-9 rounded-md overflow-hidden transition-all border ${
                      currentIndex === idx ? 'border-teal-400 ring-2 ring-teal-400/60 scale-105' : 'border-transparent opacity-50'
                    }`}
                  >
                    <img src={img} alt={`thumb ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
