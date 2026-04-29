"use client";

import { motion } from "framer-motion";
import {
  Braces,
  Cloud,
  Code2,
  Cpu,
  Database,
  FileCode2,
  LockKeyhole,
  Network,
  Radar,
  ScanSearch,
  Shield,
  Terminal
} from "lucide-react";
import { stack } from "@/lib/site-data";
import { SectionHeading } from "@/components/section-heading";

const icons = [
  Code2,
  Braces,
  FileCode2,
  Cpu,
  Radar,
  Terminal,
  Cloud,
  Network,
  Shield,
  ScanSearch,
  LockKeyhole,
  Database
];

export function StackSection() {
  return (
    <section id="stack" className="section-shell py-24">
      <SectionHeading
        eyebrow="Stack"
        title="Modern web craft meets practical security tooling."
        description="A focused grid of technologies and security disciplines used to ship polished, resilient digital products."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stack.map((item, index) => {
          const Icon = icons[index % icons.length];

          return (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ duration: 0.5, delay: index * 0.035, ease: "easeOut" }}
              className="glass glow-border grid min-h-[132px] place-items-center rounded-[1.2rem] p-4 text-center"
            >
              <div>
                <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/12 bg-white/[0.06] text-neon-cyan">
                  <Icon size={22} />
                </span>
                <p className="text-sm font-black text-white">{item}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
