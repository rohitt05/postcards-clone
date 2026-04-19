"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { decodePayload, getCardById } from "@/lib/encodePostcard";
import Link from "next/link";

function ViewPostcard() {
  const params = useSearchParams();
  const encoded = params.get("p");

  if (!encoded) return <ErrorScreen message="No postcard found." />;

  const payload = decodePayload(encoded);
  if (!payload) return <ErrorScreen message="This link seems broken." />;

  const card = getCardById(payload.cardId);
  if (!card) return <ErrorScreen message="Postcard not found." />;

  const accent = card.textColor;
  const bg = card.bg;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#EDEAE3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Card */}
        <div
          style={{
            background: bg,
            borderRadius: 32,
            overflow: "hidden",
            boxShadow: "0 8px 48px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.08)",
          }}
        >
          {/* Image with fade-out bottom */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "4/3" }}>
            {payload.image ? (
              <img
                src={payload.image}
                alt="postcard photo"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div
                style={{
                  width: "100%", height: "100%",
                  background: `${accent}10`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.25 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}

            {/* Gradient fade: image → card bg */}
            <div
              style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                height: "55%",
                background: `linear-gradient(to bottom, transparent 0%, ${bg} 100%)`,
                pointerEvents: "none",
              }}
            />

            {/* Card identity overlaid on the fade */}
            <div
              style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                padding: "0 22px 18px",
                display: "flex", alignItems: "flex-end", justifyContent: "space-between",
              }}
            >
              <div>
                <p style={{
                  color: accent, opacity: 0.5, fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase", margin: 0,
                }}>
                  {card.collection} · {card.year}
                </p>
                <p style={{
                  color: accent, fontSize: 20, fontWeight: 800,
                  letterSpacing: "-0.01em", margin: "3px 0 0",
                }}>
                  {card.title}
                </p>
              </div>
              <div style={{
                width: 38, height: 46,
                border: `1.5px solid ${accent}30`,
                borderRadius: 5,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginLeft: 12,
              }}>
                <span style={{
                  fontSize: 6, fontWeight: 800, letterSpacing: "0.15em",
                  color: `${accent}45`, textTransform: "uppercase",
                }}>MONO</span>
              </div>
            </div>
          </div>

          {/* Message — no divider, flows naturally below the fade */}
          {payload.message && (
            <div style={{ padding: "4px 22px 20px" }}>
              <p style={{
                color: accent, fontSize: 15, lineHeight: 1.7,
                fontStyle: "italic", opacity: 0.82, margin: 0,
                whiteSpace: "pre-wrap",
              }}>
                &ldquo;{payload.message}&rdquo;
              </p>
            </div>
          )}

          {/* Footer */}
          <div style={{
            padding: "12px 22px 20px",
            borderTop: `1px solid ${accent}12`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{
                color: accent, opacity: 0.35, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 2px",
              }}>From</p>
              <p style={{ color: accent, fontSize: 14, fontWeight: 700, margin: 0 }}>
                {payload.senderName || "Anonymous"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 4, opacity: 0.15 }}>
              {[24, 18, 20].map((s, i) => (
                <div key={i} style={{
                  width: s, height: s, borderRadius: "50%",
                  border: `1.5px solid ${accent}`,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Back to gallery */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", textDecoration: "none",
              color: "rgba(0,0,0,0.4)",
              padding: "8px 18px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Browse postcards
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16,
      background: "#EDEAE3",
      backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 14, fontWeight: 600 }}>{message}</p>
      <Link href="/" style={{
        fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", textDecoration: "none",
        color: "rgba(0,0,0,0.5)",
        padding: "8px 18px", borderRadius: 9999,
        background: "rgba(255,255,255,0.8)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>Browse postcards</Link>
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EDEAE3" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.12)", borderTopColor: "rgba(0,0,0,0.4)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ViewPostcard />
    </Suspense>
  );
}
