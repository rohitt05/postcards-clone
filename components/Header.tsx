"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full px-6 md:px-12 py-6 flex items-center justify-between border-b border-ink/10"
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium tracking-widest uppercase text-muted">
          Mono
        </span>
        <span className="w-px h-4 bg-ink/20" />
        <span className="text-sm font-medium tracking-widest uppercase text-ink">
          Postcards
        </span>
      </div>
      <nav className="flex items-center gap-6">
        <a
          href="#"
          className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors duration-200"
        >
          About
        </a>
        <a
          href="#"
          className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors duration-200"
        >
          Shop
        </a>
      </nav>
    </motion.header>
  );
}
