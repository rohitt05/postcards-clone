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
        className="relative w-full aspect-[3/4] rounded-2xl flex flex-col justify-end p-6 shadow-md group-hover:shadow-xl transition-shadow duration-300 overflow-hidden"
        style={{ backgroundColor: card.bg }}
      >
        <div
          className="absolute top-5 right-5 w-2 h-2 rounded-full opacity-40"
          style={{ backgroundColor: card.textColor }}
        />

        <div
          className="absolute top-4 right-4 w-10 h-12 border rounded-sm opacity-20 flex items-center justify-center"
          style={{ borderColor: card.textColor }}
        >
          <span className="text-[6px]" style={{ color: card.textColor }}>
            MONO
          </span>
        </div>

        <div>
          <p
            className="text-[10px] tracking-widest uppercase mb-1 opacity-60"
            style={{ color: card.textColor }}
          >
            {card.collection}
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
