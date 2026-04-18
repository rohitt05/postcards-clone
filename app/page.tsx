"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import CollectionTabs from "@/components/CollectionTabs";
import PostcardGrid from "@/components/PostcardGrid";
import PostcardModal from "@/components/PostcardModal";
import { postcards, Postcard, Collection } from "@/data/postcards";
import { motion } from "framer-motion";

function PostcardsApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const collectionParam = (searchParams.get("collection") as Collection) || "all";

  const [active, setActive] = useState<Collection>(collectionParam);
  const [selected, setSelected] = useState<Postcard | null>(null);

  useEffect(() => {
    setActive(collectionParam);
  }, [collectionParam]);

  const filtered = useMemo(() => {
    if (active === "all") return postcards;
    return postcards.filter((p) => p.collection === active);
  }, [active]);

  const handleTabChange = (c: Collection) => {
    setActive(c);
    router.push(c === "all" ? "/" : `/?collection=${c}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 md:px-12 pt-10 pb-2"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-ink leading-none">
          Postcards
        </h1>
        <p className="mt-2 text-sm text-muted tracking-wide">
          A curated collection of digital postcards — send one today.
        </p>
      </motion.div>

      <CollectionTabs active={active} onChange={handleTabChange} />

      <div className="px-6 md:px-12 pb-2">
        <p className="text-xs text-muted tracking-widest uppercase">
          {filtered.length} postcard{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <PostcardGrid cards={filtered} onSelect={setSelected} />

      <PostcardModal card={selected} onClose={() => setSelected(null)} />

      <footer className="px-6 md:px-12 py-10 mt-6 border-t border-ink/10 flex items-center justify-between">
        <span className="text-xs text-muted tracking-widest uppercase">
          © {new Date().getFullYear()} Mono Studio
        </span>
        <span className="text-xs text-muted tracking-widest uppercase">
          Postcards
        </span>
      </footer>
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
