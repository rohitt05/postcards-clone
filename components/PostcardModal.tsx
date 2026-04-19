"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Postcard } from "@/data/postcards";
import { useState, useRef, useCallback } from "react";

interface Props {
  card: Postcard | null;
  onClose: () => void;
}

export default function PostcardModal({ card, onClose }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [sent, setSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setImage(null);
      setMessage("");
      setSenderName("");
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setImage(null);
    setMessage("");
    setSenderName("");
    setSent(false);
    setEditingName(false);
    onClose();
  };

  if (!card) return null;

  const accent = card.textColor;
  const bg = card.bg;

  return (
    <AnimatePresence>
      {card && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full flex flex-col overflow-hidden"
              style={{
                maxWidth: 480,
                borderRadius: 28,
                background: bg,
                boxShadow: "0 8px 48px rgba(0,0,0,0.22), 0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {/* ── Top section: card identity ── */}
              <div className="relative flex items-start justify-between px-7 pt-7 pb-4">
                <div>
                  <p style={{ color: accent, opacity: 0.45, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                    {card.collection} · {card.year}
                  </p>
                  <h2 style={{ color: accent, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                    {card.title}
                  </h2>
                  <p style={{ color: accent, opacity: 0.55, fontSize: 13, marginTop: 6, maxWidth: 260, lineHeight: 1.5 }}>
                    {card.description}
                  </p>
                </div>

                {/* Stamp */}
                <div style={{
                  width: 46, height: 54, flexShrink: 0, marginLeft: 12,
                  border: `2px solid ${accent}28`, borderRadius: 6,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.15em", color: `${accent}40`, textTransform: "uppercase" }}>MONO</span>
                </div>
              </div>

              {/* ── Divider ── */}
              <div style={{ height: 1, background: `${accent}14`, margin: "0 28px" }} />

              {/* ── Image upload zone ── */}
              <div className="px-7 pt-5 pb-2">
                <p style={{ color: accent, opacity: 0.4, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Photo</p>

                {sent ? (
                  /* Sent success state */
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      width: "100%", aspectRatio: "16/9", borderRadius: 16,
                      background: `${accent}18`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                      <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
                    </svg>
                    <span style={{ color: accent, opacity: 0.7, fontSize: 13, fontWeight: 600 }}>Postcard sent!</span>
                  </motion.div>
                ) : image ? (
                  /* Image preview */
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 16, overflow: "hidden" }}>
                    <img
                      src={image}
                      alt="postcard photo"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      onClick={() => setImage(null)}
                      style={{
                        position: "absolute", top: 8, right: 8,
                        width: 28, height: 28, borderRadius: "50%",
                        background: "rgba(0,0,0,0.5)", border: "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                        <path d="M1 1l10 10M11 1L1 11" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  /* Drop zone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    style={{
                      width: "100%", aspectRatio: "16/9", borderRadius: 16,
                      border: `2px dashed ${accent}${isDragging ? "60" : "28"}`,
                      background: isDragging ? `${accent}10` : `${accent}08`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 8,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span style={{ color: accent, opacity: 0.4, fontSize: 12, fontWeight: 600 }}>Add a photo</span>
                    <span style={{ color: accent, opacity: 0.25, fontSize: 11 }}>click or drag & drop</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>

              {/* ── Message ── */}
              {!sent && (
                <div className="px-7 pt-3">
                  <p style={{ color: accent, opacity: 0.4, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Message</p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write something to your loved one…"
                    maxLength={280}
                    rows={3}
                    style={{
                      width: "100%", resize: "none", border: "none", outline: "none",
                      background: `${accent}08`, borderRadius: 12,
                      padding: "12px 14px",
                      fontSize: 14, lineHeight: 1.6,
                      color: accent, fontFamily: "inherit",
                    }}
                    // placeholder style via CSS — done with a global trick
                  />
                  <div style={{ textAlign: "right", marginTop: 4 }}>
                    <span style={{ color: accent, opacity: 0.25, fontSize: 11 }}>{message.length}/280</span>
                  </div>
                </div>
              )}

              {/* ── Footer: sender + actions ── */}
              <div
                className="px-7 py-5 flex items-center justify-between"
                style={{ borderTop: `1px solid ${accent}14`, marginTop: 8 }}
              >
                {/* Sender name */}
                <div>
                  <p style={{ color: accent, opacity: 0.4, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>From</p>
                  {editingName ? (
                    <input
                      ref={nameInputRef}
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      onBlur={() => setEditingName(false)}
                      onKeyDown={(e) => { if (e.key === "Enter") setEditingName(false); }}
                      placeholder="Your name"
                      maxLength={40}
                      autoFocus
                      style={{
                        border: "none", outline: "none", background: "transparent",
                        fontSize: 14, fontWeight: 600, color: accent,
                        fontFamily: "inherit", width: 140, padding: 0,
                        borderBottom: `1px solid ${accent}40`,
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingName(true)}
                      style={{
                        border: "none", background: "transparent", cursor: "text",
                        padding: 0, display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600, color: accent, opacity: senderName ? 1 : 0.35 }}>
                        {senderName || "Your name"}
                      </span>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" style={{ opacity: 0.35 }}>
                        <path d="M8 1l3 3-7 7H1V8l7-7z" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Actions */}
                {!sent && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      onClick={handleClose}
                      style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                        textTransform: "uppercase", padding: "8px 16px",
                        borderRadius: 9999, border: `1.5px solid ${accent}30`,
                        color: accent, background: "transparent", cursor: "pointer",
                        transition: "opacity 0.2s",
                        opacity: 0.7,
                      }}
                    >
                      Close
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!message.trim() && !image}
                      style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                        textTransform: "uppercase", padding: "8px 18px",
                        borderRadius: 9999, border: "none",
                        background: accent, color: bg,
                        cursor: (!message.trim() && !image) ? "not-allowed" : "pointer",
                        opacity: (!message.trim() && !image) ? 0.35 : 1,
                        transition: "opacity 0.2s",
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      Send
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={bg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
