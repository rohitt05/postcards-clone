"use client";

import { AnimatePresence } from "framer-motion";
import { Postcard } from "@/data/postcards";
import PostcardCard from "./PostcardCard";

interface Props {
  cards: Postcard[];
  onSelect: (card: Postcard) => void;
}

export default function PostcardGrid({ cards, onSelect }: Props) {
  return (
    <div className="px-6 md:px-12 py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      <AnimatePresence mode="popLayout">
        {cards.map((card, i) => (
          <PostcardCard
            key={card.id}
            card={card}
            index={i}
            onClick={() => onSelect(card)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
