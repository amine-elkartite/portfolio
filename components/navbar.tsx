"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/site-data";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-4 z-40 px-4">
      <nav className="section-shell glass flex h-16 items-center justify-between rounded-full px-4 shadow-glow">
        <a href="#home" className="group flex items-center gap-3" aria-label="Amine ELKARTITE home">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-neon-green shadow-glow">
            <ShieldCheck size={20} />
          </span>
          <span className="leading-none">
            <span className="block text-sm font-black uppercase text-white">Amine</span>
            <span className="block text-xs font-medium text-white/58">SECUTrick Founder</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white/66 transition hover:bg-white/[0.07] hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          href="mailto:aminezth022@gmail.com"
          className="outline-button hidden rounded-full px-5 py-2.5 text-sm font-bold transition md:inline-flex"
        >
          Let&apos;s Talk
        </a>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
          className="outline-button grid h-10 w-10 place-items-center rounded-full transition md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="section-shell glass mt-3 rounded-[1.5rem] p-3 md:hidden"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-white/72 transition hover:bg-white/[0.07] hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
