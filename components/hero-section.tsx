"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Mail, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { socials } from "@/lib/site-data";

const heroStats = [
  { label: "Security Focus", value: "100%" },
  { label: "Founder Mode", value: "SECUTrick" },
  { label: "Core Domain", value: "Cyber" }
];

export function HeroSection() {
  return (
    <section id="home" className="section-shell flex min-h-[94svh] items-center pt-28">
      <div className="grid w-full items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, ease: "easeOut" }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-4 py-2 text-sm font-bold text-white/72 shadow-glow backdrop-blur"
          >
            <Sparkles size={16} className="text-neon-green" />
            Cybersecurity Engineer and Founder of SECUTrick
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 42 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.84, delay: 0.08, ease: "easeOut" }}
            className="text-[clamp(3.5rem,10vw,8.8rem)] font-black uppercase leading-[0.88] text-white"
          >
            Amine
            <span className="block text-gradient">ELKARTITE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, delay: 0.2, ease: "easeOut" }}
            className="mt-7 max-w-2xl text-lg leading-8 text-white/68 md:text-xl"
          >
            I build secure digital systems with founder-level urgency, product-grade polish, and
            practical cybersecurity thinking for modern web teams.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.32, ease: "easeOut" }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="#projects"
              className="neon-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black transition hover:-translate-y-0.5"
            >
              Explore Work
              <ArrowUpRight size={18} />
            </a>
            <a
              href="mailto:aminezth022@gmail.com"
              className="outline-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black transition hover:-translate-y-0.5"
            >
              <Mail size={18} />
              Contact Me
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.44, ease: "easeOut" }}
            className="mt-10 grid gap-3 sm:grid-cols-3"
          >
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.15rem] border border-white/10 bg-white/[0.045] p-4 backdrop-blur"
              >
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-white/52">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.86, delay: 0.18, ease: "easeOut" }}
          className="relative"
        >
          <div className="glass relative overflow-hidden rounded-[2rem] p-4 shadow-cyan">
            <div className="absolute inset-0 opacity-50">
              <div className="scanline absolute inset-x-0 h-1/2" />
            </div>
            <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#070b18]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-300" />
                  <span className="h-3 w-3 rounded-full bg-neon-green" />
                </div>
                <span className="text-xs font-bold text-white/50">security_console.tsx</span>
              </div>

              <div className="grid gap-6 p-5 md:grid-cols-[0.88fr_1.12fr]">
                <div className="floating relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/[0.04]">
                  <Image
                    src="/assets/amine-avatar.png"
                    alt="Amine ELKARTITE"
                    fill
                    priority
                    sizes="(max-width: 768px) 80vw, 320px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur-md">
                    <p className="text-sm font-black text-white">Amine ELKARTITE</p>
                    <p className="text-xs text-white/60">Founder of SECUTrick</p>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-5">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.045] p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm font-black text-neon-green">
                        <ShieldCheck size={17} /> Posture
                      </span>
                      <span className="rounded-full bg-neon-green/15 px-3 py-1 text-xs font-black text-neon-green">
                        Protected
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "93%" }}
                        transition={{ duration: 1.1, delay: 0.85, ease: "easeOut" }}
                        className="h-full rounded-full bg-neon-gradient"
                      />
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <Metric icon={<Terminal size={17} />} label="Audits" value="Web Apps" />
                      <Metric icon={<ShieldCheck size={17} />} label="Focus" value="Defense" />
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.045] p-5">
                    <p className="mb-3 text-sm font-black text-white">Available across</p>
                    <div className="flex flex-wrap gap-2">
                      {socials.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-bold text-white/66 transition hover:border-neon-cyan/60 hover:text-white"
                        >
                          {social.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <a
        href="#about"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-bold uppercase text-white/42 transition hover:text-white md:inline-flex"
      >
        Scroll
        <ArrowDown size={15} />
      </a>
    </section>
  );
}

function Metric({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
      <div className="mb-2 text-neon-cyan">{icon}</div>
      <p className="text-sm font-black text-white">{value}</p>
      <p className="text-xs text-white/48">{label}</p>
    </div>
  );
}
