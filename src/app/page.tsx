"use client";
import { useState } from "react";
import { Layers } from "lucide-react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { PhotoModal } from "@/components/PhotoModal";
import postsData from "@/data/posts.json";
import { Post } from "@/types";
import Image from "next/image";

// Force type assertion since JSON import can be loose
const posts = postsData as Post[];

export default function Home() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <ProfileHeader postCount={posts.length} />

      {/* Grid */}
      <div className="max-w-4xl mx-auto border-t border-zinc-800 pt-0 md:pt-4">
        <div className="grid grid-cols-3 gap-1 md:gap-6">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="relative aspect-square group cursor-pointer overflow-hidden bg-zinc-900"
              onClick={() => setSelectedPost(post)}
            >
              <Image
                src={post.images[0].thumb}
                alt="Post thumbnail"
                fill
                className="object-cover transition-opacity group-hover:opacity-90"
                sizes="(max-width: 768px) 33vw, 300px"
              />
              
              {/* Carousel Icon */}
              {post.type === 'carousel' && (
                <div className="absolute top-2 right-2 text-white drop-shadow-md">
                  <Layers size={20} fill="currentColor" className="opacity-90" />
                </div>
              )}

              {/* Hover Overlay (Desktop) */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-6 text-white font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-xl">♥</span> {post.likes}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPost && (
        <PhotoModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </main>
  );
}