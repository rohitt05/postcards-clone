"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { postcards, Postcard, Collection } from "@/data/postcards";
import PostcardModal from "./PostcardModal";

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface CardLayout {
  id: string;
  x: number;
  y: number;
  rotate: number;
  floatX: number;
  floatY: number;
  floatDuration: number;
  floatDelay: number;
  scale: number;
}

function generateLayout(cards: Postcard[]): CardLayout[] {
  return cards.map((card, i) => ({
    id: card.id,
    x: (seededRandom(i * 3) - 0.5) * 3200,
    y: (seededRandom(i * 7) - 0.5) * 2400,
    rotate: (seededRandom(i * 11) - 0.5) * 28,
    floatX: (seededRandom(i * 13) - 0.5) * 18,
    floatY: (seededRandom(i * 17) - 0.5) * 18,
    floatDuration: 4 + seededRandom(i * 19) * 4,
    floatDelay: seededRandom(i * 23) * -5,
    scale: 0.85 + seededRandom(i * 29) * 0.3,
  }));
}

const REPEAT = 6;
const allCards: Postcard[] = Array.from({ length: REPEAT }, (_, r) =>
  postcards.map((c) => ({ ...c, id: `${c.id}-${r}` }))
).flat();

const layout = generateLayout(allCards);

interface Props {
  activeCollection: Collection;
}

export default function InfiniteCanvas({ activeCollection }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<Postcard | null>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const filteredLayout = layout.filter((l) => {
    const baseId = l.id.split("-").slice(0, 2).join("-");
    const card = postcards.find((c) => c.id === baseId);
    if (!card) return true;
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
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(2.5, Math.max(0.3, z - e.deltaY * 0.001)));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const getCardForLayout = (l: CardLayout) => {
    const baseId = l.id.split("-").slice(0, 2).join("-");
    return postcards.find((c) => c.id === baseId) ?? postcards[0];
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-paper"
      style={{
        height: "calc(100vh - 112px)",
        cursor: isDragging.current ? "grabbing" : "grab",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #1A1A1A18 1.2px, transparent 1.2px)`,
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
          backgroundPosition: `${pan.x % (40 * zoom)}px ${pan.y % (40 * zoom)}px`,
        }}
      />

      {/* World canvas */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 0,
          height: 0,
          willChange: "transform",
        }}
      >
        {filteredLayout.map((l) => {
          const card = getCardForLayout(l);
          return (
            <motion.div
              key={l.id}
              className="postcard-item absolute"
              style={{
                x: l.x,
                y: l.y,
                rotate: l.rotate,
                scale: l.scale,
                translateX: "-50%",
                translateY: "-50%",
              }}
              animate={{
                x: [
                  l.x + l.floatX,
                  l.x - l.floatX,
                  l.x + l.floatX * 0.5,
                  l.x + l.floatX,
                ],
                y: [
                  l.y + l.floatY,
                  l.y - l.floatY * 0.6,
                  l.y + l.floatY,
                  l.y + l.floatY,
                ],
                rotate: [l.rotate, l.rotate + 2, l.rotate - 1.5, l.rotate],
              }}
              transition={{
                duration: l.floatDuration,
                delay: l.floatDelay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{
                scale: l.scale * 1.14,
                rotate: 0,
                zIndex: 50,
                transition: { duration: 0.2 },
              }}
              onClick={() => setSelected(card)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div
                className="w-40 h-56 rounded-2xl shadow-lg cursor-pointer flex flex-col justify-end p-4 relative overflow-hidden select-none"
                style={{
                  backgroundColor: card.bg,
                  border: "3px solid #1A1A1A",
                }}
              >
                {/* Inner gloss */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ boxShadow: "inset 0 0 0 5px rgba(255,255,255,0.12)" }}
                />

                {/* Stamp box top-right */}
                <div
                  className="absolute top-3 right-3 w-9 h-11 border-2 rounded flex items-center justify-center opacity-40"
                  style={{ borderColor: card.textColor }}
                >
                  <span
                    className="text-[6px] font-bold tracking-widest"
                    style={{ color: card.textColor }}
                  >
                    MONO
                  </span>
                </div>

                {/* Address lines */}
                <div className="absolute top-3 left-3 space-y-[3px] opacity-15">
                  {[56, 40, 48].map((w, i) => (
                    <div
                      key={i}
                      className="h-[2px] rounded-full"
                      style={{ width: `${w}px`, backgroundColor: card.textColor }}
                    />
                  ))}
                </div>

                {/* Collection + title */}
                <div>
                  <p
                    className="text-[8px] tracking-widest uppercase opacity-50 mb-0.5"
                    style={{ color: card.textColor }}
                  >
                    {card.collection}
                  </p>
                  <p
                    className="text-sm font-bold leading-tight"
                    style={{ color: card.textColor }}
                  >
                    {card.title}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hint */}
      <div className="absolute bottom-5 right-5 pointer-events-none">
        <span className="text-[10px] text-muted tracking-widest uppercase bg-paper/80 px-3 py-1.5 rounded-full border border-ink/10">
          Scroll to zoom · Drag to pan
        </span>
      </div>

      {/* Zoom level */}
      <div className="absolute bottom-5 left-5 pointer-events-none">
        <span className="text-[10px] text-muted tracking-widest uppercase bg-paper/80 px-3 py-1.5 rounded-full border border-ink/10">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <PostcardModal card={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
