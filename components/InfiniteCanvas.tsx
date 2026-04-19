"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
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

interface CardLayout {
  id: string;
  x: number;
  y: number;
  rotate: number;
  floatX: number;
  floatY: number;
  floatDuration: number;
  floatDelay: number;
  imgIndex: number;
}

function generateLayout(cards: Postcard[]): CardLayout[] {
  return cards.map((card, i) => ({
    id: card.id,
    x: (seededRandom(i * 3) - 0.5) * 4000,
    y: (seededRandom(i * 7) - 0.5) * 3000,
    rotate: (seededRandom(i * 11) - 0.5) * 30,
    floatX: (seededRandom(i * 13) - 0.5) * 14,
    floatY: (seededRandom(i * 17) - 0.5) * 14,
    floatDuration: 5 + seededRandom(i * 19) * 4,
    floatDelay: seededRandom(i * 23) * -8,
    imgIndex: i % CARD_IMAGES.length,
  }));
}

const REPEAT = 8;
const allCards: Postcard[] = Array.from({ length: REPEAT }, (_, r) =>
  postcards.map((c) => ({ ...c, id: `${c.id}-${r}` }))
).flat();

const layout = generateLayout(allCards);

interface Props {
  activeCollection: Collection;
  onCollectionChange: (c: Collection) => void;
}

export default function InfiniteCanvas({ activeCollection, onCollectionChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<Postcard | null>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);

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
    if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouch.current) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
  }, []);

  const onTouchEnd = useCallback(() => { lastTouch.current = null; }, []);

  const getCardForLayout = (l: CardLayout) => {
    const baseId = l.id.split("-").slice(0, 2).join("-");
    return postcards.find((c) => c.id === baseId) ?? postcards[0];
  };

  const collections: Collection[] = ["all", "spring", "summer", "autumn", "winter"];

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        background: "#EDEAE3",
        cursor: isDragging.current ? "grabbing" : "grab",
      }}
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
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: `${36 * zoom}px ${36 * zoom}px`,
          backgroundPosition: `${pan.x % (36 * zoom)}px ${pan.y % (36 * zoom)}px`,
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
          const imgSrc = CARD_IMAGES[l.imgIndex];
          return (
            <motion.div
              key={l.id}
              className="postcard-item absolute"
              style={{
                x: l.x,
                y: l.y,
                rotate: l.rotate,
                translateX: "-50%",
                translateY: "-50%",
              }}
              animate={{
                x: [l.x + l.floatX, l.x - l.floatX * 0.7, l.x + l.floatX * 0.4, l.x + l.floatX],
                y: [l.y + l.floatY, l.y - l.floatY * 0.5, l.y + l.floatY * 0.8, l.y + l.floatY],
                rotate: [l.rotate, l.rotate + 1.5, l.rotate - 1.2, l.rotate],
              }}
              transition={{
                duration: l.floatDuration,
                delay: l.floatDelay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{
                scale: 1.1,
                rotate: 0,
                zIndex: 100,
                transition: { duration: 0.22, ease: "easeOut" },
              }}
              onClick={() => setSelected(card)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div
                className="relative overflow-hidden select-none"
                style={{
                  width: 180,
                  height: 240,
                  borderRadius: 20,
                  border: "4px solid #111",
                  boxShadow: "4px 8px 24px rgba(0,0,0,0.20), 0 2px 4px rgba(0,0,0,0.12)",
                  background: "#fff",
                }}
              >
                <img
                  src={imgSrc}
                  alt={card.title}
                  width={180}
                  height={240}
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
                {/* Bottom gradient overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 pointer-events-none"
                  style={{
                    height: 64,
                    background: "linear-gradient(to top, rgba(0,0,0,0.50) 0%, transparent 100%)",
                  }}
                />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white text-[11px] font-semibold tracking-wide leading-tight" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                    {card.title}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating collection filter — bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-white/85 backdrop-blur-md rounded-full px-2 py-1.5 shadow-lg border border-black/8">
        {collections.map((c) => (
          <button
            key={c}
            onClick={() => onCollectionChange(c)}
            className={`px-3 py-1 text-[11px] font-semibold tracking-widest uppercase rounded-full transition-all duration-200 ${
              activeCollection === c
                ? "bg-[#111] text-white"
                : "text-[#111]/50 hover:text-[#111]"
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
