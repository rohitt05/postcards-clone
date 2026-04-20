"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import InfiniteCanvas from "@/components/InfiniteCanvas";
import { Collection } from "@/data/postcards";

function PostcardsApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const collectionParam = (searchParams.get("collection") as Collection) || "all";
  const [active, setActive] = useState<Collection>(collectionParam);

  useEffect(() => setActive(collectionParam), [collectionParam]);

  const handleCollectionChange = (c: Collection) => {
    setActive(c);
    router.push(c === "all" ? "/" : `/?collection=${c}`, { scroll: false });
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#F0EBE1" }}>
      {/* Floating header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 md:px-8 py-4 pointer-events-none">
        {/* Brand */}
        <div className="pointer-events-auto flex flex-col leading-none select-none">
          <span
            className="text-ink/30 tracking-[0.22em] uppercase"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, fontWeight: 500, letterSpacing: "0.22em" }}
          >
            a collection by
          </span>
          <span
            className="text-ink"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 600, letterSpacing: "0.01em", lineHeight: 1.1, fontStyle: "italic" }}
          >
            My Love For You
          </span>
        </div>

        {/* Nav */}
        <nav className="pointer-events-auto flex items-center gap-5">
          {/* Desktop: text link */}
          <a
            href="/about"
            className="hidden sm:block transition-colors duration-200 hover:text-ink text-ink/50"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            About
          </a>
          {/* Mobile: heart is the about link — large tap target so canvas can't steal it */}
          <a
            href="/about"
            className="sm:hidden flex items-center justify-center"
            aria-label="About"
            style={{
              color: "#C8896E",
              fontSize: 22,
              lineHeight: 1,
              opacity: 0.85,
              minWidth: 44,
              minHeight: 44,
              touchAction: "manipulation",
            }}
          >
            ♥
          </a>
          {/* Desktop decorative heart (non-interactive) */}
          <span
            className="hidden sm:inline"
            style={{ color: "#C8896E", fontSize: 16, lineHeight: 1, opacity: 0.7 }}
          >
            ♥
          </span>
        </nav>
      </div>

      <InfiniteCanvas
        activeCollection={active}
        onCollectionChange={handleCollectionChange}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <PostcardsApp />
    </Suspense>
  );
}
