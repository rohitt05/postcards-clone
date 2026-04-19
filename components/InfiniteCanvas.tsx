"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useSpring, useMotionValue, motion } from "framer-motion";
import { postcards, Collection } from "@/data/postcards";
import PostcardModal from "./PostcardModal";

const CARD_IMAGES = [
  "https://picsum.photos/seed/spring1/320/420",
  "https://picsum.photos/seed/petal/320/420",
  "https://picsum.photos/seed/blossom/320/420",
  "https://picsum.photos/seed/azure/320/420",
  "https://picsum.photos/seed/solstice/320/420",
  "https://picsum.photos/seed/ember/320/420",
  "https://picsum.photos/seed/harvest1/320/420",
  "https://picsum.photos/seed/frost1/320/420",
  "https://picsum.photos/seed/solitude1/320/420",
];

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const CARD_W = 180;
const CARD_H = 240;
const COL_GAP = 140;
const ROW_GAP = 160;
const COLS = 5;
const ROWS = 3;

const colStep = CARD_W + COL_GAP;
const rowStep = CARD_H + ROW_GAP;
const totalW = COLS * colStep;

const ROW_SPEEDS = [32, 38, 28];

interface Props {
  activeCollection: Collection;
  onCollectionChange: (c: Collection) => void;
}

export default function InfiniteCanvas({ activeCollection, onCollectionChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<(typeof postcards)[0] | null>(null);
  const [zoom, setZoom] = useState(1);

  const rawPanX = useRef(0);
  const rawPanY = useRef(0);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const springX = useSpring(panX, { stiffness: 100, damping: 20, mass: 0.8 });
  const springY = useSpring(panY, { stiffness: 100, damping: 20, mass: 0.8 });

  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".postcard-item")) return;
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    rawPanX.current += e.clientX - lastMouse.current.x;
    rawPanY.current += e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    panX.set(rawPanX.current);
    panY.set(rawPanY.current);
  }, [panX, panY]);

  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(2, Math.max(0.3, z - e.deltaY * 0.001)));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1)
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1 || !lastTouch.current) return;
    rawPanX.current += e.touches[0].clientX - lastTouch.current.x;
    rawPanY.current += e.touches[0].clientY - lastTouch.current.y;
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    panX.set(rawPanX.current);
    panY.set(rawPanY.current);
  }, [panX, panY]);

  const onTouchEnd = useCallback(() => { lastTouch.current = null; }, []);

  const collections: Collection[] = ["all", "spring", "summer", "autumn", "winter"];

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ background: "#EDEAE3", cursor: isDragging.current ? "grabbing" : "grab" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
        }}
      />

      {/* World */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          scale: zoom,
          transformOrigin: "center center",
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 0,
          height: 0,
        }}
      >
        {Array.from({ length: ROWS }, (_, row) => {
          const xOffset = row % 2 === 1 ? colStep / 2 : 0;
          const duration = ROW_SPEEDS[row];
          const rowBaseY = (row - (ROWS - 1) / 2) * rowStep;

          const rowCards = Array.from({ length: COLS }, (_, col) => {
            const idx = row * COLS + col;
            const postcard = postcards[idx % postcards.length];
            if (activeCollection !== "all" && postcard.collection !== activeCollection) return null;
            const seed = idx * 7 + 13;
            return {
              col,
              postcard,
              img: CARD_IMAGES[idx % CARD_IMAGES.length],
              rotate: (seededRandom(seed) - 0.5) * 10,
            };
          }).filter(Boolean) as { col: number; postcard: typeof postcards[0]; img: string; rotate: number }[];

          if (rowCards.length === 0) return null;

          return (
            <motion.div
              key={`row-${row}`}
              style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0 }}
              animate={{ y: [0, -rowStep] }}
              transition={{
                duration,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              {[0, 1].map(copy =>
                rowCards.map(({ col, postcard, img, rotate }) => {
                  const x = col * colStep + xOffset - totalW / 2;
                  const y = rowBaseY + copy * rowStep;
                  return (
                    <div
                      key={`${copy}-${col}`}
                      className="postcard-item absolute"
                      style={{
                        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%)) rotate(${rotate}deg)`,
                        width: CARD_W,
                        height: CARD_H,
                      }}
                      onMouseDown={e => e.stopPropagation()}
                      onClick={() => setSelected(postcard)}
                    >
                      <div
                        style={{
                          width: CARD_W,
                          height: CARD_H,
                          borderRadius: 22,
                          border: "4px solid #111",
                          overflow: "hidden",
                          boxShadow: "4px 8px 28px rgba(0,0,0,0.15)",
                          background: "#fff",
                          cursor: "pointer",
                          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLDivElement).style.transform = "scale(1.07)";
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "6px 18px 44px rgba(0,0,0,0.22)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "4px 8px 28px rgba(0,0,0,0.15)";
                        }}
                      >
                        <img
                          src={img}
                          alt={postcard.title}
                          draggable={false}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                        />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 56, background: "linear-gradient(to top, rgba(0,0,0,0.48), transparent)", pointerEvents: "none" }} />
                        <p style={{ position: "absolute", bottom: 11, left: 13, color: "#fff", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textShadow: "0 1px 3px rgba(0,0,0,0.5)", margin: 0 }}>
                          {postcard.title}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
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
