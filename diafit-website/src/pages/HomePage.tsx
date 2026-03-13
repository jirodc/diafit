import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { GetStartedButton } from "@/components/GetStartedButton";
import SpotlightCard from "@/components/SpotlightCard";
import { FeaturesCarousel } from "@/components/FeaturesCarousel";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import GridMotion from "@/components/GridMotion";

/** 28 diabetes / health / wellness images for hero grid background */
const HERO_GRID_IMAGES = [
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
  "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
  "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
  "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
];

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#download") {
      document.getElementById("download")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-[#B7D6FB]">
      {/* Hero – GridMotion background + content */}
      <section className="relative flex min-h-screen min-w-full flex-col justify-center overflow-hidden border-2 border-dashed border-slate-500/60 px-4 py-24 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_20px_rgba(0,0,0,0.08)] sm:px-6 sm:py-28 lg:flex-row lg:items-center lg:gap-12 lg:px-8">
        {/* Parallax grid background (diabetes/health images) */}
        <div className="absolute inset-0 z-0">
          <GridMotion
            items={HERO_GRID_IMAGES}
            gradientColor="rgba(183, 214, 251, 0.92)"
          />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          {/* Left: copy + CTAs + social proof */}
          <div className="flex max-w-xl flex-col">
          
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Manage diabetes with{" "}
              <span className="text-blue-700">AI-Powered</span> insights
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-800">
              Track glucose with confidence. Get personalized meal plans and smart health recommendations—all in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <GetStartedButton />
              <Link
                to="/#services"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-800 bg-transparent px-6 py-3 text-base font-medium text-slate-800 transition-colors hover:bg-white/40"
              >
                Learn More
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Link>
            </div>
            
          </div>

          {/* Right: glucose meter image – anchored to bottom of hero, high quality */}
          <div className="relative hidden min-h-[280px] w-full max-w-md flex-1 lg:flex lg:min-h-0 lg:items-end lg:justify-center lg:self-stretch">
            <div
              className="relative flex h-full max-h-[85vh] w-full max-w-[320px] flex-shrink-0 items-end lg:max-w-[380px]"
              style={{
                filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.2)) drop-shadow(0 12px 24px rgba(0,0,0,0.12))",
              }}
            >
              <img
                src="/monitoring-kit-hero.png"
                alt="Blood glucose monitor showing 95 MG/DL – track your readings with Diafit"
                className="h-full w-full object-contain object-bottom"
                width={760}
                height={860}
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features / Services – Bento grid (image kept) */}
      <section id="services" className="border-2 border-dashed border-slate-500/60 bg-[#B7D6FB] py-20 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_20px_rgba(0,0,0,0.08)] sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything You Need to Stay Healthy
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-700">
              Powerful features designed to help you manage diabetes effectively
            </p>
          </div>

          {/* Bento grid */}
          <motion.div
            className="mt-10 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.15 },
              },
            }}
            viewport={{ once: true, margin: "-40px" }}
            whileInView="visible"
          >
            {/* Large image cell – keep existing wellness image */}
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-slate-300/80 bg-white/95 shadow-lg sm:col-span-2 sm:row-span-2"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            >
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
                alt="Stay healthy - diabetes management and wellness"
                className="h-full min-h-[240px] w-full object-cover sm:min-h-[280px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white drop-shadow sm:text-base">
                Your health, your way — track, learn, and thrive with Diafit.
              </p>
            </motion.div>

            {/* Spotlight features cell */}
            <motion.div
              className="flex flex-col justify-center rounded-2xl border border-slate-300/80 bg-white/95 p-5 shadow-lg"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            >
              <h3 className="font-semibold text-slate-900 text-lg">What we offer</h3>
              <ul className="mt-3 space-y-2">
                {[
                  "Glucose tracking & insights",
                  "Personalized meal plans",
                  "AI health recommendations",
                  "Smart analytics",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-slate-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Small text cell */}
            <motion.div
              className="rounded-2xl border border-slate-300/80 bg-white/95 p-5 shadow-lg"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            >
              <h3 className="font-semibold text-slate-900">Stay on track</h3>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                Log readings, follow meal plans, and get insights—all in one place.
              </p>
            </motion.div>
          </motion.div>

          <div className="mt-12 w-full">
            <FeaturesCarousel variant="light" />
          </div>
        </div>
      </section>

      {/* Lifestyle / imagery section */}
      <section className="border-2 border-dashed border-slate-500/60 bg-[#B7D6FB] py-16 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_20px_rgba(0,0,0,0.08)] sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Live healthier, one day at a time
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-700">
            Join a community that understands. Track, learn, and thrive with Diafit.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="screen-3d-card relative">
              <div className="screen-3d-card-inner relative aspect-[4/3] w-full">
                <img
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80"
                  alt="Healthy balanced meal"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-4 left-4 z-10 text-sm font-medium text-white drop-shadow">
                  Personalized meal plans
                </span>
              </div>
            </div>
            <div className="screen-3d-card relative">
              <div className="screen-3d-card-inner relative aspect-[4/3] w-full">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80"
                  alt="Glucose monitoring"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-4 left-4 z-10 text-sm font-medium text-white drop-shadow">
                  Smart glucose tracking
                </span>
              </div>
            </div>
            <div className="screen-3d-card relative sm:col-span-2 lg:col-span-1">
              <div className="screen-3d-card-inner relative aspect-[4/3] w-full">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"
                  alt="Active lifestyle"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-4 left-4 z-10 text-sm font-medium text-white drop-shadow">
                  Your health, your way
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-2 border-dashed border-slate-500/60 bg-[#B7D6FB] py-20 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_20px_rgba(0,0,0,0.08)] sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How Diafit Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-700">
              Simple steps to better health management
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <SpotlightCard className="custom-spotlight-card border border-slate-300 bg-white/80" spotlightColor="rgba(124, 58, 237, 0.2)">
              <span className="text-5xl font-bold text-slate-500">01</span>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                Track Your Data
              </h3>
              <p className="mt-2 text-slate-700">
                Log glucose readings, meals, medications, and activities in
                seconds.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-sm font-medium text-white">
                  ✓
                </span>
              </div>
            </SpotlightCard>
            <SpotlightCard className="custom-spotlight-card border border-slate-300 bg-white/80" spotlightColor="rgba(124, 58, 237, 0.2)">
              <span className="text-5xl font-bold text-slate-500">02</span>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                Get AI Insights
              </h3>
              <p className="mt-2 text-slate-700">
                Our AI analyzes your data and provides personalized
                recommendations.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-sm font-medium text-white">
                  ✓
                </span>
              </div>
            </SpotlightCard>
            <SpotlightCard className="custom-spotlight-card border border-slate-300 bg-white/80" spotlightColor="rgba(124, 58, 237, 0.2)">
              <span className="text-5xl font-bold text-slate-500">03</span>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                Improve Your Health
              </h3>
              <p className="mt-2 text-slate-700">
                Follow insights and watch your health metrics improve over time.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-sm font-medium text-white">
                  ✓
                </span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Download Our App – MyFridgeFood-style: white block, headline, buttons, phone + floating cards */}
      <section id="download" className="bg-[#B7D6FB] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl">
            {/* Subtle health background in lower area */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/2 rounded-3xl bg-cover bg-center opacity-30"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80)",
              }}
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-white/95 via-white/80 to-transparent" />

            <div className="relative px-6 pb-12 pt-10 sm:px-8 sm:pt-12 sm:pb-16">
              {/* Centered headline */}
              <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Your health at your fingertips
              </h2>

              {/* App Store buttons – centered, black, rounded */}
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <a
                  href="#"
                  aria-label="Download on the App Store"
                  className="flex items-center gap-3 rounded-xl bg-black px-5 py-3.5 text-white shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                    <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M12 2c.73 0 1.46.09 2.17.24.69.14 1.33.36 1.91.64.57.28 1.08.63 1.5 1.05.42.42.77.93 1.05 1.5.28.58.5 1.22.64 1.91.15.71.24 1.44.24 2.17 0 .73-.09 1.46-.24 2.17-.14.69-.36 1.33-.64 1.91-.28.57-.63 1.08-1.05 1.5-.42.42-.93.77-1.5 1.05-.58.28-1.22.5-1.91.64C13.46 21.91 12.73 22 12 22c-.73 0-1.46-.09-2.17-.24-.69-.14-1.33-.36-1.91-.64-.57-.28-1.08-.63-1.5-1.05-.42-.42-.77-.93-1.05-1.5-.28-.58-.5-1.22-.64-1.91C4.09 15.46 4 14.73 4 14c0-.73.09-1.46.24-2.17.14-.69.36-1.33.64-1.91.28-.57.63-1.08 1.05-1.5.42-.42.93-.77 1.5-1.05.58-.28 1.22-.5 1.91-.64C10.54 2.09 11.27 2 12 2z" />
                    </svg>
                  </span>
                  <div className="text-left">
                    <span className="block text-xs text-white">Download on the</span>
                    <span className="block font-semibold text-white">App Store</span>
                  </div>
                </a>
                <a
                  href="#"
                  aria-label="Get it on Google Play"
                  className="flex items-center gap-3 rounded-xl bg-black px-5 py-3.5 text-white shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00C853]">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5h1.09c.33 0 .64.11.91.3l10.12 8.5-10.12 8.5c-.27.19-.58.3-.91.3H4.5C3.67 22 3 21.33 3 20.5z" />
                      <path d="M16.5 12l5.5-4.5v9l-5.5-4.5z" />
                    </svg>
                  </span>
                  <div className="text-left">
                    <span className="block text-xs text-white">GET IT ON</span>
                    <span className="block font-semibold text-white">Google Play</span>
                  </div>
                </a>
              </div>

              {/* Phone + floating cards container */}
              <div className="relative mt-12 flex min-h-[320px] flex-col items-center sm:min-h-[380px] lg:min-h-[420px]">
                {/* Left floating card */}
                <div className="absolute left-0 top-1/2 z-10 hidden w-[260px] -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-4 shadow-lg sm:left-2 sm:block sm:w-[280px] sm:p-5 lg:left-4 lg:top-1/3 lg:translate-y-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B7D6FB] text-slate-700">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="mt-3 font-bold text-slate-900">Track readings easily</h3>
                  <p className="mt-1.5 text-slate-600 text-sm leading-relaxed">
                    Log glucose, meals, and activity in one place. See trends and stay on top of your numbers with clear charts and reminders.
                  </p>
                </div>

                {/* Center: tilted phone mockup */}
                <div className="relative z-20 flex justify-center">
                  <img
                    src="/diafit-app-phone.png"
                    alt="Diafit app on phone"
                    className="h-auto w-[180px] -rotate-6 drop-shadow-2xl sm:w-[220px] lg:w-[260px]"
                  />
                </div>

                {/* Right floating card */}
                <div className="absolute right-0 top-1/2 z-10 hidden w-[260px] -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-4 shadow-lg sm:right-2 sm:block sm:w-[280px] sm:p-5 lg:right-4 lg:top-1/3 lg:translate-y-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B7D6FB] text-slate-700">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="mt-3 font-bold text-slate-900">Personalized health insights</h3>
                  <p className="mt-1.5 text-slate-600 text-sm leading-relaxed">
                    AI-powered meal plans and recommendations tailored to your data. Get actionable tips to improve your glucose control.
                  </p>
                </div>
              </div>

              {/* QR code – subtle, centered below phone on small screens */}
              <div className="mt-8 flex flex-col items-center gap-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=https://diafit.app/download"
                    alt="QR code to download Diafit"
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="text-slate-500 text-xs font-medium">Scan to download</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-2 border-dashed border-slate-500/60 bg-[#B7D6FB] py-16 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_20px_rgba(0,0,0,0.08)] sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Ready to Take Control of Your Health?
          </h2>
          <p className="mt-4 text-lg text-slate-700">
            Join thousands of users managing their diabetes with Diafit
          </p>
          <div className="mt-10">
            <GetStartedButton variant="secondary" />
          </div>
        </div>
      </section>
    </div>
  );
}
