"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Postcard } from "@/data/postcards";
import { useState, useRef, useCallback } from "react";
import { compressImage, encodePayload } from "@/lib/encodePostcard";

interface Props {
  card: Postcard | null;
  onClose: () => void;
}

type Step = "compose" | "share";

const MAX_IMAGES = 15;
const MAX_MESSAGE = 1000;

// Deterministic scattered positions for bg images
const BG_SLOTS = [
  { top: "4%",  left: "-6%",  rotate: -14, scale: 0.82 },
  { top: "2%",  left: "28%",  rotate:   6, scale: 0.76 },
  { top: "1%",  right: "-4%", rotate:  13, scale: 0.80 },
  { top: "28%", left: "-8%",  rotate:  -8, scale: 0.78 },
  { top: "30%", right: "-7%", rotate:  10, scale: 0.75 },
  { top: "55%", left: "-5%",  rotate: -12, scale: 0.80 },
  { top: "58%", right: "-6%", rotate:   9, scale: 0.77 },
  { top: "72%", left: "20%",  rotate:  -5, scale: 0.74 },
  { top: "75%", right: "18%", rotate:  15, scale: 0.79 },
  { top: "80%", left: "-4%",  rotate:  -9, scale: 0.76 },
  { top: "5%",  left: "55%",  rotate: -11, scale: 0.73 },
  { top: "45%", left: "38%",  rotate:   7, scale: 0.71 },
  { top: "62%", left: "52%",  rotate: -16, scale: 0.75 },
  { top: "18%", left: "14%",  rotate:  12, scale: 0.72 },
  { top: "88%", right: "-3%", rotate:  -7, scale: 0.74 },
];

export default function PostcardModal({ card, onClose }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [step, setStep] = useState<Step>("compose");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = senderName.trim().length > 0 && (message.trim().length > 0 || images.length > 0);
  const showNameError = nameTouched && !senderName.trim();

  const handleFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    arr.forEach(file => {
      setImages(prev => {
        if (prev.length >= MAX_IMAGES) return prev;
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(p => p.length < MAX_IMAGES ? [...p, e.target?.result as string] : p);
        };
        reader.readAsDataURL(file);
        return prev;
      });
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = (idx: number) => setImages(p => p.filter((_, i) => i !== idx));

  const handleSend = async () => {
    if (!card || !canGenerate) return;
    setLoading(true);
    try {
      const compressed = await Promise.all(images.map(compressImage));
      const encoded = encodePayload({
        cardId: card.id,
        message,
        senderName: senderName.trim(),
        image: compressed[0] ?? null,
        images: compressed,
      });
      setShareUrl(`${window.location.origin}/view?p=${encoded}`);
      setStep("share");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleClose = () => {
    setImages([]);
    setMessage("");
    setSenderName("");
    setStep("compose");
    setShareUrl("");
    setCopied(false);
    setLoading(false);
    setEditingName(false);
    setNameTouched(false);
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
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)" }}
          />

          {/* Scattered background images */}
          <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
            <AnimatePresence>
              {images.map((src, i) => {
                const slot = BG_SLOTS[i % BG_SLOTS.length];
                return (
                  <motion.div
                    key={src.slice(-20) + i}
                    initial={{ opacity: 0, scale: 0.6, rotate: (slot.rotate ?? 0) - 10 }}
                    animate={{ opacity: 1, scale: slot.scale, rotate: slot.rotate }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.06 }}
                    style={{
                      position: "absolute",
                      width: 160,
                      height: 120,
                      borderRadius: 14,
                      overflow: "hidden",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                      transformOrigin: "center center",
                      ...(slot.top    ? { top:    slot.top    } : {}),
                      ...(slot.left   ? { left:   slot.left   } : {}),
                      ...(slot.right  ? { right:  slot.right  } : {}),
                    }}
                  >
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

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
              className="pointer-events-auto w-full flex flex-col"
              style={{
                maxWidth: 440,
                borderRadius: 32,
                background: bg,
                boxShadow: "0 8px 48px rgba(0,0,0,0.28), 0 1px 2px rgba(0,0,0,0.1)",
                overflow: "hidden",
                maxHeight: "90dvh",
                overflowY: "auto",
              }}
            >
              <AnimatePresence mode="wait">

                {/* ── COMPOSE ── */}
                {step === "compose" && (
                  <motion.div
                    key="compose"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Image upload strip */}
                    <div style={{ padding: "20px 20px 0" }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>

                        {/* Thumbnails */}
                        {images.map((src, i) => (
                          <div key={i} style={{ position: "relative", width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <button
                              onClick={() => removeImage(i)}
                              style={{
                                position: "absolute", top: 3, right: 3,
                                width: 18, height: 18, borderRadius: "50%",
                                background: "rgba(0,0,0,0.55)", border: "none",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", padding: 0,
                              }}
                            >
                              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                                <path d="M1 1l8 8M9 1L1 9" />
                              </svg>
                            </button>
                          </div>
                        ))}

                        {/* Add button */}
                        {images.length < MAX_IMAGES && (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            style={{
                              width: images.length === 0 ? "100%" : 64,
                              height: images.length === 0 ? 180 : 64,
                              borderRadius: images.length === 0 ? 20 : 12,
                              border: `2px dashed ${accent}${isDragging ? "60" : "28"}`,
                              background: isDragging ? `${accent}12` : `${accent}08`,
                              display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center",
                              gap: images.length === 0 ? 10 : 0,
                              cursor: "pointer", transition: "all 0.2s ease", flexShrink: 0,
                            }}
                          >
                            <svg width={images.length === 0 ? 28 : 20} height={images.length === 0 ? 28 : 20} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            {images.length === 0 && (
                              <>
                                <span style={{ color: accent, opacity: 0.4, fontSize: 13, fontWeight: 600 }}>Add photos</span>
                                <span style={{ color: accent, opacity: 0.25, fontSize: 11 }}>click or drag &amp; drop · up to {MAX_IMAGES}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {images.length > 0 && (
                        <p style={{ color: accent, opacity: 0.25, fontSize: 11, marginTop: 6, textAlign: "right" }}>
                          {images.length}/{MAX_IMAGES} photos
                        </p>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
                      />
                    </div>

                    {/* Message */}
                    <div style={{ padding: "14px 20px 0" }}>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write something to your loved one…"
                        maxLength={MAX_MESSAGE}
                        rows={4}
                        style={{
                          width: "100%", resize: "none", border: "none", outline: "none",
                          background: `${accent}08`, borderRadius: 16,
                          padding: "12px 14px", fontSize: 14, lineHeight: 1.65,
                          color: accent, fontFamily: "inherit",
                        }}
                      />
                      <div style={{ textAlign: "right", marginTop: 3 }}>
                        <span style={{ color: accent, opacity: 0.22, fontSize: 11 }}>{message.length}/{MAX_MESSAGE}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                      padding: "12px 20px 18px",
                      borderTop: `1px solid ${accent}14`,
                      marginTop: 10,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div>
                        <p style={{ color: accent, opacity: 0.35, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 3 }}>From</p>
                        {editingName ? (
                          <input
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            onBlur={() => { setEditingName(false); setNameTouched(true); }}
                            onKeyDown={(e) => { if (e.key === "Enter") { setEditingName(false); setNameTouched(true); } }}
                            placeholder="Your name"
                            maxLength={40}
                            autoFocus
                            style={{
                              border: "none", outline: "none", background: "transparent",
                              fontSize: 14, fontWeight: 600, color: accent,
                              fontFamily: "inherit", width: 150, padding: 0,
                              borderBottom: `1.5px solid ${showNameError ? "#e05252" : accent + "40"}`,
                            }}
                          />
                        ) : (
                          <button
                            onClick={() => { setEditingName(true); setNameTouched(true); }}
                            style={{ border: "none", background: "transparent", cursor: "text", padding: 0, display: "flex", alignItems: "center", gap: 5 }}
                          >
                            <span style={{ fontSize: 14, fontWeight: 600, color: showNameError ? "#e05252" : accent, opacity: senderName ? 1 : 0.4 }}>
                              {senderName || "Your name *"}
                            </span>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke={showNameError ? "#e05252" : accent} strokeWidth="1.8" strokeLinecap="round" style={{ opacity: 0.4 }}>
                              <path d="M8 1l3 3-7 7H1V8l7-7z" />
                            </svg>
                          </button>
                        )}
                        {showNameError && (
                          <p style={{ color: "#e05252", fontSize: 10, marginTop: 3, fontWeight: 600 }}>Required to send</p>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={handleClose}
                          style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                            textTransform: "uppercase", padding: "8px 16px",
                            borderRadius: 9999, border: `1.5px solid ${accent}28`,
                            color: accent, background: "transparent", cursor: "pointer", opacity: 0.65,
                          }}
                        >Close</button>
                        <button
                          onClick={() => { setNameTouched(true); if (canGenerate) handleSend(); }}
                          disabled={loading}
                          style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                            textTransform: "uppercase", padding: "8px 18px",
                            borderRadius: 9999, border: "none",
                            background: accent, color: bg,
                            cursor: canGenerate && !loading ? "pointer" : "not-allowed",
                            opacity: canGenerate ? 1 : 0.3,
                            transition: "opacity 0.2s",
                            display: "flex", alignItems: "center", gap: 6,
                          }}
                        >
                          {loading ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={bg} strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                              <path d="M12 2a10 10 0 0 1 10 10" />
                            </svg>
                          ) : (
                            <>
                              Generate link
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={bg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── SHARE ── */}
                {step === "share" && (
                  <motion.div
                    key="share"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.22 }}
                    style={{ padding: "28px 24px" }}
                  >
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: `${accent}14`,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 12,
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                          <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
                        </svg>
                      </div>
                      <p style={{ color: accent, fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em", margin: 0 }}>Postcard ready!</p>
                      <p style={{ color: accent, opacity: 0.5, fontSize: 13, marginTop: 4 }}>Share this link with your loved one</p>
                    </div>

                    <div style={{
                      background: `${accent}08`, borderRadius: 16,
                      padding: "12px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                      marginBottom: 12,
                    }}>
                      <span style={{
                        flex: 1, fontSize: 12, color: accent, opacity: 0.6,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        fontFamily: "monospace",
                      }}>{shareUrl}</span>
                      <button
                        onClick={handleCopy}
                        style={{
                          flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                          textTransform: "uppercase", padding: "7px 14px", borderRadius: 9999,
                          border: "none", background: accent, color: bg,
                          cursor: "pointer", transition: "opacity 0.2s",
                          display: "flex", alignItems: "center", gap: 5,
                        }}
                      >
                        {copied ? (
                          <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={bg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>Copied!</>
                        ) : (
                          <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={bg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy</>
                        )}
                      </button>
                    </div>

                    <p style={{ color: accent, opacity: 0.3, fontSize: 11, textAlign: "center", marginBottom: 20, lineHeight: 1.5 }}>
                      Anyone with this link can view your postcard.
                    </p>

                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button
                        onClick={() => setStep("compose")}
                        style={{
                          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                          textTransform: "uppercase", padding: "9px 18px",
                          borderRadius: 9999, border: `1.5px solid ${accent}28`,
                          color: accent, background: "transparent", cursor: "pointer", opacity: 0.65,
                        }}
                      >← Edit</button>
                      <button
                        onClick={handleClose}
                        style={{
                          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                          textTransform: "uppercase", padding: "9px 18px",
                          borderRadius: 9999, border: "none",
                          background: accent, color: bg, cursor: "pointer",
                        }}
                      >Done</button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
