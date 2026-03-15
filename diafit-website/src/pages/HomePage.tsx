import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { GetStartedButton } from "@/components/GetStartedButton";
import { motion } from "motion/react";
import {
  Activity,
  UtensilsCrossed,
  Lightbulb,
  FileBarChart,
  Bell,
  Users,
  ClipboardList,
  TrendingUp,
  Heart,
} from "lucide-react";

import GlucoHeroImg from "@/GlucoHero.png";

const SKY_BLUE = "#B7D6FB";

const FEATURE_CARDS = [
  {
    icon: Activity,
    title: "Glucose Tracking",
    description: "Log readings in seconds and see trends at a glance. Stay on top of your numbers with clear charts and history.",
  },
  {
    icon: UtensilsCrossed,
    title: "Meal Plans",
    description: "Personalized meal suggestions based on your preferences and glucose goals. Eat well without the guesswork.",
  },
  {
    icon: Lightbulb,
    title: "AI Insights",
    description: "Smart recommendations that learn from your data. Get actionable tips to improve your glucose control.",
  },
  {
    icon: FileBarChart,
    title: "Smart Reports",
    description: "Understand your patterns with easy-to-read reports. Share with your care team when it matters.",
  },
  {
    icon: Bell,
    title: "Reminders",
    description: "Never miss a reading or medication. Custom reminders keep your routine on track.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with others who understand. Support and motivation when you need it most.",
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Track Your Data",
    description: "Log glucose readings, meals, medications, and activities in seconds from your phone or device.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  },
  {
    step: 2,
    title: "Get AI Insights",
    description: "Our AI analyzes your data and surfaces personalized recommendations and trends.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
  },
  {
    step: 3,
    title: "Improve Your Health",
    description: "Follow your plan and watch your metrics improve. Small steps add up to lasting change.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
  },
];

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#download") {
      document.getElementById("download")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero – template 1: sky blue, two columns, headline + CTAs + media */}
      <section
        className="relative flex min-h-screen min-w-full flex-col justify-center overflow-hidden px-4 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:flex-row lg:items-center lg:gap-12 lg:px-8"
        style={{ backgroundColor: SKY_BLUE }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex max-w-xl flex-col">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Manage Diabete with AI-Powered Insights
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-800">
              Our app works on all devices, so you only have to set it up once—and get better health results every day.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <GetStartedButton />
              <Link
                to="/#services"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-700 bg-transparent px-6 py-3 text-base font-medium text-slate-800 transition-colors hover:bg-white/40"
              >
                Explore Product
              </Link>
            </div>
          </div>
          <div className="relative flex min-h-[280px] w-full max-w-md flex-1 items-end justify-center lg:min-h-0 lg:self-stretch">
            <img
              src={GlucoHeroImg}
              alt="Blood glucose meter showing 95 – track your readings with Diafit"
              className="h-auto max-h-[85vh] w-[280px] object-contain object-bottom drop-shadow-2xl sm:w-[320px] lg:w-[380px]"
            />
          </div>
        </div>
      </section>

      {/* Features – template 2: white section, 2x3 grid, sky blue circular icons */}
      <section id="services" className="relative bg-white py-20 sm:py-24">
        {/* Curved transition from sky blue */}
        <div
          className="absolute inset-x-0 top-0 h-24 w-full"
          style={{
            background: `linear-gradient(to bottom, ${SKY_BLUE}, white)`,
            clipPath: "ellipse(120% 100% at 50% 0%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mt-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to stay healthy
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Powerful features designed to help you manage diabetes effectively.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: SKY_BLUE }}
                >
                  <card.icon className="h-7 w-7 text-slate-800" strokeWidth={1.8} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Built exclusively for you – template 3 */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: SKY_BLUE }}>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built exclusively for you
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-800">
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
            laborum—semper quis lectus nulla at volutpat diam ut venenatis.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {[ClipboardList, TrendingUp, Heart, Lightbulb].map((Icon, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-700/30 bg-white/80"
                >
                  <Icon className="h-6 w-6 text-slate-700" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-slate-800">Internal Feedback</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works – template 5: sky blue band + 3 numbered cards */}
      <section id="how-it-works" className="bg-white py-0">
        <div
          className="py-16 text-center sm:py-20"
          style={{ backgroundColor: SKY_BLUE }}
        >
          <h2 className="mx-auto max-w-3xl px-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simplify managing diabetes with transparency
          </h2>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <motion.div
                key={item.step}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div
                  className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white shadow"
                  style={{ backgroundColor: SKY_BLUE }}
                >
                  {item.step}
                </div>
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Our App – keep template style, sky blue accents */}
      <section id="download" className="py-16 sm:py-20" style={{ backgroundColor: SKY_BLUE }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl">
            <div
              className="absolute inset-x-0 bottom-0 h-1/2 rounded-3xl bg-cover bg-center opacity-30"
              style={{
                backgroundImage: "url(https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80)",
              }}
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-white/95 via-white/80 to-transparent" />
            <div className="relative px-6 pb-12 pt-10 sm:px-8 sm:pt-12 sm:pb-16">
              <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Your health at your fingertips
              </h2>
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
              <div className="relative mt-12 flex min-h-[280px] flex-col items-center sm:min-h-[340px]">
                <div className="absolute left-0 top-1/2 z-10 hidden w-[260px] -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-4 shadow-lg sm:left-2 sm:block sm:w-[280px] sm:p-5 lg:left-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700" style={{ backgroundColor: SKY_BLUE }}>
                    <Activity className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="mt-3 font-bold text-slate-900">Track readings easily</h3>
                  <p className="mt-1.5 text-slate-600 text-sm leading-relaxed">
                    Log glucose, meals, and activity in one place. See trends with clear charts.
                  </p>
                </div>
                <img
                  src="/diafit-app-phone.png"
                  alt="Diafit app on phone"
                  className="relative z-20 h-auto w-[180px] -rotate-6 drop-shadow-2xl sm:w-[220px] lg:w-[260px]"
                />
                <div className="absolute right-0 top-1/2 z-10 hidden w-[260px] -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-4 shadow-lg sm:right-2 sm:block sm:w-[280px] sm:p-5 lg:right-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700" style={{ backgroundColor: SKY_BLUE }}>
                    <Lightbulb className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="mt-3 font-bold text-slate-900">Personalized health insights</h3>
                  <p className="mt-1.5 text-slate-600 text-sm leading-relaxed">
                    AI-powered meal plans and recommendations tailored to your data.
                  </p>
                </div>
              </div>
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

      {/* CTA – template 7: centered headline with accent word */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: SKY_BLUE }}>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Say goodbye to guesswork and{" "}
            <span className="text-emerald-600">confusion.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-800">
            Diafit puts your glucose, meals, and insights in one place—so you see the full picture and make
            confident choices. Join thousands taking control of their diabetes with clarity and support.
          </p>
          <div className="mt-10">
            <GetStartedButton variant="secondary" />
          </div>
        </div>
      </section>
    </div>
  );
}
