"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type PremiumCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function PremiumCard({ children, className = "", delay = 0 }: PremiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ duration: 0.58, delay, ease: "easeOut" }}
      className={`glass glow-border rounded-[1.25rem] ${className}`}
    >
      {children}
    </motion.div>
  );
}
