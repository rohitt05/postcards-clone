"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { postcards, Collection } from "@/data/postcards";
import PostcardModal from "./PostcardModal";

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const CARD_W = 200;
const CARD_H = 260;
const GAP = 24;
const CARDS_PER_ROW = 5;
const ROWS = 3;

// total width of one full set of cards in a row
const ROW_W = CARDS_PER_ROW * (CARD_W + GAP);
const ROW_SPEEDS = [22, 28, 20]; // seconds, alternating direction feel

interface Props {
  activeCollection: Collection;
  onCollectionChange: (c: Collection) => void;
}

export default function InfiniteCanvas({ activeCollection, onCollectionChange }: Props) {
  const [selected, setSelected] = useState<(typeof postcards)[0] | null>(null);

  const collections: Collection[] = ["all", "spring", "summer", "autumn", "winter"];

  const filtered = activeCollection === "all"
    ? postcards
    : postcards.filter(p => p.collection === activeCollection);

  // Pad each row to have enough cards to fill CARDS_PER_ROW
  const getRowCards = (row: number) => {
    const start = (row * 3) % filtered.length;
    const cards = [];
    for (let i = 0; i < CARDS_PER_ROW; i++) {
      cards.push(filtered[(start + i) % filtered.length]);
    }
    return cards;
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "#F0EDE6" }}
    >
      {/* Rows */}
      <div
        className="absolute inset-0 flex flex-col justify-center"
        style={{ gap: 32 }}
      >
        {Array.from({ length: ROWS }, (_, row) => {
          const rowCards = getRowCards(row);
          const duration = ROW_SPEEDS[row];
          // odd rows go right-to-left (negative), even go left-to-right
          const dir = row % 2 === 0 ? -1 : 1;

          return (
            <div key={row} style={{ overflow: "hidden", width: "100%", height: CARD_H }}>
              <motion.div
                style={{ display: "flex", gap: GAP, width: ROW_W * 2 }}
                animate={{ x: dir === -1 ? [0, -ROW_W] : [-ROW_W, 0] }}
                transition={{
                  duration,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              >
                {/* 2 copies for seamless loop */}
                {[0, 1].map(copy =>
                  rowCards.map((postcard, i) => {
                    const seed = row * 100 + i;
                    const rotate = (seededRandom(seed) - 0.5) * 8;
                    return (
                      <div
                        key={`${copy}-${i}`}
                        onClick={() => setSelected(postcard)}
                        style={{
                          width: CARD_W,
                          height: CARD_H,
                          flexShrink: 0,
                          borderRadius: 18,
                          background: postcard.bg,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
                          cursor: "pointer",
                          transform: `rotate(${rotate}deg)`,
                          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
                          display: "flex",
                          alignItems: "flex-end",
                          padding: 14,
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLDivElement).style.transform = `rotate(${rotate}deg) scale(1.06)`;
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(0,0,0,0.16)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.transform = `rotate(${rotate}deg) scale(1)`;
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)";
                        }}
                      >
                        <p style={{
                          color: postcard.textColor,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          opacity: 0.65,
                          margin: 0,
                        }}>
                          {postcard.title}
                        </p>
                      </div>
                    );
                  })
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Collection filter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-white/85 backdrop-blur-md rounded-full px-2 py-1.5 shadow-lg border border-black/8">
        {collections.map((c) => (
          <button
            key={c}
            onClick={() => onCollectionChange(c)}
            className={`px-3 py-1 text-[11px] font-semibold tracking-widest uppercase rounded-full transition-all duration-200 ${
              activeCollection === c ? "bg-[#111] text-white" : "text-[#111]/50 hover:text-[#111]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <PostcardModal card={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
