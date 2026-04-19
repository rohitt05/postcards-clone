"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import { getCardById } from "@/lib/encodePostcard";
import Link from "next/link";

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type PostcardData = {
  cardId: string;
  message: string;
  senderName: string;
  images: string[];
};

function PhotoCarousel({ images, accent, bg }: { images: string[]; accent: string; bg: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveIdx(idx);
  };

  if (images.length === 0) return null;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Carousel scroll container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          borderRadius: 0,
          aspectRatio: "4/3",
          width: "100%",
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {images.map((src, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: "100%",
              height: "100%",
              scrollSnapAlign: "start",
              position: "relative",
            }}
          >
            <img
              src={src}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        ))}
      </div>

      {/* Left gradient fade */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 56,
        background: `linear-gradient(to right, ${bg}cc, transparent)`,
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* Right gradient fade */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 56,
        background: `linear-gradient(to left, ${bg}cc, transparent)`,
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* Bottom gradient fade into card content */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 64,
        background: `linear-gradient(to bottom, transparent, ${bg})`,
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* Dot indicators */}
      {images.length > 1 && (
        <div style={{
          position: "absolute", bottom: 10, left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 5, zIndex: 3,
        }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                scrollRef.current?.scrollTo({ left: i * scrollRef.current.offsetWidth, behavior: "smooth" });
              }}
              style={{
                width: i === activeIdx ? 18 : 6,
                height: 6, borderRadius: 9999,
                background: accent,
                opacity: i === activeIdx ? 0.9 : 0.3,
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.25s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
    }}>

      {/* Blurred full-screen bg */}
      {images[0] ? (
        <div style={{
          position: "fixed", inset: 0, zIndex: 0,
          backgroundImage: `url(${images[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(32px) brightness(0.35) saturate(1.3)",
          transform: "scale(1.08)",
        }} />
      ) : (
        <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "#1a1916" }} />
      )}
      {/* Dark overlay */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, background: "rgba(0,0,0,0.38)" }} />

      {/* Postcard */}
      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 10 }}>
        <div style={{
          background: bg,
          borderRadius: 32,
          overflow: "hidden",
          boxShadow: "0 16px 64px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.2)",
        }}>

          {/* Photo carousel inside card */}
          {images.length > 0 && (
            <PhotoCarousel images={images} accent={accent} bg={bg} />
          )}

          {/* Date */}
          <div style={{ padding: images.length > 0 ? "12px 22px 0" : "22px 22px 0" }}>
            <p style={{
              color: accent, opacity: 0.4, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase", margin: 0,
            }}>{formatDate()}</p>
          </div>

          {/* Message */}
          {data.message && (
            <div style={{ padding: "12px 22px 18px" }}>
              <p style={{
                color: accent, fontSize: 15, lineHeight: 1.7,
                fontStyle: "italic", opacity: 0.82, margin: 0,
                whiteSpace: "pre-wrap",
              }}>&ldquo;{data.message}&rdquo;</p>
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

        {/* Back link */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", textDecoration: "none",
            color: "rgba(255,255,255,0.5)",
            padding: "8px 18px", borderRadius: 9999,
            background: "rgba(255,255,255,0.08)",
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
