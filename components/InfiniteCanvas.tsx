"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { postcards, Collection, Postcard } from "@/data/postcards";
import PostcardModal from "./PostcardModal";

const CARD_W = 154;
const CARD_H  = 210;
const GAP_X   = 48;
const GAP_Y   = 48;
const CELL_W  = CARD_W + GAP_X;
const CELL_H  = CARD_H + GAP_Y;
// Negative speeds → cards flow bottom-to-top
const SPEEDS  = [-22, -18, -26, -20, -24, -17, -23, -21, -19, -25];

function seeded(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function mod(a: number, b: number) { return ((a % b) + b) % b; }

interface TileData {
  slotKey: string;
  left: number;
  top: number;
  rotate: number;
  card: Postcard;
}

interface Props {
  activeCollection: Collection;
  onCollectionChange: (c: Collection) => void;
}

const COLLECTION_LABELS: Record<Collection, string> = {
  all: "All",
  love: "Love",
  "best-friends": "Best Friends",
  christmas: "Christmas",
  easter: "Easter",
  birthday: "Birthday",
  "long-distance": "Long Distance",
};

const collections: Collection[] = ["all", "love", "best-friends", "christmas", "easter", "birthday", "long-distance"];

export default function InfiniteCanvas({ activeCollection, onCollectionChange }: Props) {
  const [selected, setSelected] = useState<Postcard | null>(null);
  const [tiles, setTiles]       = useState<TileData[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const panX  = useRef(0); const panY  = useRef(0);
  const velX  = useRef(0); const velY  = useRef(0);
  const dispX = useRef(0); const dispY = useRef(0);
  const colOffsets  = useRef<Float64Array>(new Float64Array(40));
  const lastTime    = useRef(0);
  const isDragging  = useRef(false);
  const didDrag     = useRef(false);
  const dragAnchorX = useRef(0);
  const dragAnchorY = useRef(0);
  const rafId       = useRef(0);
  const vp          = useRef({ w: 1440, h: 900 });

  const filteredRef = useRef(postcards);
  filteredRef.current = activeCollection === "all"
    ? postcards
    : postcards.filter(p => p.collection === activeCollection);

  useEffect(() => {
    const update = () => { vp.current = { w: window.innerWidth, h: window.innerHeight }; };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const STIFFNESS = 0.09;
    const DAMPING   = 0.76;
    lastTime.current = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime.current) / 1000, 0.05);
      lastTime.current = now;

      for (let i = 0; i < 40; i++)
        colOffsets.current[i] += SPEEDS[i % SPEEDS.length] * dt;

      if (!isDragging.current) {
        velX.current = velX.current * DAMPING + (panX.current - dispX.current) * STIFFNESS;
        velY.current = velY.current * DAMPING + (panY.current - dispY.current) * STIFFNESS;
        dispX.current += velX.current;
        dispY.current += velY.current;
      } else {
        dispX.current = panX.current;
        dispY.current = panY.current;
        velX.current  = 0;
        velY.current  = 0;
      }

      const dx = dispX.current;
      const dy = dispY.current;
      const { w, h } = vp.current;

      const EXTRA = 3;
      const startCol = Math.floor(-dx / CELL_W) - EXTRA;
      const startRow = Math.floor(-dy / CELL_H) - EXTRA;
      const colCount  = Math.ceil(w / CELL_W) + EXTRA * 2 + 2;
      const rowCount  = Math.ceil(h / CELL_H) + EXTRA * 2 + 2;

      const next: TileData[] = [];

      for (let ci = 0; ci < colCount; ci++) {
        const worldCol = startCol + ci;
        const slotC    = mod(worldCol, colCount);
        const colOff   = colOffsets.current[mod(worldCol, 40)];
        const stagger  = mod(worldCol, 2) === 1 ? CELL_H * 0.5 : 0;

        for (let ri = 0; ri < rowCount; ri++) {
          const worldRow = startRow + ri;
          const slotR    = mod(worldRow, rowCount);

          const left = worldCol * CELL_W + dx;
          const top  = worldRow * CELL_H + stagger + colOff + dy;

          const seed    = mod(worldCol * 2147483647 + worldRow * 16807, 999983);
          const rotate  = (seeded(seed) - 0.5) * 7;
          const f       = filteredRef.current;
          const card    = f[mod(Math.abs(worldCol * 7 + worldRow * 13), f.length)];

          next.push({ slotKey: `${slotC}:${slotR}`, left, top, rotate, card });
        }
      }

      setTiles(next);
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCollection]);

  useEffect(() => {
    const down = (e: MouseEvent) => {
      isDragging.current  = true;
      didDrag.current     = false;
      dragAnchorX.current = e.clientX - panX.current;
      dragAnchorY.current = e.clientY - panY.current;
    };
    const move = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const nx = e.clientX - dragAnchorX.current;
      const ny = e.clientY - dragAnchorY.current;
      if (Math.abs(nx - panX.current) > 3 || Math.abs(ny - panY.current) > 3)
        didDrag.current = true;
      panX.current = nx;
      panY.current = ny;
    };
    const up = () => { isDragging.current = false; };
    window.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup",   up);
    return () => {
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup",   up);
    };
  }, []);

  useEffect(() => {
    const start = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      isDragging.current  = true;
      didDrag.current     = false;
      dragAnchorX.current = e.touches[0].clientX - panX.current;
      dragAnchorY.current = e.touches[0].clientY - panY.current;
    };
    const move = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      panX.current    = e.touches[0].clientX - dragAnchorX.current;
      panY.current    = e.touches[0].clientY - dragAnchorY.current;
      didDrag.current = true;
    };
    const end = () => { isDragging.current = false; };
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchmove",  move,  { passive: true });
    window.addEventListener("touchend",   end);
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchmove",  move);
      window.removeEventListener("touchend",   end);
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-collection-menu]')) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [menuOpen]);

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none"
      style={{ background: "#EDE8DF", cursor: isDragging.current ? "grabbing" : "grab" }}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Canvas tiles */}
      {tiles.map((t) => (
        <div
          key={t.slotKey}
          onClick={() => { if (!didDrag.current) setSelected(t.card); }}
          style={{
            position:   "absolute",
            left:       t.left,
            top:        t.top,
            width:      CARD_W,
            height:     CARD_H,
            transform:  `rotate(${t.rotate}deg)`,
            willChange: "left, top, transform",
            cursor:     "pointer",
            transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) scale(1.07)";
            (e.currentTarget as HTMLDivElement).style.zIndex    = "20";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.transform = `rotate(${t.rotate}deg) scale(1)`;
            (e.currentTarget as HTMLDivElement).style.zIndex    = "";
          }}
        >
          <div style={{
            width: "100%", height: "100%",
            borderRadius: 18,
            background: t.card.bg,
            boxShadow: "0 1px 2px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.09),0 12px 28px rgba(0,0,0,0.05)",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            padding: "14px 14px 12px",
            overflow: "hidden", position: "relative",
          }}>
            <div />
            <div>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: t.card.textColor, opacity: 0.45, marginBottom: 2, fontFamily: "var(--font-dm-sans)" }}>
                {COLLECTION_LABELS[t.card.collection]}
              </p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.card.textColor, opacity: 0.85, fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>
                {t.card.title}
              </p>
            </div>
            <div style={{
              position: "absolute", bottom: -28, left: -18,
              width: 110, height: 110, borderRadius: "50%",
              border: `1.5px solid ${t.card.textColor}10`,
              pointerEvents: "none",
            }} />
          </div>
        </div>
      ))}

      {/* ── BOTTOM BAR ── */}
      <div
        data-collection-menu
        className="absolute bottom-5 left-1/2 z-30"
        style={{ transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}
      >
        {/* DESKTOP: full pill tabs (hidden on mobile) */}
        <div
          className="hidden md:flex items-center gap-1"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            borderRadius: 9999, padding: "5px 6px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.1),0 0 0 1px rgba(0,0,0,0.05)",
          }}
        >
          {collections.map((c) => (
            <button
              key={c}
              onClick={(e) => { e.stopPropagation(); onCollectionChange(c); }}
              style={{
                padding: "5px 14px", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                borderRadius: 9999, border: "none", cursor: "pointer",
                fontFamily: "var(--font-dm-sans)",
                background: activeCollection === c ? "#1A1410" : "transparent",
                color: activeCollection === c ? "#F7F2EA" : "#8A7A70",
                transition: "all 0.18s ease",
              }}
            >
              {COLLECTION_LABELS[c]}
            </button>
          ))}
        </div>

        {/* MOBILE: single pill button that opens a full-screen overlay */}
        <div className="flex md:hidden" data-collection-menu>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
            style={{
              padding: "7px 20px",
              borderRadius: 9999,
              border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.06)",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#1A1410",
              fontFamily: "var(--font-dm-sans)",
              transition: "all 0.2s ease",
            }}
          >
            {COLLECTION_LABELS[activeCollection]}
          </button>
        </div>
      </div>

      {/* MOBILE: full-screen soft overlay with collection names */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 md:hidden z-40 flex flex-col items-center justify-center"
            style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
            >
              {collections.map((c, i) => (
                <motion.button
                  key={c}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2, ease: "easeOut" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCollectionChange(c);
                    setMenuOpen(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "10px 24px",
                    fontSize: activeCollection === c ? 26 : 22,
                    fontWeight: activeCollection === c ? 700 : 400,
                    color: activeCollection === c ? "#1A1410" : "#8A7A70",
                    fontFamily: "var(--font-cormorant)",
                    fontStyle: "italic",
                    letterSpacing: "0.01em",
                    transition: "all 0.15s ease",
                    lineHeight: 1.2,
                  }}
                >
                  {COLLECTION_LABELS[c]}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <PostcardModal card={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
