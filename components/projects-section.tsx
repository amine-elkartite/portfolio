"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { projects } from "@/lib/site-data";
import { SectionHeading } from "@/components/section-heading";

export function ProjectsSection() {
  return (
    <section id="projects" className="section-shell py-24">
      <SectionHeading
        eyebrow="Projects"
        title="Interfaces with signal, polish, and purpose."
        description="Selected builds and concepts shaped around security, conversion, and clean user journeys."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {projects.map((project, index) => (
          <motion.article
            key={project.title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.22 }}
            whileHover={{ y: -10, scale: 1.01 }}
            transition={{ duration: 0.62, delay: index * 0.06, ease: "easeOut" }}
            className="glass glow-border group overflow-hidden rounded-[1.5rem]"
          >
            <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-white/[0.035]">
              <Image
                src={project.image}
                alt={`${project.title} interface preview`}
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-transparent to-transparent opacity-60" />
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-sm font-black uppercase text-neon-green">{project.type}</p>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.055] text-white transition group-hover:border-neon-cyan/60 group-hover:text-neon-cyan">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <h3 className="text-2xl font-black text-white md:text-3xl">{project.title}</h3>
              <p className="mt-4 leading-7 text-white/62">{project.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-bold text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
