"use client";

import { ArrowUpRight, CheckCircle2, Heart, Lock, Sparkles } from "lucide-react";
import { motion, useMotionValue, useTransform, type Variants } from "motion/react";
import { cx } from "@/lib/utils/cx";

interface BentoItem {
  id: string;
  title: string;
  description: string;
  feature: "spotlight" | "text" | "value";
  spotlightItems?: string[];
  className?: string;
}

const bentoItems: BentoItem[] = [
  {
    id: "about",
    title: "About Diafit",
    description:
      "Empowering people with diabetes to live healthier, happier lives through AI-powered technology.",
    feature: "spotlight",
    spotlightItems: [
      "Glucose tracking & insights",
      "Personalized meal plans",
      "AI health recommendations",
      "Smart data analytics",
      "Community support",
    ],
    className: "md:col-span-2",
  },
  {
    id: "mission",
    title: "Our Mission",
    description:
      "At Diafit, we believe that managing diabetes shouldn't be overwhelming. Our mission is to empower individuals with the tools, insights, and support they need to take control of their health. We combine cutting-edge AI technology with user-friendly design to make diabetes management simple, effective, and accessible to everyone.",
    feature: "text",
    className: "md:col-span-1",
  },
  {
    id: "value1",
    title: "Patient-Centered",
    description:
      "Everything we do is designed with our users' health and well-being in mind.",
    feature: "value",
    className: "md:col-span-1",
  },
  {
    id: "value2",
    title: "Privacy & Security",
    description:
      "Your health data is protected with enterprise-grade encryption and HIPAA compliance.",
    feature: "value",
    className: "md:col-span-1",
  },
  {
    id: "value3",
    title: "Innovation",
    description:
      "We continuously improve our AI algorithms to provide better insights and recommendations.",
    feature: "value",
    className: "md:col-span-1",
  },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const SpotlightFeature = ({ items }: { items: string[] }) => (
  <ul className="mt-3 space-y-2">
    {items.map((item, index) => (
      <motion.li
        key={item.toLowerCase().replace(/\s+/g, "-")}
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08 * index }}
      >
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
        <span className="text-slate-700 text-sm">{item}</span>
      </motion.li>
    ))}
  </ul>
);

const ValueIcon = ({ id }: { id: string }) => {
  if (id === "value1") return <Heart className="h-5 w-5 text-rose-500" />;
  if (id === "value2") return <Lock className="h-5 w-5 text-blue-600" />;
  return <Sparkles className="h-5 w-5 text-violet-500" />;
};

const BentoCard = ({ item }: { item: BentoItem }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [2, -2]);
  const rotateY = useTransform(x, [-100, 100], [-2, 2]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct * 100);
    y.set(yPct * 100);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className={cx("h-full", item.className)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      variants={fadeInUp}
      whileHover={{ y: -4 }}
    >
      <div
        className="group relative flex h-full flex-col gap-3 rounded-xl border border-slate-300/80 bg-white/95 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-300 hover:border-slate-400/60 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
        style={{ transform: "translateZ(16px)" }}
      >
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            {item.feature === "value" && (
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <ValueIcon id={item.id} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 text-lg tracking-tight">
                {item.title}
              </h3>
              <div className="mt-0.5 flex items-center text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>

          {item.feature === "spotlight" && item.spotlightItems && (
            <SpotlightFeature items={item.spotlightItems} />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export function BentoAboutDiafit() {
  return (
    <section className="relative overflow-hidden bg-[#B7D6FB] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center sm:mb-12"
        >
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            About <span className="text-blue-700">Diafit</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-700 text-lg">
            Empowering people with diabetes through AI-powered technology.
          </p>
        </motion.div>
        <motion.div
          className="grid gap-5 sm:gap-6"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-60px" }}
          whileInView="visible"
        >
          {/* Row 1: About Diafit (2 cols) + Our Mission (1 col) */}
          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            <motion.div className="md:col-span-2" variants={fadeInUp}>
              <BentoCard item={bentoItems[0]} />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <BentoCard item={bentoItems[1]} />
            </motion.div>
          </div>
          {/* Row 2: Our Values - 3 cards */}
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
            <motion.div variants={fadeInUp}>
              <BentoCard item={bentoItems[2]} />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <BentoCard item={bentoItems[3]} />
            </motion.div>
            <motion.div className="sm:col-span-2 md:col-span-1" variants={fadeInUp}>
              <BentoCard item={bentoItems[4]} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
