"use client";

import { BugOff, CloudCog, FileSearch, KeyRound, RadioTower, ShieldAlert } from "lucide-react";
import { PremiumCard } from "@/components/premium-card";
import { SectionHeading } from "@/components/section-heading";

const services = [
  {
    icon: BugOff,
    title: "Vulnerability Assessment",
    text: "Identify exploitable weaknesses across web apps, infrastructure, and public-facing services."
  },
  {
    icon: KeyRound,
    title: "Penetration Testing",
    text: "Manual validation, realistic attack paths, and concise remediation guidance for technical teams."
  },
  {
    icon: CloudCog,
    title: "Secure Web Development",
    text: "Next.js interfaces and product surfaces built with security, performance, and maintainability in mind."
  },
  {
    icon: RadioTower,
    title: "Monitoring Readiness",
    text: "Security posture signals, alert flows, and visibility patterns that help teams respond faster."
  },
  {
    icon: FileSearch,
    title: "Security Reviews",
    text: "Architecture review, threat modeling, and developer-friendly findings before risky releases."
  },
  {
    icon: ShieldAlert,
    title: "Incident Support",
    text: "Focused triage, containment planning, and communication support during high-pressure events."
  }
];

export function ServicesSection() {
  return (
    <section id="services" className="section-shell py-24">
      <SectionHeading
        eyebrow="Services"
        title="Sharp security services without enterprise theater."
        description="Calm, clear, and actionable support for founders, startups, and modern web teams."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => {
          const Icon = service.icon;

          return (
            <PremiumCard key={service.title} delay={index * 0.05} className="p-6">
              <span className="mb-7 grid h-12 w-12 place-items-center rounded-2xl border border-white/12 bg-white/[0.06] text-neon-green shadow-glow">
                <Icon size={22} />
              </span>
              <h3 className="text-xl font-black text-white">{service.title}</h3>
              <p className="mt-4 leading-7 text-white/62">{service.text}</p>
            </PremiumCard>
          );
        })}
      </div>
    </section>
  );
}
