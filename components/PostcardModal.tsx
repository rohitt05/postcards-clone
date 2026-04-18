"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Postcard } from "@/data/postcards";

interface Props {
  card: Postcard | null;
  onClose: () => void;
}

export default function PostcardModal({ card, onClose }: Props) {
  return (
    <AnimatePresence>
      {card && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              style={{ backgroundColor: card.bg }}
            >
              <div
                className="relative w-full aspect-[4/3] flex items-center justify-center p-10"
                style={{ backgroundColor: card.bg }}
              >
                <div
                  className="absolute top-6 right-6 w-14 h-16 border-2 rounded flex items-center justify-center opacity-30"
                  style={{ borderColor: card.textColor }}
                >
                  <span className="text-[8px] font-bold" style={{ color: card.textColor }}>
                    MONO
                  </span>
                </div>

                <div className="text-center">
                  <p
                    className="text-[10px] tracking-[0.3em] uppercase mb-3 opacity-50"
                    style={{ color: card.textColor }}
                  >
                    {card.collection} · {card.year}
                  </p>
                  <h2
                    className="text-5xl font-bold tracking-tight"
                    style={{ color: card.textColor }}
                  >
                    {card.title}
                  </h2>
                  <p
                    className="mt-4 text-sm opacity-70 max-w-xs leading-relaxed mx-auto"
                    style={{ color: card.textColor }}
                  >
                    {card.description}
                  </p>
                </div>

                <div className="absolute bottom-6 left-6 space-y-1 opacity-20">
                  {["_____________", "_______", "________"].map((line, i) => (
                    <div key={i} className="text-xs" style={{ color: card.textColor }}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="px-8 py-5 flex items-center justify-between border-t"
                style={{
                  borderColor: `${card.textColor}20`,
                  backgroundColor: `${card.bg}`,
                }}
              >
                <div>
                  <p
                    className="text-xs tracking-widest uppercase opacity-50 mb-0.5"
                    style={{ color: card.textColor }}
                  >
                    By
                  </p>
                  <p className="text-sm font-medium" style={{ color: card.textColor }}>
                    {card.artist}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="text-xs tracking-widest uppercase px-4 py-2 rounded-full border transition-opacity hover:opacity-60"
                    style={{
                      borderColor: `${card.textColor}40`,
                      color: card.textColor,
                    }}
                  >
                    Close
                  </button>
                  <button
                    className="text-xs tracking-widest uppercase px-5 py-2 rounded-full font-medium transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: card.textColor,
                      color: card.bg,
                    }}
                  >
                    Send ✉
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
