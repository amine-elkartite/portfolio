"use client";

import { Code2, Fingerprint, Rocket, ShieldCheck } from "lucide-react";
import { PremiumCard } from "@/components/premium-card";
import { SectionHeading } from "@/components/section-heading";

const cards = [
  {
    icon: ShieldCheck,
    title: "Cybersecurity Engineering",
    text: "Security-first thinking across web applications, infrastructure posture, attack surface review, and practical hardening."
  },
  {
    icon: Rocket,
    title: "Founder Execution",
    text: "SECUTrick is built around clear positioning, trust, rapid iteration, and services that solve visible business risk."
  },
  {
    icon: Code2,
    title: "Product-Grade Frontend",
    text: "Modern interfaces with strong hierarchy, smooth motion, clean component systems, and deployment-ready implementation."
  }
];

export function AboutSection() {
  return (
    <section id="about" className="section-shell py-24">
      <SectionHeading
        eyebrow="About"
        title="Security mindset, product taste, founder energy."
        description="A portfolio built for a cybersecurity engineer who understands both the threat model and the customer experience."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <PremiumCard key={card.title} delay={index * 0.08} className="p-6">
              <div className="mb-8 flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/12 bg-white/[0.06] text-neon-green shadow-glow">
                  <Icon size={22} />
                </span>
                <Fingerprint className="text-white/12" size={34} />
              </div>
              <h3 className="text-2xl font-black text-white">{card.title}</h3>
              <p className="mt-4 leading-7 text-white/62">{card.text}</p>
            </PremiumCard>
          );
        })}
      </div>
    </section>
  );
}
