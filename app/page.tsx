import { AboutSection } from "@/components/about-section";
import { AnimatedBackground } from "@/components/animated-background";
import { ContactSection } from "@/components/contact-section";
import { HeroSection } from "@/components/hero-section";
import { Navbar } from "@/components/navbar";
import { ProjectsSection } from "@/components/projects-section";
import { ScrollProgress } from "@/components/scroll-progress";
import { ServicesSection } from "@/components/services-section";
import { StackSection } from "@/components/stack-section";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      <AnimatedBackground />
      <ScrollProgress />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <StackSection />
      <ServicesSection />
      <ContactSection />
    </main>
  );
}
