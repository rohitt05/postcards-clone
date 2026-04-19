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
    <div className="fixed inset-0 bg-paper overflow-hidden">
      {/* Minimal floating UI overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-5 pointer-events-none">
        <span className="text-2xl font-black tracking-tight text-ink pointer-events-auto select-none">
          POSTCARDS.
        </span>
        <a
          href="#"
          className="text-sm font-medium text-ink/60 hover:text-ink transition-colors pointer-events-auto"
        >
          About
        </a>
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
