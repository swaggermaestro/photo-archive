"use client";
import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Post } from "@/types";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface PhotoModalProps {
  post: Post;
  onClose: () => void;
}

export function PhotoModal({ post, onClose }: PhotoModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  // Intercept Android back swipe / browser back button.
  // onClose is stored in a ref so the effect only runs on mount/unmount.
  // Note: we intentionally do NOT call history.back() on cleanup — React Strict Mode
  // (enabled by default in Next.js) runs effects twice in dev, so calling history.back()
  // in cleanup would fire a popstate that immediately closes the modal on open.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    history.pushState({ modal: true }, "");
    const handlePopState = () => { onCloseRef.current(); };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handlePanEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const isHorizontal = Math.abs(info.offset.x) > Math.abs(info.offset.y);
    if (isHorizontal) {
      if (info.offset.x > 50) prevImage();
      else if (info.offset.x < -50) nextImage();
    } else if (info.offset.y > 80 || info.velocity.y > 600) {
      onClose();
    }
  };

  // Format the date
  const dateObj = new Date(post.timestamp);
  const formattedDate = dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden touch-none"
      onClick={onClose}
    >
      {/* Dynamic Blurred Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <Image
            src={post.images[currentImageIndex].full}
            alt="Background blur"
            fill
            className="object-cover blur-[100px] scale-110"
            priority
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/40 z-[5] pointer-events-none" />
      
      {/* Close Button */}
      <motion.button 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={onClose} 
        className="absolute top-4 right-4 z-[60] text-white/70 hover:text-white p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10"
      >
        <X size={24} />
      </motion.button>

      {/* Main Content Area - Image only, constrained width */}
      <div className="flex-1 flex flex-col w-full h-full max-w-7xl mx-auto z-10 min-h-0">

        {/* IMAGE SECTION */}
        <motion.div
          onPanEnd={handlePanEnd}
          className="relative flex-1 min-h-0 w-full flex items-center justify-center touch-none"
        >
            <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
                {post.images.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={false}
                    animate={{
                      opacity: idx === currentImageIndex ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={`absolute inset-0 flex items-center justify-center ${
                      idx === currentImageIndex ? "z-10" : "z-0 pointer-events-none"
                    }`}
                  >
                    <Image
                      src={img.full}
                      alt={`Post content ${idx + 1}`}
                      fill
                      className="object-contain drop-shadow-2xl"
                      sizes="100vw"
                      priority={idx === 0}
                      onLoad={() => handleImageLoad(idx)}
                      draggable={false}
                    />
                  </motion.div>
                ))}

                {/* Loading Spinner */}
                {!loadedImages[currentImageIndex] && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
                  </div>
                )}
            </div>

            {/* Navigation Arrows (Desktop) */}
            {post.images.length > 1 && (
                <>
                {currentImageIndex > 0 && (
                    <button onClick={prevImage} className="hidden md:block absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-[60] transition-transform hover:scale-110">
                    <ChevronLeft size={48} strokeWidth={1} />
                    </button>
                )}
                {currentImageIndex < post.images.length - 1 && (
                    <button onClick={nextImage} className="hidden md:block absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-[60] transition-transform hover:scale-110">
                    <ChevronRight size={48} strokeWidth={1} />
                    </button>
                )}
                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-[60]">
                    {post.images.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/30'}`}
                    />
                    ))}
                </div>
                </>
            )}
        </motion.div>

      </div>

      {/* DETAILS SECTION - outside max-w-7xl so gradient spans full screen width */}
      <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex-shrink-0 w-full bg-gradient-to-t from-black/80 to-transparent p-8 text-center md:text-left z-50"
          onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-3xl mx-auto space-y-3">
          <p className="text-white/50 text-xs uppercase tracking-[0.2em] font-semibold">
            {formattedDate}
          </p>
          <p className="text-white text-lg md:text-xl font-light leading-relaxed whitespace-pre-wrap">
            {post.caption}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}