"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { postcards, Collection, Postcard } from "@/data/postcards";
import PostcardModal from "./PostcardModal";

const CARD_W = 160;
const CARD_H  = 220;
const GAP_X   = 40;
const GAP_Y   = 40;
const CELL_W  = CARD_W + GAP_X;
const CELL_H  = CARD_H + GAP_Y;
const SPEEDS  = [-22, -18, -26, -20, -24, -17, -23, -21, -19, -25];

const MAX_TILT      = 14;
const WARP_STRENGTH = 0.045;
const WARP_DAMPING  = 0.72;

function seeded(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function mod(a: number, b: number) { return ((a % b) + b) % b; }
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

// Tiny SVG postage stamp inline — perforated border, coloured panel, wavy lines
function StampSVG({ color, bg }: { color: string; bg: string }) {
  return (
    <svg
      width="28" height="34"
      viewBox="0 0 28 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.18))" }}
    >
      {/* Perforated outer edge — dashed stroke gives the stamp tooth effect */}
      <rect
        x="1" y="1" width="26" height="32" rx="1.5"
        fill="white"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="0.5"
        strokeDasharray="1.6 1.4"
      />
      {/* Coloured inner panel */}
      <rect x="3.5" y="3.5" width="21" height="22" rx="1" fill={bg} />
      {/* Simple abstract art: two arcs and a dot */}
      <ellipse cx="14" cy="12" rx="5" ry="5" fill={color} opacity="0.35" />
      <ellipse cx="14" cy="12" rx="2.5" ry="2.5" fill={color} opacity="0.7" />
      <circle cx="14" cy="12" r="1" fill={color} />
      {/* Wavy cancellation lines at bottom */}
      <path d="M4.5 28.5 Q14 27 23.5 28.5" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" fill="none" />
      <path d="M4.5 30 Q14 28.5 23.5 30" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" fill="none" />
      {/* Denomination hint */}
      <text x="14" y="26.5" textAnchor="middle" fontSize="4" fontFamily="serif" fill={color} opacity="0.7" fontWeight="700">★</text>
    </svg>
  );
}

interface TileData {
  slotKey: string;
  left: number;
  top: number;
  rotate: number;
  card: Postcard;
  rx: number;
  ry: number;
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

  const menuOpenRef = useRef(false);
  useEffect(() => { menuOpenRef.current = menuOpen; }, [menuOpen]);

  const panX  = useRef(0); const panY  = useRef(0);
  const velX  = useRef(0); const velY  = useRef(0);
  const dispX = useRef(0); const dispY = useRef(0);

  const warpX    = useRef(0);
  const warpY    = useRef(0);
  const prevPanX = useRef(0);
  const prevPanY = useRef(0);

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

      const rawDragDX = panX.current - prevPanX.current;
      const rawDragDY = panY.current - prevPanY.current;
      prevPanX.current = panX.current;
      prevPanY.current = panY.current;

      const targetWX = isDragging.current ? rawDragDX * WARP_STRENGTH : 0;
      const targetWY = isDragging.current ? rawDragDY * WARP_STRENGTH : 0;
      warpX.current = warpX.current * WARP_DAMPING + targetWX * (1 - WARP_DAMPING);
      warpY.current = warpY.current * WARP_DAMPING + targetWY * (1 - WARP_DAMPING);

      const dx = dispX.current;
      const dy = dispY.current;
      const { w, h } = vp.current;
      const cx = w / 2;
      const cy = h / 2;

      const EXTRA    = 3;
      const startCol = Math.floor(-dx / CELL_W) - EXTRA;
      const startRow = Math.floor(-dy / CELL_H) - EXTRA;
      const colCount = Math.ceil(w / CELL_W) + EXTRA * 2 + 2;
      const rowCount = Math.ceil(h / CELL_H) + EXTRA * 2 + 2;

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

          const nx = clamp((left + CARD_W / 2 - cx) / (w / 2), -1, 1);
          const ny = clamp((top  + CARD_H / 2 - cy) / (h / 2), -1, 1);
          const distFactor = Math.sqrt(nx * nx + ny * ny);

          const rx = clamp(-warpY.current * MAX_TILT * (0.4 + 0.6 * distFactor) * (1 - nx * nx * 0.4), -MAX_TILT, MAX_TILT);
          const ry = clamp( warpX.current * MAX_TILT * (0.4 + 0.6 * distFactor) * (1 - ny * ny * 0.4), -MAX_TILT, MAX_TILT);

          const seed   = mod(worldCol * 2147483647 + worldRow * 16807, 999983);
          const rotate = (seeded(seed) - 0.5) * 7;
          const f      = filteredRef.current;
          const card   = f[mod(Math.abs(worldCol * 7 + worldRow * 13), f.length)];

          next.push({ slotKey: `${slotC}:${slotR}`, left, top, rotate, card, rx, ry });
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
      if (menuOpenRef.current) return;
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
      if (menuOpenRef.current) return;
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

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none"
      style={{
        background: "#EDE8DF",
        cursor: isDragging.current ? "grabbing" : "grab",
        perspective: "900px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.055) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Canvas tiles */}
      {tiles.map((t) => (
        <div
          key={t.slotKey}
          onClick={() => { if (!didDrag.current && !menuOpenRef.current) setSelected(t.card); }}
          style={{
            position:       "absolute",
            left:           t.left,
            top:            t.top,
            width:          CARD_W,
            height:         CARD_H,
            transform:      `rotateX(${t.rx}deg) rotateY(${t.ry}deg) rotate(${t.rotate}deg)`,
            willChange:     "left, top, transform",
            cursor:         "pointer",
            transformStyle: "preserve-3d",
            transition:     "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = `rotateX(${t.rx}deg) rotateY(${t.ry}deg) rotate(0deg) scale(1.08)`;
            el.style.zIndex    = "20";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = `rotateX(${t.rx}deg) rotateY(${t.ry}deg) rotate(${t.rotate}deg) scale(1)`;
            el.style.zIndex    = "";
          }}
        >
          {/* ── Physical postcard card ── */}
          <div style={{
            width: "100%", height: "100%",
            borderRadius: 10,
            background: "#FDFAF5",
            // Layered shadow: contact shadow + ambient lift
            boxShadow: [
              "0 1px 2px rgba(0,0,0,0.10)",
              "0 3px 8px rgba(0,0,0,0.10)",
              "0 10px 24px rgba(0,0,0,0.08)",
            ].join(","),
            display:        "flex",
            flexDirection:  "column",
            overflow:       "hidden",
            position:       "relative",
            // White mat / border padding
            padding:        "6px 6px 0 6px",
          }}>

            {/* ── Illustration / image area ── */}
            <div style={{
              flex:         "1 1 0",
              borderRadius: 5,
              overflow:     "hidden",
              background:   t.card.bg,
              position:     "relative",
              minHeight:    0,
            }}>
              {t.card.image ? (
                <img
                  src={t.card.image}
                  alt={t.card.title}
                  draggable={false}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                // Typography fallback card
                <div style={{
                  width: "100%", height: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 12,
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: t.card.textColor,
                    fontFamily: "Georgia, serif",
                    fontStyle: "italic",
                    textAlign: "center",
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                  }}>
                    {t.card.title}
                  </p>
                </div>
              )}

              {/* Paper texture shadow gradient at bottom of image */}
              <div style={{
                position:   "absolute",
                bottom:     0, left: 0, right: 0,
                height:     "42%",
                background: "linear-gradient(to top, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.10) 40%, transparent 100%)",
                pointerEvents: "none",
              }} />

              {/* Stamp — top right corner */}
              <div style={{
                position: "absolute",
                top: 6, right: 6,
                pointerEvents: "none",
                zIndex: 2,
              }}>
                <StampSVG color={t.card.textColor} bg={t.card.bg} />
              </div>
            </div>

            {/* ── Bottom white mat strip with title ── */}
            <div style={{
              padding:       "6px 6px 7px 6px",
              display:       "flex",
              flexDirection: "column",
              gap:           2,
              background:    "#FDFAF5",
            }}>
              <p style={{
                margin: 0,
                fontSize: 7.5,
                fontWeight: 700,
                letterSpacing: "0.13em",
                textTransform: "uppercase",
                color: "#B0A898",
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1,
              }}>
                {COLLECTION_LABELS[t.card.collection]}
              </p>
              <p style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                color: "#2A2018",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {t.card.title}
              </p>
            </div>

          </div>
        </div>
      ))}

      {/* ── BOTTOM BAR ── */}
      <div
        data-collection-menu
        className="absolute bottom-5 left-1/2 z-30"
        style={{ transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}
      >
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
                fontFamily: "system-ui, sans-serif",
                background: activeCollection === c ? "#1A1410" : "transparent",
                color: activeCollection === c ? "#F7F2EA" : "#8A7A70",
                transition: "all 0.18s ease",
              }}
            >
              {COLLECTION_LABELS[c]}
            </button>
          ))}
        </div>

        <div className="flex md:hidden" data-collection-menu>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
            style={{
              padding: "7px 20px",
              borderRadius: 9999, border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.06)",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#1A1410", fontFamily: "system-ui, sans-serif",
              transition: "all 0.2s ease",
            }}
          >
            {COLLECTION_LABELS[activeCollection]}
          </button>
        </div>
      </div>

      {/* MOBILE overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onTouchEnd={(e) => { e.stopPropagation(); setMenuOpen(false); }}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
            className="fixed inset-0 md:hidden z-40 flex flex-col items-center justify-center"
            style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", touchAction: "none" }}
          >
            <div
              onTouchEnd={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
            >
              {collections.map((c, i) => (
                <motion.button
                  key={c}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2, ease: "easeOut" }}
                  onTouchEnd={(e) => { e.stopPropagation(); onCollectionChange(c); setMenuOpen(false); }}
                  onClick={(e) => { e.stopPropagation(); onCollectionChange(c); setMenuOpen(false); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "10px 24px",
                    fontSize: activeCollection === c ? 26 : 22,
                    fontWeight: activeCollection === c ? 700 : 400,
                    color: activeCollection === c ? "#1A1410" : "#8A7A70",
                    fontFamily: "Georgia, serif", fontStyle: "italic",
                    letterSpacing: "0.01em", transition: "all 0.15s ease", lineHeight: 1.2,
                  }}
                >
                  {COLLECTION_LABELS[c]}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PostcardModal card={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
