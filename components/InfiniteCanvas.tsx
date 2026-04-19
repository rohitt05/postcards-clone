"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useSpring, useMotionValue, motion } from "framer-motion";
import { postcards, Collection } from "@/data/postcards";
import PostcardModal from "./PostcardModal";

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const CARD_W = 150;
const CARD_H = 200;
const COL_GAP = 24;
const ROW_GAP = 24;
const COLS = 7;
const ROWS_PER_SET = 20;

const colStep = CARD_W + COL_GAP;
const rowStep = CARD_H + ROW_GAP;
const setH = ROWS_PER_SET * rowStep;
const totalW = COLS * colStep;

const COL_SPEEDS = [90, 105, 85, 100, 95, 110, 88];

interface Props {
  activeCollection: Collection;
  onCollectionChange: (c: Collection) => void;
}

export default function InfiniteCanvas({ activeCollection, onCollectionChange }: Props) {
  const [selected, setSelected] = useState<(typeof postcards)[0] | null>(null);

  // Global springy pan — no restrictions
  const rawPanX = useRef(0);
  const rawPanY = useRef(0);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const springX = useSpring(panX, { stiffness: 80, damping: 18, mass: 1 });
  const springY = useSpring(panY, { stiffness: 80, damping: 18, mass: 1 });

  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);

  // Global mouse listeners on window so drag works everywhere
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      isDragging.current = true;
      didDrag.current = false;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag.current = true;
      rawPanX.current += dx;
      rawPanY.current += dy;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      panX.set(rawPanX.current);
      panY.set(rawPanY.current);
    };
    const onUp = () => { isDragging.current = false; };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [panX, panY]);

  // Global touch listeners
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 1)
        lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || !lastTouch.current) return;
      rawPanX.current += e.touches[0].clientX - lastTouch.current.x;
      rawPanY.current += e.touches[0].clientY - lastTouch.current.y;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panX.set(rawPanX.current);
      panY.set(rawPanY.current);
    };
    const onEnd = () => { lastTouch.current = null; };

    window.addEventListener("touchstart", onStart);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [panX, panY]);

  const collections: Collection[] = ["all", "spring", "summer", "autumn", "winter"];

  const filtered = activeCollection === "all"
    ? postcards
    : postcards.filter(p => p.collection === activeCollection);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "#F0EDE6", cursor: isDragging.current ? "grabbing" : "grab" }}
    >
      {/* Springy canvas */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 0,
          height: 0,
        }}
      >
        {Array.from({ length: COLS }, (_, col) => {
          const duration = COL_SPEEDS[col];
          const x = col * colStep - totalW / 2 + CARD_W / 2;
          const yOffset = col % 2 === 1 ? -rowStep / 2 : 0;

          const colCards = Array.from({ length: ROWS_PER_SET * 2 }, (_, i) => {
            const postcard = filtered[(col * 7 + i * 3) % filtered.length];
            const seed = col * 100 + i;
            return {
              postcard,
              rotate: (seededRandom(seed) - 0.5) * 8,
              y: i * rowStep + yOffset - setH / 2,
            };
          });

          return (
            <motion.div
              key={`col-${col}`}
              style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0 }}
              animate={{ y: [0, setH] }}
              transition={{
                duration,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              {colCards.map(({ postcard, rotate, y }, i) => (
                <div
                  key={i}
                  className="postcard-item absolute"
                  style={{
                    transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%)) rotate(${rotate}deg)`,
                    width: CARD_W,
                    height: CARD_H,
                  }}
                  onClick={() => {
                    if (!didDrag.current) setSelected(postcard);
                  }}
                >
                  <div
                    style={{
                      width: CARD_W,
                      height: CARD_H,
                      borderRadius: 16,
                      background: postcard.bg,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
                      cursor: "pointer",
                      transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: 12,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = "scale(1.06)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(0,0,0,0.16)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)";
                    }}
                  >
                    <p style={{
                      color: postcard.textColor,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      opacity: 0.65,
                      margin: 0,
                    }}>
                      {postcard.title}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          );
        })}
      </motion.div>

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
