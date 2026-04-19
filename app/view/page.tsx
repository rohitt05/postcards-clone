"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { decodePayload, getCardById } from "@/lib/encodePostcard";
import Link from "next/link";

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

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
    <div style={{ minHeight: "100dvh", background: bg, position: "relative" }}>

      {/* ── Sticky image (top half) ── */}
      <div style={{
        position: "sticky",
        top: 0,
        height: "55dvh",
        width: "100%",
        zIndex: 0,
        overflow: "hidden",
      }}>
        {payload.image ? (
          <img
            src={payload.image}
            alt="postcard"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: `${accent}12`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={accent}
              strokeWidth="1.2" strokeLinecap="round" style={{ opacity: 0.2 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Subtle bottom fade on image */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "40%",
          background: `linear-gradient(to bottom, transparent, ${bg})`,
          pointerEvents: "none",
        }} />
      </div>

      {/* ── Scrolling sheet ── */}
      <div style={{
        position: "relative",
        zIndex: 10,
        marginTop: "-28px",
        background: bg,
        borderRadius: "28px 28px 0 0",
        minHeight: "60dvh",
        padding: "28px 24px 48px",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
      }}>

        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 9999,
          background: `${accent}20`,
          margin: "0 auto 24px",
        }} />

        {/* Date */}
        <p style={{
          color: accent, opacity: 0.38,
          fontSize: 12, fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          margin: "0 0 20px",
          textAlign: "center",
        }}>
          {formatDate()}
        </p>

        {/* Message */}
        {payload.message && (
          <p style={{
            color: accent, fontSize: 17, lineHeight: 1.75,
            fontStyle: "italic", opacity: 0.85,
            margin: "0 0 28px",
            whiteSpace: "pre-wrap",
            textAlign: "center",
          }}>
            &ldquo;{payload.message}&rdquo;
          </p>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: `${accent}12`, margin: "0 0 20px" }} />

        {/* Sender */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{
              color: accent, opacity: 0.32,
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              margin: "0 0 3px",
            }}>From</p>
            <p style={{ color: accent, fontSize: 15, fontWeight: 700, margin: 0 }}>
              {payload.senderName || "Anonymous"}
            </p>
          </div>
          {/* Postmark circles */}
          <div style={{ display: "flex", gap: 4, opacity: 0.12 }}>
            {[24, 18, 20].map((s, i) => (
              <div key={i} style={{
                width: s, height: s, borderRadius: "50%",
                border: `1.5px solid ${accent}`,
              }} />
            ))}
          </div>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", textDecoration: "none",
              color: accent, opacity: 0.35,
              padding: "8px 18px",
              borderRadius: 9999,
              border: `1.5px solid ${accent}20`,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round">
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
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round">
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
      <div style={{
        minHeight: "100dvh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#EDEAE3",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "2px solid rgba(0,0,0,0.12)",
          borderTopColor: "rgba(0,0,0,0.4)",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ViewPostcard />
    </Suspense>
  );
}
