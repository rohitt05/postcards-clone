"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useSpring, useMotionValue, motion, useTransform } from "framer-motion";
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
const CELL_W = CARD_W + COL_GAP;
const CELL_H = CARD_H + ROW_GAP;

// How many tiles to render around viewport (extra buffer)
const BUFFER = 3;

interface Props {
  activeCollection: Collection;
  onCollectionChange: (c: Collection) => void;
}

export default function InfiniteCanvas({ activeCollection, onCollectionChange }: Props) {
  const [selected, setSelected] = useState<(typeof postcards)[0] | null>(null);
  const [vpSize, setVpSize] = useState({ w: 1440, h: 900 });

  // Raw pan (no spring) for tile calculation
  const rawPanX = useRef(0);
  const rawPanY = useRef(0);

  // Spring pan for smooth rendering
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const springX = useSpring(panX, { stiffness: 80, damping: 18, mass: 1 });
  const springY = useSpring(panY, { stiffness: 80, damping: 18, mass: 1 });

  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Tick for vertical auto-scroll per column
  const tickRef = useRef(0);
  const autoOffsets = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const lastTime = useRef<number>(0);

  // Column speeds in px/sec
  const COL_SPEEDS = [28, 23, 32, 26, 29, 22, 31, 27, 24, 30];

  useEffect(() => {
    const update = () => {
      setVpSize({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    const cols = Math.ceil(vpSize.w / CELL_W) + BUFFER * 2 + 2;
    autoOffsets.current = new Array(cols).fill(0);
    lastTime.current = performance.now();

    const animate = (now: number) => {
      const dt = (now - lastTime.current) / 1000;
      lastTime.current = now;
      autoOffsets.current = autoOffsets.current.map((o, i) => o + COL_SPEEDS[i % COL_SPEEDS.length] * dt);
      tickRef.current += 1;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [vpSize.w]);

  // Global drag
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      isDragging.current = true;
      didDrag.current = false;
      lastPos.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag.current = true;
      rawPanX.current += dx;
      rawPanY.current += dy;
      lastPos.current = { x: e.clientX, y: e.clientY };
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

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 1)
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      rawPanX.current += dx;
      rawPanY.current += dy;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panX.set(rawPanX.current);
      panY.set(rawPanY.current);
    };
    window.addEventListener("touchstart", onStart);
    window.addEventListener("touchmove", onMove);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
    };
  }, [panX, panY]);

  const filtered = activeCollection === "all"
    ? postcards
    : postcards.filter(p => p.collection === activeCollection);

  const collections: Collection[] = ["all", "spring", "summer", "autumn", "winter"];

  // Compute visible tile grid based on current pan
  const colCount = Math.ceil(vpSize.w / CELL_W) + BUFFER * 2 + 2;
  const rowCount = Math.ceil(vpSize.h / CELL_H) + BUFFER * 2 + 2;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "#F0EDE6", cursor: isDragging.current ? "grabbing" : "grab" }}
    >
      {/* The infinite tiled world */}
      <InfiniteTileWorld
        springX={springX}
        springY={springY}
        rawPanX={rawPanX}
        rawPanY={rawPanY}
        autoOffsets={autoOffsets}
        tickRef={tickRef}
        colCount={colCount}
        rowCount={rowCount}
        filtered={filtered}
        didDrag={didDrag}
        onSelect={setSelected}
      />

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

// Separate component so it can use useAnimationFrame-style re-render
function InfiniteTileWorld({
  springX, springY, rawPanX, rawPanY,
  autoOffsets, tickRef, colCount, rowCount,
  filtered, didDrag, onSelect
}: any) {
  const [, forceRender] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const loop = () => {
      forceRender(t => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const px = rawPanX.current;
  const py = rawPanY.current;

  // Origin tile index (top-left visible tile)
  const startCol = Math.floor(-px / CELL_W) - BUFFER;
  const startRow = Math.floor(-py / CELL_H) - BUFFER;

  const tiles: JSX.Element[] = [];

  for (let ci = 0; ci < colCount; ci++) {
    const col = startCol + ci;
    const autoOffset = autoOffsets.current[((col % colCount) + colCount) % colCount] || 0;
    const stagger = col % 2 === 1 ? CELL_H / 2 : 0;

    for (let ri = 0; ri < rowCount; ri++) {
      const row = startRow + ri;

      // World position before pan
      const wx = col * CELL_W;
      // Vertical: combine row position + auto-scroll offset, mod by total rows so it wraps
      const totalRows = rowCount;
      const rawWY = row * CELL_H + stagger + autoOffset;
      // Wrap wy so cards loop seamlessly in the vertical tile space
      const wy = rawWY;

      // Screen position
      const sx = wx + px;
      const sy = wy + py;

      const seed = ((col * 31 + row * 17) & 0xffffff);
      const postcard = filtered[((Math.abs(col * 7 + row * 13)) % filtered.length)];
      const rotate = (seededRandom(seed) - 0.5) * 8;

      tiles.push(
        <div
          key={`${col}-${row}`}
          style={{
            position: "absolute",
            left: sx,
            top: sy,
            width: CARD_W,
            height: CARD_H,
            transform: `rotate(${rotate}deg)`,
            willChange: "transform",
          }}
          onClick={() => { if (!didDrag.current) onSelect(postcard); }}
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
      );
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {tiles}
    </div>
  );
}
