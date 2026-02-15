"use client";
import { useState } from "react";
import { Layers, Mountain, User, Grid } from "lucide-react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { PhotoModal } from "@/components/PhotoModal";
import postsData from "@/data/posts.json";
import { Post } from "@/types";
import Image from "next/image";
import clsx from "clsx";

const posts = postsData as Post[];

export default function Home() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'adventures' | 'portraits'>('adventures');

  const filteredPosts = posts.filter(post => post.category === activeTab);

  return (
    <main className="min-h-screen bg-black text-white pb-20 font-sans">
      <ProfileHeader postCount={posts.length} />

      {/* --- TABS SECTION --- */}
      <div className="max-w-4xl mx-auto mt-2">
        <div className="grid grid-cols-2 w-full">
          
          {/* Adventures Tab */}
          <button 
            onClick={() => setActiveTab('adventures')}
            className={clsx(
              // Common styles
              "flex items-center justify-center gap-2 py-4 transition-colors duration-300 w-full outline-none",
              // Typography
              "text-xs md:text-sm font-semibold tracking-widest uppercase",
              // Logic: Active gets White Border, Inactive gets Transparent (invisible) border. 
              // Both have border-b-2 to prevent layout jumping.
              activeTab === 'adventures' 
                ? "border-b-2 border-white text-white" 
                : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Mountain size={16} />
            <span>Adventures</span>
          </button>

          {/* Portraits Tab */}
          <button 
            onClick={() => setActiveTab('portraits')}
            className={clsx(
              "flex items-center justify-center gap-2 py-4 transition-colors duration-300 w-full outline-none",
              "text-xs md:text-sm font-semibold tracking-widest uppercase",
              activeTab === 'portraits' 
                ? "border-b-2 border-white text-white" 
                : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            <User size={16} />
            <span>Portraits</span>
          </button>

        </div>
      </div>

      {/* --- GRID SECTION --- */}
      <div className="max-w-4xl mx-auto">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
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
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center text-zinc-500">
            <div className="flex justify-center mb-4 opacity-50"><Grid size={40} strokeWidth={1} /></div>
            <p>No photos yet.</p>
          </div>
        )}
      </div>

      {selectedPost && (
        <PhotoModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </main>
  );
}