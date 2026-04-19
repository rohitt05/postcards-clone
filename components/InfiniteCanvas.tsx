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

// Smaller cards
const CARD_W = 160;
const CARD_H = 215;
const COL_GAP = 90;
const ROW_GAP = 110;
const COLS = 7;
const ROWS = 6; // extra row so wrap is never visible

const colStep = CARD_W + COL_GAP;
const rowStep = CARD_H + ROW_GAP;
const totalW = COLS * colStep;
// Full cycle = all rows — this is key to fix the overlap glitch
const cycleH = ROWS * rowStep;

interface CardDef {
  id: string;
  row: number;
  x: number;
  baseY: number;
  rotate: number;
  imgIndex: number;
  driftSpeed: number;
}

function buildGrid(cards: Postcard[]): CardDef[] {
  const defs: CardDef[] = [];
  let idx = 0;
  for (let row = 0; row < ROWS; row++) {
    const xOffset = row % 2 === 1 ? colStep / 2 : 0;
    // Slightly different speed per row for parallax
    const driftSpeed = 16 + row * 3;
    for (let col = 0; col < COLS; col++) {
      const seed = idx * 7 + 13;
      defs.push({
        id: `card-${row}-${col}`,
        row,
        x: col * colStep + xOffset - totalW / 2,
        // Distribute rows evenly across full cycle, centered at 0
        baseY: row * rowStep - cycleH / 2,
        rotate: (seededRandom(seed) - 0.5) * 12,
        imgIndex: idx % CARD_IMAGES.length,
        driftSpeed,
      });
      idx++;
    }
  }
  return defs;
}

interface Props {
  activeCollection: Collection;
  onCollectionChange: (c: Collection) => void;
}

export default function InfiniteCanvas({ activeCollection, onCollectionChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Postcard | null>(null);
  const [zoom, setZoom] = useState(1);

  // Raw pan target
  const rawPanX = useRef(0);
  const rawPanY = useRef(0);

  // Springy motion values for pan — this gives the globe/elastic drag feel
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const springX = useSpring(panX, { stiffness: 120, damping: 22, mass: 0.8 });
  const springY = useSpring(panY, { stiffness: 120, damping: 22, mass: 0.8 });

  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);

  // Drift loop — accumulates over cycleH (full grid height) then resets
  const driftRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [driftY, setDriftY] = useState(0);

  useEffect(() => {
    const loop = (time: number) => {
      if (lastTimeRef.current) {
        const delta = (time - lastTimeRef.current) / 1000;
        driftRef.current += 20 * delta;
        // Wrap over full cycle so every row completes one full loop
        if (driftRef.current >= cycleH) driftRef.current -= cycleH;
        setDriftY(driftRef.current);
      }
      lastTimeRef.current = time;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const allPostcards = postcards;
  const grid = buildGrid(allPostcards);

  const filteredGrid = grid.filter((_, i) => {
    const card = allPostcards[i % allPostcards.length];
    return activeCollection === "all" || card.collection === activeCollection;
  });

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
      {/* Dot grid — uses spring values via inline style */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.09) 1px, transparent 1px)`,
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
          willChange: "transform",
        }}
      >
        {filteredGrid.map((def, i) => {
          const card = allPostcards[i % allPostcards.length];
          const imgSrc = CARD_IMAGES[def.imgIndex];

          // Each row drifts at its own speed (parallax)
          // Wrap Y within cycleH so cards loop seamlessly with NO overlap
          const rowDrift = (driftY * (def.driftSpeed / 20)) % cycleH;
          const rawY = def.baseY + rowDrift;
          // Correct wrap: mod by cycleH, offset by half so 0 is center
          const wrappedY = ((rawY + cycleH * 3) % cycleH) - cycleH / 2;

          return (
            <div
              key={def.id}
              className="postcard-item absolute"
              style={{
                transform: `translate(calc(${def.x}px - 50%), calc(${wrappedY}px - 50%)) rotate(${def.rotate}deg)`,
                willChange: "transform",
              }}
              onClick={() => setSelected(card)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div
                className="relative overflow-hidden select-none"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  borderRadius: 20,
                  border: "4px solid #111",
                  boxShadow: "4px 8px 24px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.08)",
                  background: "#fff",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "scale(1.09)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "6px 16px 40px rgba(0,0,0,0.26)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "4px 8px 24px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.08)";
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
                    height: 56,
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
  );
}
