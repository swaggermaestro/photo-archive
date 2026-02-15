import { MapPin, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

export function ProfileHeader({ postCount }: { postCount: number }) {
  return (
    <header className="flex flex-col md:flex-row items-center md:items-start gap-4 px-6 py-12 md:px-0 max-w-4xl mx-auto border-b border-zinc-800/50">
      
      {/* Avatar Section */}
      <div className="flex-shrink-0">
        <div className="relative w-24 h-24 md:w-40 md:h-40 rounded-full bg-zinc-800 overflow-hidden ring-2 ring-zinc-800 shadow-xl">
           {/* Ensure you have an image at public/avatar.jpg */}
           <Image 
             src="/avatar.png" 
             alt="Simeon Boshoff"
             fill
             className="object-cover"
             priority
           />
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col gap-5 text-center md:text-left text-zinc-100">
        
        {/* Header Row: Name + Actions */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* SERIF FONT HERE - Matches reference styling */}
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-white">
            Simeon Boshoff 🇿🇦
          </h1>
          
          {/* <div className="flex gap-3">
            <button className="px-6 py-1.5 bg-white text-black font-semibold rounded-md text-sm hover:bg-zinc-200 transition">
              Follow
            </button>
            <button className="px-6 py-1.5 bg-zinc-800 text-white font-semibold rounded-md text-sm hover:bg-zinc-700 transition">
              Message
            </button>
          </div> */}
        </div>

        {/* Stats Row */}
        <div className="flex justify-center md:justify-start gap-8 md:gap-10 text-base py-2">
          <div className="flex flex-col md:flex-row items-center md:gap-1.5">
            <span className="font-bold text-white">{postCount}</span> 
            <span className="text-zinc-400">posts</span>
          </div>
          <div className="flex flex-col md:flex-row items-center md:gap-1.5">
            <span className="font-bold text-white">Fujifilm X-T3</span> 
            <span className="text-zinc-400">Camera</span>
          </div>
          <div className="flex flex-col md:flex-row items-center md:gap-1.5">
            <span className="font-bold text-white">35mm F/2</span> 
            <span className="text-zinc-400">Lens</span>
          </div>
        </div>

        {/* Bio Section */}
        {/* <div className="text-sm md:text-base space-y-2 max-w-lg">
          <div className="font-bold text-zinc-100">Photography Portfolio and Memories</div>
        </div> */}
      </div>
    </header>
  );
}