import { useEffect } from "react";
import { useLocation } from "react-router-dom";
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

import heroSectionHand from "@/Herosectionlandinghand.png";

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
    <div className="min-h-0 w-full bg-white">
      {/* Hero – blue background + Herosectionlandinghand.png, animate left to right (ease-in-out) */}
      <section id="download" className="relative -mt-20 flex min-h-screen w-full min-w-0 flex-col justify-center pt-8 pb-16 sm:pt-10 sm:pb-20 lg:-mt-24 lg:min-h-screen lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:pt-12 lg:pb-24" style={{ backgroundColor: SKY_BLUE }}>
        {/* Darker gradient overlay on the left */}
        
        {/* H1 is absolute — use bottom-* (e.g. bottom-8) to pin to bottom, or top-* for top; left-* / right-* for horizontal */}
        <h1 className="absolute bottom-0 left-4 z-50 text-[8rem] font-bold leading-none tracking-tight text-blue-700 sm:left-6 sm:text-[14rem] lg:bottom-140 lg:left-8 lg:text-[10rem]">
          DIAFIT
        </h1> 
        <div className="mt-12 flex w-full min-w-0 flex-1 flex-col justify-start sm:mt-35 lg:mt-40">
          <div className="flex w-full justify-start">
            <motion.img
              src={heroSectionHand}
              alt="Hand holding phone with Diafit app"
              className="h-auto w-auto max-w-full object-contain object-left sm:max-h-[60vh] lg:max-h-[75vh]"
              initial={{ x: -120, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />
          </div>
          
        </div>
        <div className="items-center  ">
          <h2 className=" text-2xl font-bold text-blue-700">Manage your diabetes
            <br /> with Ai-powered <br /> <span className="text-blue-500">insights</span></h2>
          <p className="mt-4 max-w-md  text-slate-600">
            Track glucose levels, get personalized meal plans, and receive intelligent health recommendations—all in one place.
          </p>
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
