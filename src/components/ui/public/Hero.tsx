"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { motion, useSpring, Variants } from "framer-motion";

interface HeroProps {
  clubName: string;
  missionStatement: string | null;
  tenureYear: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  secondaryCtaText?: string | null;
  secondaryCtaLink?: string | null;
  photos?: { id: string; url: string; title: string | null }[];
}

const DEFAULT_PHOTOS = [
  { id: 'default-1', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1600', title: 'Community Fellowship' },
];

export function Hero({ clubName, missionStatement, tenureYear, ctaText, ctaLink, secondaryCtaText, secondaryCtaLink, photos = [] }: HeroProps) {
  const displayPhotos = photos.length > 0 ? photos : DEFAULT_PHOTOS;

  // Custom cursor logic
  const [isHovered, setIsHovered] = useState(false);
  const cursorX = useSpring(0, { damping: 25, stiffness: 120 });
  const cursorY = useSpring(0, { damping: 25, stiffness: 120 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 6); // offset by half the width of the cursor
      cursorY.set(e.clientY - 6);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
  };

  // Text animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <section 
      className="bg-[#FAF9F6] pt-48 md:pt-56 pb-16 relative overflow-hidden" 
      aria-label="Homepage hero"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle background glow for premium feel */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#F7A800]/10 to-transparent blur-[100px] pointer-events-none" />
      {/* Custom Orange Dot Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-[#F7A800] rounded-full pointer-events-none z-[100] mix-blend-difference"
        style={{ x: cursorX, y: cursorY }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
        transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
      />

      <MaxWidthWrapper>
        <motion.div 
          className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* Massive, Confident Typography */}
          <h1 className="text-5xl md:text-7xl lg:text-[100px] font-medium text-[#0B132B] leading-[1.0] tracking-tight">
            <motion.div variants={itemVariants} className="overflow-hidden">
              <span className="inline-block">{clubName}</span>
            </motion.div>
          </h1>

          {missionStatement && (
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl -mt-6"
            >
              {missionStatement}
            </motion.p>
          )}

          {(ctaText || secondaryCtaText) && (
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4">
              {ctaText && (
                <Link
                  href={ctaLink || "/join"}
                  className="inline-flex items-center justify-center bg-[#0B132B] hover:bg-[#F7A800] text-white hover:text-[#0B132B] font-black text-sm uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 hover:scale-[1.02] shadow-md"
                >
                  {ctaText}
                </Link>
              )}
              {secondaryCtaText && (
                <Link
                  href={secondaryCtaLink || "/partner"}
                  className="inline-flex items-center justify-center bg-transparent border border-[#0B132B]/20 hover:border-[#0B132B] text-[#0B132B] font-black text-sm uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300"
                >
                  {secondaryCtaText}
                </Link>
              )}
            </motion.div>
          )}

          {/* Minimalist Sub-metadata & Arrow */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center w-full pt-4 md:pt-8"
          >
            <button
              onClick={handleScrollDown}
              className="flex shrink-0 items-center justify-center w-14 h-14 rounded-full bg-white shadow-xl text-[#0B132B] hover:scale-110 hover:text-[#F7A800] transition-all duration-300"
              aria-label="Scroll down"
            >
              <ArrowDown className="w-6 h-6 animate-bounce" />
            </button>
          </motion.div>

        </motion.div>

        {/* Cinematic Below-The-Fold Image */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="mt-8 relative w-full aspect-[21/9] md:aspect-[24/9] rounded-3xl overflow-hidden shadow-2xl"
        >
          <Image
            src={displayPhotos[0].url}
            alt={displayPhotos[0].title || "Club highlight"}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>
      </MaxWidthWrapper>
    </section>
  );
}
