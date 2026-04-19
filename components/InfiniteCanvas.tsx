"use client";

import { useRef, useState, useEffect } from "react";
import { postcards, Collection, Postcard } from "@/data/postcards";
import PostcardModal from "./PostcardModal";

// ─── constants ───────────────────────────────────────────────────────────────
const CARD_W = 154;
const CARD_H = 210;
const GAP_X = 20;
const GAP_Y = 20;
const CELL_W = CARD_W + GAP_X;
const CELL_H = CARD_H + GAP_Y;
// How many extra tiles beyond viewport edge
const BUFFER = 2;
// Per-column downward drift speed (px/s)
const SPEEDS = [22, 18, 26, 20, 24, 17, 23, 21, 19, 25];

function seeded(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface Tile {
  key: string;
  screenX: number;
  screenY: number;
  rotate: number;
  card: Postcard;
}

interface Props {
  activeCollection: Collection;
  onCollectionChange: (c: Collection) => void;
}

export default function InfiniteCanvas({ activeCollection, onCollectionChange }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Postcard | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);

  // Spring physics state
  const pan = useRef({ x: 0, y: 0 });          // target (raw drag)
  const vel = useRef({ x: 0, y: 0 });          // spring velocity
  const disp = useRef({ x: 0, y: 0 });         // displayed position (spring follows pan)
  const colOffsets = useRef<number[]>(new Array(20).fill(0));
  const lastTime = useRef(0);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const rafId = useRef(0);
  const vpSize = useRef({ w: 1440, h: 900 });

  const filtered = activeCollection === "all"
    ? postcards
    : postcards.filter(p => p.collection === activeCollection);

  // ── compute tiles from current disp + colOffsets ─────────────────────────
  function buildTiles(dx: number, dy: number, offs: number[]) {
    const { w, h } = vpSize.current;
    const cols = Math.ceil(w / CELL_W) + BUFFER * 2 + 1;
    const rows = Math.ceil(h / CELL_H) + BUFFER * 2 + 1;

    const startCol = Math.floor(-dx / CELL_W) - BUFFER;
    const startRow = Math.floor(-dy / CELL_H) - BUFFER;

    const next: Tile[] = [];
    for (let ci = 0; ci < cols; ci++) {
      const col = startCol + ci;
      const colOff = offs[((col % 20) + 20) % 20];
      const stagger = (((col % 2) + 2) % 2) === 1 ? CELL_H * 0.5 : 0;

      for (let ri = 0; ri < rows; ri++) {
        const row = startRow + ri;

        // World Y with auto-scroll offset, then mod-wrapped so it tiles seamlessly
        const worldY = row * CELL_H + stagger + colOff;
        // Modulo wrap: snap worldY into the repeating tile band
        const tileRows = rows;
        const bandH = tileRows * CELL_H;
        const wrappedY = ((worldY % bandH) + bandH) % bandH + Math.floor(worldY / bandH) * bandH;

        const screenX = col * CELL_W + dx;
        const screenY = worldY + dy;

        const seed = (Math.abs(col * 2147483647 + row * 16807)) % 999983;
        const rotate = (seeded(seed) - 0.5) * 7;
        const cardIdx = Math.abs((col * 7 + row * 13) % filtered.length);
        const card = filtered[cardIdx];

        next.push({
          key: `${col}:${row}`,
          screenX,
          screenY,
          rotate,
          card,
        });
      }
    }
    setTiles(next);
  }

  // ── RAF loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const STIFFNESS = 0.08;
    const DAMPING   = 0.78;

    lastTime.current = performance.now();

    function loop(now: number) {
      const dt = Math.min((now - lastTime.current) / 1000, 0.05);
      lastTime.current = now;

      // Auto-scroll per column
      colOffsets.current = colOffsets.current.map((o, i) =>
        o + SPEEDS[i % SPEEDS.length] * dt
      );

      // Spring: disp chases pan
      if (!isDragging.current) {
        const fx = (pan.current.x - disp.current.x) * STIFFNESS;
        const fy = (pan.current.y - disp.current.y) * STIFFNESS;
        vel.current.x = vel.current.x * DAMPING + fx;
        vel.current.y = vel.current.y * DAMPING + fy;
        disp.current.x += vel.current.x;
        disp.current.y += vel.current.y;
      } else {
        disp.current.x = pan.current.x;
        disp.current.y = pan.current.y;
        vel.current.x = 0;
        vel.current.y = 0;
      }

      buildTiles(disp.current.x, disp.current.y, [...colOffsets.current]);
      rafId.current = requestAnimationFrame(loop);
    }

    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length, activeCollection]);

  // ── viewport size ─────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => { vpSize.current = { w: window.innerWidth, h: window.innerHeight }; };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── global pointer drag ───────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: MouseEvent) => {
      isDragging.current = true;
      didDrag.current = false;
      dragStart.current = { x: e.clientX - pan.current.x, y: e.clientY - pan.current.y };
    };
    const move = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const nx = e.clientX - dragStart.current.x;
      const ny = e.clientY - dragStart.current.y;
      if (Math.abs(nx - pan.current.x) > 3 || Math.abs(ny - pan.current.y) > 3)
        didDrag.current = true;
      pan.current = { x: nx, y: ny };
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

  // ── touch drag ────────────────────────────────────────────────────────────
  useEffect(() => {
    const start = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      isDragging.current = true;
      didDrag.current = false;
      dragStart.current = {
        x: e.touches[0].clientX - pan.current.x,
        y: e.touches[0].clientY - pan.current.y,
      };
    };
    const move = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      pan.current = {
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y,
      };
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

  const collections: Collection[] = ["all", "spring", "summer", "autumn", "winter"];

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{
        background: "#EDEAE3",
        cursor: isDragging.current ? "grabbing" : "grab",
      }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.09) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: `${disp.current.x % 32}px ${disp.current.y % 32}px`,
        }}
      />

      {/* Tile layer */}
      {tiles.map((t) => (
        <div
          key={t.key}
          onClick={() => { if (!didDrag.current) setSelected(t.card); }}
          style={{
            position: "absolute",
            left: t.screenX,
            top:  t.screenY,
            width:  CARD_W,
            height: CARD_H,
            transform: `rotate(${t.rotate}deg)`,
            willChange: "transform",
            cursor: "pointer",
            transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.transform = `rotate(0deg) scale(1.07)`;
            (e.currentTarget as HTMLDivElement).style.zIndex = "10";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.transform = `rotate(${t.rotate}deg) scale(1)`;
            (e.currentTarget as HTMLDivElement).style.zIndex = "";
          }}
        >
          {/* Card face */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 18,
              background: t.card.bg,
              boxShadow: [
                "0 1px 2px rgba(0,0,0,0.06)",
                "0 4px 12px rgba(0,0,0,0.08)",
                "0 12px 28px rgba(0,0,0,0.06)",
              ].join(","),
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "14px 14px 12px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Top stamp perforation row */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  width: 36,
                  height: 44,
                  border: `1.5px solid ${t.card.textColor}30`,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", color: `${t.card.textColor}40`, textTransform: "uppercase" }}>
                  MONO
                </span>
              </div>
            </div>

            {/* Bottom label */}
            <div>
              <p style={{
                margin: 0,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: t.card.textColor,
                opacity: 0.5,
                marginBottom: 2,
              }}>
                {t.card.collection} · {t.card.year}
              </p>
              <p style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: t.card.textColor,
                opacity: 0.85,
              }}>
                {t.card.title}
              </p>
            </div>

            {/* Watermark circle */}
            <div
              style={{
                position: "absolute",
                bottom: -30,
                left: -20,
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: `1.5px solid ${t.card.textColor}12`,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      ))}

      {/* Collection filter pill */}
      <div
        className="absolute bottom-6 left-1/2 z-30"
        style={{
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 9999,
          padding: "5px 6px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        {collections.map((c) => (
          <button
            key={c}
            onClick={() => onCollectionChange(c)}
            style={{
              padding: "5px 14px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
              background: activeCollection === c ? "#111" : "transparent",
              color: activeCollection === c ? "#fff" : "rgba(0,0,0,0.4)",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <PostcardModal card={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
