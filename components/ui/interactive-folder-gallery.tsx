"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface GalleryPhoto {
  id: string | number;
  content: React.ReactNode;
}

const defaultPhotos: GalleryPhoto[] = [
  {
    id: 1,
    content: (
      <div className="w-full h-full bg-[#050504] border border-[#e8e4d9]/30 flex flex-col justify-between p-5 relative overflow-hidden group rounded-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,228,217,0.15),transparent)] pointer-events-none" />
        <div className="text-[#e8e4d9] font-bold text-xs tracking-widest uppercase relative z-10">LUMINELCOACH</div>
        <div className="relative z-10">
          <div className="text-white text-xl font-serif italic font-light mb-2">Mentore AI</div>
          <div className="text-stone-400 text-[10px] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">Ascolta le tue sfide, calcola le tue vittorie e ti guida al successo H24.</div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    content: (
      <div className="w-full h-full bg-[rgba(10,10,10,0.95)] border border-[#e8e4d9]/20 flex flex-col justify-between p-5 relative overflow-hidden backdrop-blur-xl group rounded-xl">
        <div className="text-[#e8e4d9] font-bold text-xs tracking-widest uppercase relative z-10">VIRTUALBNB</div>
        <div className="relative z-10">
          <div className="text-stone-300 text-xl font-serif italic font-light mb-2">Property AI</div>
          <div className="text-stone-400 text-[10px] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">Gestione totale e automatica degli immobili. Dal check-in al pricing dinamico.</div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    content: (
      <div className="w-full h-full bg-[rgba(15,15,15,0.95)] border border-[#e8e4d9]/15 flex flex-col justify-between p-5 relative overflow-hidden backdrop-blur-xl group rounded-xl">
        <div className="text-[#e8e4d9] font-bold text-[10px] tracking-[0.25em] uppercase relative z-10">VIRTUALTWIN</div>
        <div className="relative z-10">
          <div className="text-stone-400 text-xl font-serif italic font-light mb-2">Clone H24</div>
          <div className="text-stone-400 text-[10px] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">Il tuo alter-ego digitale che risponde ai lead e fissa appuntamenti per te.</div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    content: (
      <div className="w-full h-full bg-gradient-to-br from-[#e8e4d9] to-[#ffffff] border border-[#ffffff]/50 flex flex-col justify-between p-5 relative overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.4)] group rounded-xl">
        <div className="text-black font-extrabold text-[9px] tracking-[0.3em] uppercase relative z-10">MICHAEL LUMINELS</div>
        <div className="relative z-10">
          <div className="text-black text-2xl font-serif italic font-bold mb-2">L'Élite</div>
          <div className="text-black/80 text-[10px] leading-relaxed font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">Accesso su invito. Il vertice visionario dell'ecosistema per dominare il mercato.</div>
        </div>
      </div>
    )
  }
];

export interface InteractiveFolderGalleryProps {
  photos?: GalleryPhoto[];
  folderName?: string;
  dragHintText?: string;
  className?: string;
}

export function InteractiveFolderGallery({
  photos = defaultPhotos,
  folderName = "LUMINEL ECOSYSTEM",
  dragHintText = "Trascina giù per chiudere",
  className
}: InteractiveFolderGalleryProps) {
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [hoverFolder, setHoverFolder] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isFolderOpen && hoveredCard === null) {
      timeoutRef.current = setTimeout(() => {
        setIsFolderOpen(false);
        setHoverFolder(false);
      }, 4000);
    }
  };

  useEffect(() => {
    resetTimeout();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isFolderOpen, hoveredCard]);

  return (
    <div className={`w-full py-20 relative ${className || ""}`}>
      <div className="relative w-full min-h-[500px] flex flex-col items-center justify-center">

        <div className="relative w-[340px] h-[400px] flex justify-center pointer-events-none z-0 mt-32">

          {/* CARDS */}
          <div className="absolute bottom-12 z-10 flex justify-center">
            {photos.map((photo, i) => {
              const offset = i - 1.5;
              const isThisHovered = hoveredCard === photo.id;

              // CLOSED STATE (Inside the portal)
              const closedY = 0;
              const closedX = 0;
              const closedRotate = 0;
              const closedScale = 0;
              const closedOpacity = 0;

              // OPEN STATE (Exploded high up)
              const openY = -280 + Math.abs(offset) * 20; 
              const openX = offset * 110;
              const openRotate = offset * 12; 
              const openScale = 1.05;

              // HOVERED STATE (Brought to front center)
              const activeY = -300;
              const activeX = 0;
              const activeRotate = 0;
              const activeScale = 1.4;

              const isOtherHovered = hoveredCard !== null && !isThisHovered;

              return (
                <motion.div
                  key={photo.id}
                  drag={isFolderOpen}
                  dragSnapToOrigin={true}
                  onDragStart={resetTimeout}
                  onDragEnd={(e, info) => {
                    resetTimeout();
                    if (info.offset.y > 80 && isFolderOpen) {
                      setIsFolderOpen(false);
                      setHoverFolder(false);
                    }
                  }}
                  onMouseEnter={() => isFolderOpen && setHoveredCard(photo.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`absolute bottom-0 w-48 h-64 rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] origin-bottom ${isFolderOpen ? "cursor-grab active:cursor-grabbing pointer-events-auto" : "pointer-events-none"}`}
                  animate={
                    !isFolderOpen
                      ? { y: closedY, x: closedX, rotate: closedRotate, scale: closedScale, opacity: closedOpacity, zIndex: 0 }
                      : isThisHovered
                      ? { y: activeY, x: activeX, rotate: activeRotate, scale: activeScale, zIndex: 100, opacity: 1 }
                      : { 
                          y: openY, 
                          x: openX, 
                          rotate: openRotate, 
                          scale: openScale, 
                          zIndex: 50,
                          opacity: isOtherHovered ? 0.3 : 1
                        }
                  }
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <motion.div 
                    className="w-full h-full transition-transform duration-500 ease-out"
                  >
                    {photo.content}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* HOLOGRAPHIC PORTAL BASE */}
          <motion.div 
            className="absolute bottom-0 w-[340px] h-[100px] cursor-pointer z-20 pointer-events-auto flex items-center justify-center"
            style={{ perspective: "1000px" }}
            animate={{ 
              opacity: 1, 
              pointerEvents: isFolderOpen ? "none" : "auto" 
            }}
            onMouseEnter={() => setHoverFolder(true)}
            onMouseLeave={() => setHoverFolder(false)}
            onClick={() => setIsFolderOpen(true)}
          >
            {/* The Glowing Ring */}
            <motion.div 
              className="w-[280px] h-[80px] rounded-full border border-[#e8e4d9]/50 shadow-[0_0_50px_rgba(232,228,217,0.3),inset_0_0_20px_rgba(232,228,217,0.2)] flex items-center justify-center relative overflow-hidden"
              style={{ rotateX: "70deg" }}
              animate={{
                scale: hoverFolder || isFolderOpen ? 1.1 : 1,
                boxShadow: isFolderOpen ? "0 0 100px rgba(232,228,217,0.6), inset 0 0 50px rgba(232,228,217,0.4)" : "0 0 50px rgba(232,228,217,0.2), inset 0 0 20px rgba(232,228,217,0.1)"
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-[#e8e4d9]/10 rounded-full blur-md" />
              {/* Inner glowing core */}
              <div className="w-[180px] h-[40px] border border-[#e8e4d9] rounded-full flex items-center justify-center shadow-[0_0_30px_#e8e4d9]" />
              
              {/* Rotating radar/scanning effect when open */}
              {isFolderOpen && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e8e4d9]/40 to-transparent"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
            
            {/* Holographic Beam projecting upwards when open */}
            <motion.div
              className="absolute bottom-[40px] w-[200px] h-[300px] bg-gradient-to-t from-[#e8e4d9]/20 to-transparent blur-xl pointer-events-none"
              animate={{ opacity: isFolderOpen ? 1 : 0, scaleY: isFolderOpen ? 1 : 0, originY: 1 }}
              transition={{ duration: 0.8 }}
            />
            
            {/* Floating Text when closed */}
            <AnimatePresence>
              {!isFolderOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-0 w-full flex flex-col items-center justify-center pointer-events-none drop-shadow-[0_0_10px_#e8e4d9]"
                >
                  <span className="text-[#e8e4d9] text-[10px] font-bold tracking-[0.4em] uppercase z-10 mb-1">
                    {folderName}
                  </span>
                  <span className="text-[#e8e4d9]/70 text-[8px] uppercase tracking-widest">
                    Clicca per attivare
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* HINT TEXT */}
        <motion.div 
          animate={{ opacity: isFolderOpen ? 1 : 0, y: isFolderOpen ? 0 : 20 }}
          className="absolute bottom-0 px-6 py-2 rounded-full bg-black/40 border border-[#e8e4d9]/20 backdrop-blur-md text-[#e8e4d9]/70 text-[10px] font-bold uppercase tracking-widest pointer-events-none z-30"
        >
          {dragHintText}
        </motion.div>

      </div>
    </div>
  );
}
