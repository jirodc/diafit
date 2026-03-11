import { useEffect } from "react";
import SpotlightCard from "@/components/SpotlightCard";
import { TeamSection } from "@/components/TeamSection";
import { StatsSection } from "@/components/StatsSection";
import ScrollReveal from "@/components/ScrollReveal";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us – Diafit";
    return () => {
      document.title = "Diafit – AI-Powered Diabetes Management";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with image */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50/30 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
                About <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Diafit</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-600">
                Empowering people with diabetes to live healthier, happier lives
                through AI-powered technology.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200/80 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80"
                alt="Person using health app for diabetes management"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission with image */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative order-2 lg:order-1 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80"
                alt="Wellness and healthy lifestyle"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                Our Mission
              </h2>
              <p className="mt-4 text-slate-600">
                At Diafit, we believe that managing diabetes shouldn&apos;t be
                overwhelming. Our mission is to empower individuals with the
                tools, insights, and support they need to take control of their
                health.
              </p>
              <p className="mt-4 text-slate-600">
                We combine cutting-edge AI technology with user-friendly design
                to make diabetes management simple, effective, and accessible
                to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote – accent band */}
      <section className="bg-gradient-to-r from-violet-600 to-blue-600 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal
            baseOpacity={0.2}
            enableBlur
            baseRotation={2}
            blurStrength={3}
            containerClassName="!my-0"
            textClassName="text-white drop-shadow-sm"
          >
            Managing diabetes isn&apos;t just about numbers—it&apos;s about
            living well. At Diafit, we&apos;re here to empower you with
            AI-powered insights, so you can take control of your health and
            thrive every day.
          </ScrollReveal>
        </div>
      </section>

      {/* Our Values – light cards, brand accents */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-800 sm:text-3xl">
            Our Values
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <SpotlightCard
              className="custom-spotlight-card border border-slate-200/80 bg-white shadow-sm"
              spotlightColor="rgba(124, 58, 237, 0.12)"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-violet-100">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80"
                  alt="Patient-centered care"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-800">
                Patient-Centered
              </h3>
              <p className="mt-2 text-slate-600">
                Everything we do is designed with our users&apos; health and
                well-being in mind.
              </p>
            </SpotlightCard>
            <SpotlightCard
              className="custom-spotlight-card border border-slate-200/80 bg-white shadow-sm"
              spotlightColor="rgba(37, 99, 235, 0.12)"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-blue-100">
                <img
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80"
                  alt="Security and privacy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-800">
                Privacy & Security
              </h3>
              <p className="mt-2 text-slate-600">
                Your health data is protected with enterprise-grade encryption
                and HIPAA compliance.
              </p>
            </SpotlightCard>
            <SpotlightCard
              className="custom-spotlight-card border border-slate-200/80 bg-white shadow-sm"
              spotlightColor="rgba(124, 58, 237, 0.12)"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-violet-100">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80"
                  alt="Innovation and data"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-800">
                Innovation
              </h3>
              <p className="mt-2 text-slate-600">
                We continuously improve our AI algorithms to provide better
                insights and recommendations.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Stats – dark strip so white text stays visible */}
      <section className="bg-[var(--diafit-section-accent)]">
        <StatsSection />
      </section>

      {/* Built by Experts */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Built by Experts
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Our team includes endocrinologists, AI researchers, and software
              engineers dedicated to improving diabetes care.
            </p>
          </div>
          <TeamSection />
        </div>
      </section>
    </div>
  );
}
