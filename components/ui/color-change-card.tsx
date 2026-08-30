import React from "react";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ColorChangeCardProps {
  heading: string;
  description: string;
  imgSrc: string;
}

interface ColorChangeCardsProps {
  cards: ColorChangeCardProps[];
}

export const ColorChangeCards = ({ cards }: ColorChangeCardsProps) => {
  return (
    <div className="w-full">
      <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
        {cards.map((card, index) => (
          <Card
            key={index}
            heading={card.heading}
            description={card.description}
            imgSrc={card.imgSrc}
          />
        ))}
      </div>
    </div>
  );
};

// --- Card Component ---
const Card = ({ heading, description, imgSrc }: ColorChangeCardProps) => {
  return (
    <motion.div
      transition={{ staggerChildren: 0.04 }}
      whileHover="hover"
      className="group relative h-80 md:h-96 w-full cursor-pointer overflow-hidden rounded-[2rem] bg-[#050504] border border-white/5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#c8b996]/40 hover:shadow-[0_0_40px_-10px_rgba(200,185,150,0.15)] hover:-translate-y-2"
    >
      <div
        className="absolute inset-0 saturate-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] scale-100 group-hover:scale-110 group-hover:saturate-[1.2]"
        style={{
          backgroundImage: `url(${imgSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
        }}
      />
      {/* Golden tint overlay on hover */}
      <div className="absolute inset-0 bg-[#c8b996] opacity-0 mix-blend-overlay transition-opacity duration-1000 group-hover:opacity-20" />
      
      {/* Rich gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-700 group-hover:opacity-70" />
      
      <div className="relative z-20 flex h-full flex-col justify-between p-8 md:p-10 text-stone-300 transition-colors duration-700">
        <ArrowRight className="ml-auto text-3xl opacity-30 transition-all duration-700 ease-out group-hover:-rotate-45 group-hover:opacity-100 group-hover:text-[#c8b996] group-hover:scale-125" />
        
        <div>
          <h4 className="flex mb-4">
            {heading.split("").map((letter, index) => (
              <AnimatedLetter letter={letter === " " ? "\u00A0" : letter} key={index} />
            ))}
          </h4>
          <p className="text-[0.95rem] md:text-[1.05rem] leading-[1.7] text-stone-400 group-hover:text-stone-100 transition-colors duration-700 font-light">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// --- AnimatedLetter Helper Component ---
interface AnimatedLetterProps {
  letter: string;
}

const letterVariants: Variants = {
  hover: {
    y: "-50%",
  },
};

const AnimatedLetter = ({ letter }: AnimatedLetterProps) => {
  return (
    <div className="inline-block h-[40px] md:h-[48px] overflow-hidden font-serif font-light tracking-wide text-3xl md:text-4xl text-white">
      <motion.span
        className="flex min-w-[6px] flex-col"
        style={{ y: "0%" }}
        variants={letterVariants}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span>{letter}</span>
        <span className="text-[#c8b996] drop-shadow-[0_0_8px_rgba(200,185,150,0.5)]">{letter}</span>
      </motion.span>
    </div>
  );
};
