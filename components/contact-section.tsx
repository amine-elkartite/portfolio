"use client";

import { Facebook, Github, Instagram, Linkedin, Mail, Send } from "lucide-react";
import { motion } from "framer-motion";
import { socials } from "@/lib/site-data";
import { SectionHeading } from "@/components/section-heading";

const socialIcon = {
  GitHub: Github,
  LinkedIn: Linkedin,
  Instagram: Instagram,
  Facebook: Facebook
};

export function ContactSection() {
  return (
    <section id="contact" className="section-shell py-24">
      <SectionHeading
        eyebrow="Contact"
        title="Bring the next secure product into focus."
        description="Use the form or send a direct email. For cybersecurity work, include the system, scope, and deadline."
      />

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.32 }}
          transition={{ duration: 0.64, ease: "easeOut" }}
          className="glass rounded-[1.5rem] p-6"
        >
          <p className="text-sm font-black uppercase text-neon-green">Direct line</p>
          <a
            href="mailto:aminezth022@gmail.com"
            className="mt-4 inline-flex break-all text-2xl font-black text-white transition hover:text-neon-cyan md:text-3xl"
          >
            aminezth022@gmail.com
          </a>
          <p className="mt-6 leading-7 text-white/62">
            I am open to security assessments, modern web builds, startup collaborations, and
            SECUTRICK partnership conversations.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {socials.map((social) => {
              const Icon = socialIcon[social.label as keyof typeof socialIcon];

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  title={social.label}
                  aria-label={social.label}
                  className="outline-button grid h-12 w-12 place-items-center rounded-full text-white/70 transition hover:text-white"
                >
                  {Icon ? <Icon size={19} /> : <span className="text-sm font-black">X</span>}
                </a>
              );
            })}
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.32 }}
          transition={{ duration: 0.64, delay: 0.08, ease: "easeOut" }}
          action="mailto:aminezth022@gmail.com"
          method="post"
          encType="text/plain"
          className="glass rounded-[1.5rem] p-5 md:p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-white/72">Name</span>
              <input
                name="name"
                required
                autoComplete="name"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 text-white outline-none transition placeholder:text-white/28 focus:border-neon-cyan/65 focus:shadow-cyan"
                placeholder="Your name"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-white/72">Email</span>
              <input
                name="email"
                required
                type="email"
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 text-white outline-none transition placeholder:text-white/28 focus:border-neon-cyan/65 focus:shadow-cyan"
                placeholder="you@example.com"
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-white/72">Project Type</span>
            <select
              name="project_type"
              className="w-full rounded-2xl border border-white/10 bg-[#0b1122] px-4 py-4 text-white outline-none transition focus:border-neon-cyan/65 focus:shadow-cyan"
              defaultValue="Security Assessment"
            >
              <option>Security Assessment</option>
              <option>Penetration Testing</option>
              <option>Secure Web Development</option>
              <option>Partnership</option>
            </select>
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-white/72">Message</span>
            <textarea
              name="message"
              required
              rows={6}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 text-white outline-none transition placeholder:text-white/28 focus:border-neon-cyan/65 focus:shadow-cyan"
              placeholder="Tell me about the goal, scope, and timeline."
            />
          </label>
          <button
            type="submit"
            className="neon-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black transition hover:-translate-y-0.5 md:w-auto"
          >
            Send Message
            <Send size={18} />
          </button>
        </motion.form>
      </div>
    </section>
  );
}
