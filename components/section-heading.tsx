"use client";

import { motion } from "framer-motion";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="mx-auto mb-10 max-w-3xl text-center"
    >
      <p className="mb-3 text-sm font-black uppercase text-neon-green">{eyebrow}</p>
      <h2 className="text-balance text-4xl font-black leading-[1.02] text-white md:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/62 md:text-lg">
          {description}
        </p>
      ) : null}
    </motion.div>
  );
}
