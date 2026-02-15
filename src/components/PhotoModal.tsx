"use client";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Post } from "@/types";
import Image from "next/image";

interface PhotoModalProps {
  post: Post;
  onClose: () => void;
}

export function PhotoModal({ post, onClose }: PhotoModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
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
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={onClose}>
      
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-[60] text-white/70 hover:text-white p-2 bg-black/20 rounded-full backdrop-blur-md"
      >
        <X size={24} />
      </button>

      {/* Main Content Area - Flex Column */}
      <div className="flex-1 flex flex-col w-full h-full max-w-7xl mx-auto">
        
        {/* IMAGE SECTION: Takes up all available space, but shrinks if needed */}
        <div className="relative flex-1 min-h-0 w-full bg-black flex items-center justify-center">
            <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
                <Image 
                  src={post.images[currentImageIndex].full} 
                  alt="Post content" 
                  fill 
                  className="object-contain" 
                  sizes="100vw"
                  priority
                />
            </div>

            {/* Navigation Arrows (Overlay on Image) */}
            {post.images.length > 1 && (
                <>
                {currentImageIndex > 0 && (
                    <button onClick={prevImage} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-[60]">
                    <ChevronLeft size={40} strokeWidth={1.5} />
                    </button>
                )}
                {currentImageIndex < post.images.length - 1 && (
                    <button onClick={nextImage} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-[60]">
                    <ChevronRight size={40} strokeWidth={1.5} />
                    </button>
                )}
                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-[60]">
                    {post.images.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/30'}`} 
                    />
                    ))}
                </div>
                </>
            )}
        </div>

        {/* DETAILS SECTION: Sits beneath the image */}
        <div 
            className="flex-shrink-0 w-full bg-black/90 p-6 text-center md:text-left z-50 border-t border-white/10"
            onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-3xl mx-auto space-y-2">
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-medium">
              {formattedDate}
            </p>
            <p className="text-zinc-100 text-base leading-relaxed whitespace-pre-wrap">
              {post.caption}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}