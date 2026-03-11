"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";

const AUTO_SLIDE_INTERVAL_MS = 4000;

export interface FeatureSlide {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

const FEATURES: FeatureSlide[] = [
  {
    title: "Smart Glucose Tracking",
    description:
      "Log and monitor your blood glucose levels with AI-powered insights and trend analysis.",
    imageSrc: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
    imageAlt: "Person checking blood glucose with a monitor",
  },
  {
    title: "Personalized Meal Plans",
    description:
      "Get customized meal recommendations based on your glucose patterns and dietary preferences.",
    imageSrc: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
    imageAlt: "Healthy meal and vegetables",
  },
  {
    title: "Medication Reminders",
    description:
      "Never miss a dose with smart reminders and medication tracking.",
    imageSrc: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
    imageAlt: "Medication and pill organizer",
  },
  {
    title: "Advanced Analytics",
    description:
      "Visualize your health data with comprehensive charts and reports.",
    imageSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    imageAlt: "Charts and analytics dashboard",
  },
  {
    title: "AI Health Insights",
    description:
      "Receive intelligent recommendations to improve your diabetes management.",
    imageSrc: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    imageAlt: "Person using health app on phone",
  },
  {
    title: "Care Team Sharing",
    description:
      "Share your data with doctors and family members securely.",
    imageSrc: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
    imageAlt: "Doctor and patient consultation",
  },
];

const GAP = 24;

export function FeaturesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const getScrollAmount = useCallback(() => {
    if (!scrollRef.current) return 340 + GAP;
    const card = scrollRef.current.querySelector("[data-slide]");
    return (card?.clientWidth ?? 340) + GAP;
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!scrollRef.current) return;
      const amount = getScrollAmount();
      const maxScroll = (FEATURES.length - 1) * amount;
      const left = Math.min(index * amount, maxScroll);
      scrollRef.current.scrollTo({ left, behavior: "smooth" });
      setCurrentIndex(index);
    },
    [getScrollAmount]
  );

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = getScrollAmount();
    if (direction === "right") {
      const next = currentIndex >= FEATURES.length - 1 ? 0 : currentIndex + 1;
      scrollToIndex(next);
    } else {
      const next = currentIndex <= 0 ? FEATURES.length - 1 : currentIndex - 1;
      scrollToIndex(next);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const amount = getScrollAmount();
      const index = Math.round(el.scrollLeft / amount);
      setCurrentIndex(Math.min(index, FEATURES.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [getScrollAmount]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      const next = currentIndex >= FEATURES.length - 1 ? 0 : currentIndex + 1;
      scrollToIndex(next);
    }, AUTO_SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPaused, currentIndex, scrollToIndex]);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 pt-2 scroll-smooth"
        style={{
          scrollbarWidth: "thin",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {FEATURES.map((feature, index) => (
          <div
            key={index}
            data-slide
            className="flex w-[min(340px,85vw)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md transition-shadow hover:shadow-lg"
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <Image
                src={feature.imageSrc}
                alt={feature.imageAlt}
                fill
                className="object-cover"
                sizes="340px"
              />
            </div>
            <div className="flex flex-col p-5">
              <h3 className="text-xl font-semibold text-slate-800">{feature.title}</h3>
              <p className="mt-2 text-slate-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Previous feature"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scroll("right")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
          aria-label="Next feature"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
