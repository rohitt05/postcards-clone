"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import CollectionTabs from "@/components/CollectionTabs";
import InfiniteCanvas from "@/components/InfiniteCanvas";
import { Collection } from "@/data/postcards";

function PostcardsApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const collectionParam = (searchParams.get("collection") as Collection) || "all";
  const [active, setActive] = useState<Collection>(collectionParam);

  useEffect(() => {
    setActive(collectionParam);
  }, [collectionParam]);

  const handleTabChange = (c: Collection) => {
    setActive(c);
    router.push(c === "all" ? "/" : `/?collection=${c}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col overflow-hidden">
      <Header />
      <CollectionTabs active={active} onChange={handleTabChange} />
      <InfiniteCanvas activeCollection={active} />
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
