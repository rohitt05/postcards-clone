"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { Collection } from "@/data/postcards";

const tabs: { label: string; value: Collection; emoji: string }[] = [
  { label: "All",           value: "all",           emoji: "✦" },
  { label: "Love",          value: "love",          emoji: "❤️" },
  { label: "Best Friends",  value: "best-friends",  emoji: "🤝" },
  { label: "Christmas",     value: "christmas",     emoji: "🎄" },
  { label: "Easter",        value: "easter",        emoji: "🐣" },
  { label: "Birthday",      value: "birthday",      emoji: "🎂" },
  { label: "Long Distance", value: "long-distance", emoji: "✈️" },
];

interface Props {
  active: Collection;
  onChange: (c: Collection) => void;
}

export default function CollectionTabs({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-1.5 px-6 md:px-12 py-5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            "relative flex items-center gap-1.5 px-4 py-1.5 text-xs tracking-widest uppercase rounded-full transition-colors duration-200 whitespace-nowrap",
            active === tab.value ? "text-paper bg-ink" : "text-muted hover:text-ink"
          )}
        >
          {active === tab.value && (
            <motion.span
              layoutId="tab-pill"
              className="absolute inset-0 bg-ink rounded-full -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="text-sm leading-none">{tab.emoji}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
