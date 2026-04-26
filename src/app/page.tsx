"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Layers, Mountain, User, Grid } from "lucide-react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { PhotoModal } from "@/components/PhotoModal";
import postsData from "@/data/posts.json";
import { Post } from "@/types";
import Image from "next/image";
import clsx from "clsx";
import { motion, AnimatePresence, Variants } from "framer-motion";

const PAGE_SIZE = 12;

const posts = postsData as Post[];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

export default function Home() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'places' | 'people'>('places');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filteredPosts = posts.filter(post => post.category === activeTab);
  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  // Reset visible count when tab changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab]);

  // Load more posts when sentinel scrolls into view
  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filteredPosts.length));
  }, [filteredPosts.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <main className="min-h-screen bg-black text-white pb-20 font-sans">
      <ProfileHeader postCount={posts.length} />

      {/* --- TABS SECTION --- */}
      <div className="max-w-4xl mx-auto mt-2">
        <div className="grid grid-cols-2 w-full">
          
          {/* Places Tab */}
          <button 
            onClick={() => setActiveTab('places')}
            className={clsx(
              // Common styles
              "flex items-center justify-center gap-2 py-4 transition-colors duration-300 w-full outline-none",
              // Typography
              "text-xs md:text-sm font-semibold tracking-widest uppercase",
              // Logic: Active gets White Border, Inactive gets Transparent (invisible) border. 
              // Both have border-b-2 to prevent layout jumping.
              activeTab === 'places' 
                ? "border-b-2 border-white text-white" 
                : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Mountain size={16} />
            <span>Places</span>
          </button>

          {/* People Tab */}
          <button 
            onClick={() => setActiveTab('people')}
            className={clsx(
              "flex items-center justify-center gap-2 py-4 transition-colors duration-300 w-full outline-none",
              "text-xs md:text-sm font-semibold tracking-widest uppercase",
              activeTab === 'people' 
                ? "border-b-2 border-white text-white" 
                : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            <User size={16} />
            <span>People</span>
          </button>

        </div>
      </div>

      {/* --- GRID SECTION --- */}
      <div className="max-w-4xl mx-auto px-1 md:px-0">
        <AnimatePresence mode="wait">
          {filteredPosts.length > 0 ? (
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-3 gap-1 md:gap-2"
            >
              {visiblePosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={itemVariants}
                  className="relative aspect-[2/3] group cursor-pointer overflow-hidden bg-zinc-900"
                  onClick={() => setSelectedPost(post)}
                >
                  <Image
                    src={post.images[0].thumb}
                    alt="Post thumbnail"
                    fill
                    className="object-cover transition-opacity group-hover:opacity-90"
                    sizes="(max-width: 768px) 33vw, 300px"
                  />

                  {post.type === 'carousel' && (
                    <div className="absolute top-3 right-3 text-white drop-shadow-md z-10">
                      <Layers size={18} fill="currentColor" className="opacity-90" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center text-zinc-500"
            >
              <div className="flex justify-center mb-4 opacity-50"><Grid size={40} strokeWidth={1} /></div>
              <p>No photos yet.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sentinel — triggers the next batch when it scrolls into view */}
        {hasMore && <div ref={sentinelRef} className="h-1" />}
      </div>

      <AnimatePresence>
        {selectedPost && (
          <PhotoModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}