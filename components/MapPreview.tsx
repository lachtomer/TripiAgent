"use client";

import { MapPin, Navigation, Info } from "lucide-react";

export default function MapPreview() {
  return (
    <section className="w-full">
      <div className="relative w-full aspect-[16/10] rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg overflow-hidden border border-outline-variant/30 bg-gradient-to-br from-amber-50/20 to-zinc-50 dark:from-zinc-900/30 dark:to-zinc-950 shadow-md flex flex-col group">
        
        {/* SVG Decorative Grid & Vector Map Route */}
        <div className="absolute inset-0 opacity-40 dark:opacity-30 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-outline-variant/30" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Abstract Route SVG Map */}
        <div className="absolute inset-0 pointer-events-none p-6">
          <svg className="w-full h-full" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Lake Garda representation */}
            <path
              d="M 240,80 C 235,65 240,40 245,35 C 250,30 255,45 252,65 C 250,75 253,90 250,95 C 247,100 242,105 241,110 C 240,115 245,120 243,122 C 241,124 235,115 237,105 C 238,98 245,95 240,80 Z"
              fill="#bfdbfe"
              className="dark:fill-blue-950/40 opacity-70 stroke-blue-300 dark:stroke-blue-800"
              strokeWidth="1.5"
            />
            
            {/* Dotted Route Line connecting locations */}
            <path
              d="M 60,120 Q 150,110 242,122 T 290,135 T 340,105"
              stroke="#bfcab7"
              strokeWidth="2.5"
              strokeDasharray="5,5"
              className="dark:stroke-zinc-800"
            />
            
            <path
              d="M 60,120 Q 150,110 242,122 T 290,135 T 340,105"
              stroke="#006400"
              strokeWidth="2.5"
              strokeDasharray="5,5"
              strokeDashoffset="10"
              className="dark:stroke-[#86df72] animate-[dash_20s_linear_infinite]"
              style={{
                strokeDashoffset: 100,
              }}
            />
            
            {/* Connection path to Verona */}
            <path
              d="M 242,122 Q 280,150 320,130"
              stroke="#006400"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              className="opacity-40 dark:stroke-[#86df72]"
            />
          </svg>
        </div>

        {/* CSS Keyframes for animated dashes */}
        <style jsx global>{`
          @keyframes dash {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>

        {/* Map Pin Overlays */}
        
        {/* 1. Milan Malpensa (MXP) */}
        <div className="absolute left-[12%] top-[45%] flex flex-col items-center">
          <div className="flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 border border-outline-variant/30 px-2 py-0.5 rounded-lg shadow-sm text-[9px] font-bold text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            MXP Airport
          </div>
          <MapPin className="h-4 w-4 text-zinc-500 mt-0.5" />
        </div>

        {/* 2. Monzambano (Villa Eunice - Base) */}
        <div className="absolute left-[54%] top-[65%] flex flex-col items-center z-10">
          <div className="relative">
            {/* Glow ring */}
            <span className="absolute -inset-1 rounded-full bg-primary/20 dark:bg-[#86df72]/20 animate-ping opacity-75"></span>
            <div className="relative flex items-center gap-1.5 bg-primary dark:bg-[#86df72] border border-primary/20 px-2.5 py-1 rounded-lg shadow-md text-[10px] font-extrabold text-white dark:text-zinc-950">
              <span className="w-2 h-2 rounded-full bg-[#86df72] dark:bg-[#004900] animate-pulse"></span>
              Monzambano (Base)
            </div>
          </div>
          <MapPin className="h-5 w-5 text-primary dark:text-[#86df72] mt-0.5 filter drop-shadow" />
        </div>

        {/* 3. Sirmione (Lake Garda Peninsula) */}
        <div className="absolute left-[52%] top-[34%] flex flex-col items-center">
          <div className="flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 border border-outline-variant/30 px-2 py-0.5 rounded-lg shadow-sm text-[9px] font-bold text-foreground">
            Sirmione Spa
          </div>
          <MapPin className="h-4 w-4 text-primary dark:text-[#86df72] mt-0.5" />
        </div>

        {/* 4. Verona (Day Trip) */}
        <div className="absolute left-[78%] top-[42%] flex flex-col items-center">
          <div className="flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 border border-outline-variant/30 px-2 py-0.5 rounded-lg shadow-sm text-[9px] font-bold text-foreground">
            Verona
          </div>
          <MapPin className="h-4 w-4 text-primary dark:text-[#86df72] mt-0.5" />
        </div>

        {/* Dashboard Details Header */}
        <div className="p-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/45 dark:bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-white text-[10px] font-extrabold tracking-wider uppercase">
            <Navigation className="h-3 w-3 text-[#86df72] animate-pulse" />
            Active Route Map
          </div>
        </div>

        {/* Details Footer Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/45 to-transparent text-white flex justify-between items-end">
          <div className="space-y-0.5">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#86df72]">Lake Garda Route</h4>
            <p className="text-[10px] text-white/80 font-medium">Drive base: Villa Eunice, Monzambano</p>
          </div>
          <div className="flex gap-3 text-right">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-white/50">Total Route</p>
              <p className="text-xs font-bold text-white">165 km</p>
            </div>
            <div className="w-px h-6 bg-white/20 self-center"></div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-white/50">Est. Travel</p>
              <p className="text-xs font-bold text-[#86df72]">~2h 15m</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
