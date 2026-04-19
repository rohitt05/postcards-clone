"use client";

import { motion } from "framer-motion";
import { Postcard } from "@/data/postcards";

interface Props {
  card: Postcard;
  onClick: () => void;
  index: number;
}

export default function PostcardCard({ card, onClick, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div
        className="relative w-full aspect-[3/4] rounded-2xl flex flex-col justify-end shadow-md group-hover:shadow-xl transition-shadow duration-300 overflow-hidden"
        style={{ backgroundColor: card.bg }}
      >
        {/* Illustration */}
        {card.image && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-contain"
              style={{ opacity: 0.82 }}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}

        {/* Bottom gradient */}
        <div
          className="absolute inset-x-0 bottom-0 h-28 z-10"
          style={{
            background: `linear-gradient(to top, ${card.bg}ee 40%, ${card.bg}00)`,
          }}
        />

        {/* Stamp corner */}
        <div
          className="absolute top-4 right-4 w-10 h-12 border rounded-sm z-10 flex items-center justify-center"
          style={{ borderColor: card.textColor, opacity: 0.25 }}
        >
          <span className="text-[6px] font-bold tracking-widest" style={{ color: card.textColor }}>
            MONO
          </span>
        </div>

        {/* Text */}
        <div className="relative z-10 p-5">
          <p
            className="text-[10px] tracking-widest uppercase mb-1"
            style={{ color: card.textColor, opacity: 0.55 }}
          >
            {card.collection.replace("-", " ")}
          </p>
          <h3
            className="text-xl font-semibold leading-tight"
            style={{ color: card.textColor }}
          >
            {card.title}
          </h3>
        </div>
      </div>

      <div className="mt-3 px-1">
        <p className="text-xs text-muted tracking-wide">{card.artist}</p>
      </div>
    </motion.div>
  );
}
