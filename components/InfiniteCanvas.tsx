"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useSpring, useMotionValue, motion } from "framer-motion";
import { postcards, Postcard, Collection } from "@/data/postcards";
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

const CARD_W = 155;
const CARD_H = 205;
const COL_GAP = 85;
const ROW_GAP = 90;
const COLS = 8;
// We render 2 copies of each row stacked vertically so CSS loop is seamless
const ROWS = 5;

const colStep = CARD_W + COL_GAP;
const rowStep = CARD_H + ROW_GAP;
// Total height of one full set of rows
const setH = ROWS * rowStep;
const totalW = COLS * colStep;

interface CardDef {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number; // fixed Y within its copy
  rotate: number;
  imgIndex: number;
}

// Build TWO copies of the grid stacked vertically (copy 0 and copy 1)
// CSS animation moves the whole strip from 0 to -setH, then loops
function buildGrid(cards: Postcard[]): CardDef[] {
  const defs: CardDef[] = [];
  let idx = 0;
  for (let copy = 0; copy < 2; copy++) {
    for (let row = 0; row < ROWS; row++) {
      const xOffset = row % 2 === 1 ? colStep / 2 : 0;
      for (let col = 0; col < COLS; col++) {
        const seed = (row * COLS + col) * 7 + 13;
        defs.push({
          id: `card-${copy}-${row}-${col}`,
          row,
          col,
          x: col * colStep + xOffset - totalW / 2,
          y: (copy * ROWS + row) * rowStep - setH / 2,
          rotate: (seededRandom(seed) - 0.5) * 12,
          imgIndex: idx % CARD_IMAGES.length,
        });
        idx++;
      }
    }
  }
  return defs;
}

// Per-row animation durations for parallax feel (slower = top, faster = bottom)
const ROW_DURATIONS = [38, 34, 30, 26, 22]; // seconds per row

interface Props {
  activeCollection: Collection;
  onCollectionChange: (c: Collection) => void;
}

export default function InfiniteCanvas({ activeCollection, onCollectionChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Postcard | null>(null);
  const [zoom, setZoom] = useState(1);

  // Springy pan
  const rawPanX = useRef(0);
  const rawPanY = useRef(0);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const springX = useSpring(panX, { stiffness: 120, damping: 22, mass: 0.8 });
  const springY = useSpring(panY, { stiffness: 120, damping: 22, mass: 0.8 });

  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);

  const allPostcards = postcards;
  const grid = buildGrid(allPostcards);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".postcard-item")) return;
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    rawPanX.current += dx;
    rawPanY.current += dy;
    panX.set(rawPanX.current);
    panY.set(rawPanY.current);
  }, [panX, panY]);

  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(2.5, Math.max(0.25, z - e.deltaY * 0.001)));
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
    if (e.touches.length === 1 && lastTouch.current) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      rawPanX.current += dx;
      rawPanY.current += dy;
      panX.set(rawPanX.current);
      panY.set(rawPanY.current);
    }
  }, [panX, panY]);

  const onTouchEnd = useCallback(() => { lastTouch.current = null; }, []);

  const collections: Collection[] = ["all", "spring", "summer", "autumn", "winter"];

  // Group cards by row for independent CSS animation per row
  const rowGroups: { [row: number]: CardDef[] } = {};
  for (let r = 0; r < ROWS; r++) rowGroups[r] = [];
  grid.forEach((def) => {
    if (activeCollection !== "all") {
      const card = allPostcards[(def.row * COLS + def.col) % allPostcards.length];
      if (card.collection !== activeCollection) return;
    }
    rowGroups[def.row].push(def);
  });

  return (
    <>
      {/* Inject CSS keyframes for each row drift speed */}
      <style>{`
        @keyframes driftDown {
          from { transform: translateY(0); }
          to   { transform: translateY(-${setH}px); }
        }
        ${ROW_DURATIONS.map((dur, r) => `
          .drift-row-${r} {
            animation: driftDown ${dur}s linear infinite;
          }
        `).join("")}
        .postcard-inner {
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease;
        }
        .postcard-inner:hover {
          transform: scale(1.09) !important;
          box-shadow: 6px 16px 40px rgba(0,0,0,0.26) !important;
          z-index: 999;
        }
      `}</style>

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
            backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)`,
            backgroundSize: `${36 * zoom}px ${36 * zoom}px`,
          }}
        />

        {/* World — spring pan + zoom */}
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
          {/* Each row is its own independently animated strip */}
          {Array.from({ length: ROWS }, (_, row) => {
            const cards = rowGroups[row];
            if (!cards || cards.length === 0) return null;
            const xOffset = row % 2 === 1 ? colStep / 2 : 0;

            return (
              <div
                key={`row-strip-${row}`}
                className={`drift-row-${row}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 0,
                  height: 0,
                  // Stagger start so rows don't all begin at same position
                  animationDelay: `-${row * (ROW_DURATIONS[row] / ROWS)}s`,
                }}
              >
                {/* Render 2 copies of this row so the loop is seamless */}
                {[0, 1].map((copy) =>
                  Array.from({ length: COLS }, (_, col) => {
                    const cardIdx = (row * COLS + col) % allPostcards.length;
                    const card = allPostcards[cardIdx];
                    const imgSrc = CARD_IMAGES[(row * COLS + col) % CARD_IMAGES.length];
                    const seed = (row * COLS + col) * 7 + 13;
                    const rotate = (seededRandom(seed) - 0.5) * 12;
                    const x = col * colStep + xOffset - totalW / 2;
                    // copy 0: rows at normal position, copy 1: rows shifted up by setH
                    const y = (copy * ROWS + row) * rowStep - setH;

                    return (
                      <div
                        key={`${copy}-${row}-${col}`}
                        className="postcard-item absolute"
                        style={{
                          transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%)) rotate(${rotate}deg)`,
                          width: CARD_W,
                          height: CARD_H,
                        }}
                        onClick={() => setSelected(card)}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <div
                          className="postcard-inner relative overflow-hidden select-none"
                          style={{
                            width: CARD_W,
                            height: CARD_H,
                            borderRadius: 20,
                            border: "4px solid #111",
                            boxShadow: "4px 8px 24px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.08)",
                            background: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          <img
                            src={imgSrc}
                            alt={card.title}
                            width={CARD_W}
                            height={CARD_H}
                            loading="lazy"
                            draggable={false}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                              pointerEvents: "none",
                            }}
                          />
                          <div
                            className="absolute bottom-0 left-0 right-0 pointer-events-none"
                            style={{
                              height: 52,
                              background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
                            }}
                          />
                          <div className="absolute bottom-2.5 left-3">
                            <p
                              className="text-white text-[10px] font-semibold tracking-wide leading-tight"
                              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                            >
                              {card.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Floating collection filter */}
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

        {/* Zoom level */}
        <div className="absolute bottom-6 right-6 z-30 pointer-events-none">
          <span className="text-[10px] text-[#111]/30 tracking-widest uppercase font-medium">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <PostcardModal card={selected} onClose={() => setSelected(null)} />
      </div>
    </>
  );
}
