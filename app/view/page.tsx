"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getCardById } from "@/lib/encodePostcard";
import Link from "next/link";

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

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

type PostcardData = {
  cardId: string;
  message: string;
  senderName: string;
  images: string[];
};

function ViewPostcard() {
  const params = useSearchParams();
  const id = params.get("id");

  const [data, setData] = useState<PostcardData | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setFetchError("No postcard found."); setLoading(false); return; }
    fetch(`/api/postcard?id=${id}`)
      .then(r => r.ok ? r.json() : r.json().then((e: { error?: string }) => Promise.reject(e.error ?? "Not found")))
      .then((d: PostcardData) => setData(d))
      .catch((e: string) => setFetchError(typeof e === "string" ? e : "Failed to load postcard."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (fetchError || !data) return <ErrorScreen message={fetchError || "This link seems broken."} />;

  const card = getCardById(data.cardId);
  if (!card) return <ErrorScreen message="Postcard style not found." />;

  const accent = card.textColor;
  const bg = card.bg;
  const images = data.images ?? [];

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
      background: "rgba(0,0,0,0.72)",
    }}>

      {/* Blurred full-screen bg from first image */}
      {images[0] ? (
        <div style={{
          position: "fixed", inset: 0, zIndex: 0,
          backgroundImage: `url(${images[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(32px) brightness(0.45) saturate(1.3)",
          transform: "scale(1.08)",
        }} />
      ) : (
        <div style={{
          position: "fixed", inset: 0, zIndex: 0,
          background: "#1a1916",
        }} />
      )}

      {/* Scattered photo tiles — viewer only */}
      {images.map((src, i) => {
        const slot = BG_SLOTS[i % BG_SLOTS.length];
        return (
          <div
            key={i}
            style={{
              position: "fixed",
              width: 160, height: 120,
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              transform: `rotate(${slot.rotate}deg) scale(${slot.scale})`,
              transformOrigin: "center center",
              zIndex: 1,
              opacity: 0.7,
              ...(slot.top   ? { top:   slot.top   } : {}),
              ...(slot.left  ? { left:  slot.left  } : {}),
              ...(slot.right ? { right: slot.right } : {}),
            }}
          >
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        );
      })}

      {/* Postcard */}
      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 10 }}>
        <div style={{
          background: bg,
          borderRadius: 32,
          overflow: "hidden",
          boxShadow: "0 16px 64px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.2)",
        }}>
          <div style={{ padding: "22px 22px 0" }}>
            <p style={{
              color: accent, opacity: 0.4, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase", margin: 0,
            }}>{formatDate()}</p>
          </div>

          {data.message && (
            <div style={{ padding: "14px 22px 20px" }}>
              <p style={{
                color: accent, fontSize: 15, lineHeight: 1.7,
                fontStyle: "italic", opacity: 0.82, margin: 0,
                whiteSpace: "pre-wrap",
              }}>&ldquo;{data.message}&rdquo;</p>
            </div>
          )}

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
                {data.senderName}
              </p>
            </div>
            <div style={{ display: "flex", gap: 4, opacity: 0.15 }}>
              {[24, 18, 20].map((s, i) => (
                <div key={i} style={{ width: s, height: s, borderRadius: "50%", border: `1.5px solid ${accent}` }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", textDecoration: "none",
            color: "rgba(255,255,255,0.5)",
            padding: "8px 18px", borderRadius: 9999,
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}>
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

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1916" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "rgba(255,255,255,0.6)", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16,
      background: "#1a1916",
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 600 }}>{message}</p>
      <Link href="/" style={{
        fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", textDecoration: "none",
        color: "rgba(255,255,255,0.5)",
        padding: "8px 18px", borderRadius: 9999,
        background: "rgba(255,255,255,0.1)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}>Browse postcards</Link>
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ViewPostcard />
    </Suspense>
  );
}
