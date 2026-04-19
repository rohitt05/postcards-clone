import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About · My Love For You",
  description: "A collection of digital postcards to share what words alone cannot.",
};

export default function AboutPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F0EBE1", fontFamily: "var(--font-dm-sans)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 md:px-8 py-4">
        <Link href="/" className="flex flex-col leading-none select-none group">
          <span
            className="text-ink/30 tracking-[0.22em] uppercase"
            style={{ fontSize: 9, fontWeight: 500 }}
          >
            a collection by
          </span>
          <span
            className="text-ink group-hover:text-ink/70 transition-colors"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(22px, 4vw, 34px)",
              fontWeight: 600,
              letterSpacing: "0.01em",
              lineHeight: 1.1,
              fontStyle: "italic",
            }}
          >
            My Love For You
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href="/about"
            className="transition-colors duration-200 text-ink"
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            About
          </Link>
          <span style={{ color: "#C8896E", fontSize: 16, lineHeight: 1, opacity: 0.7 }}>♥</span>
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full">
          {/* Decorative heart */}
          <div className="mb-8" style={{ color: "#C8896E", fontSize: 28, opacity: 0.6 }}>♥</div>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(36px, 6vw, 58px)",
              fontWeight: 600,
              fontStyle: "italic",
              lineHeight: 1.1,
              color: "#1A1A1A",
              marginBottom: "1.5rem",
            }}
          >
            Some things are too
            <br />big for words.
          </h1>

          <div
            style={{
              width: 40,
              height: 1.5,
              background: "#C8A96E",
              marginBottom: "1.5rem",
              opacity: 0.7,
            }}
          />

          <p
            className="text-ink/70 leading-relaxed mb-5"
            style={{ fontSize: 15 }}
          >
            <strong style={{ color: "#1A1A1A", fontWeight: 600 }}>My Love For You</strong> is a
            collection of handcrafted digital postcards — made to help you say the things that are
            hardest to say.
          </p>

          <p className="text-ink/60 leading-relaxed mb-5" style={{ fontSize: 15 }}>
            Browse the collection, pick a card that speaks to you, add your own words and photos,
            and send a link your person can open anywhere.
          </p>

          <p className="text-ink/60 leading-relaxed mb-10" style={{ fontSize: 15 }}>
            No accounts. No ads. Just a quiet corner of the internet for the people who matter most.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#1A1A1A",
            }}
          >
            <span style={{ color: "#C8896E" }}>←</span>
            Browse the collection
          </Link>
        </div>
      </main>
    </div>
  );
}
