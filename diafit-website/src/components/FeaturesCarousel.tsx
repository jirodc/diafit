import { useRef, useEffect, useState, useCallback } from "react";

/** Pixels to scroll per tick for right-to-left auto movement */
const AUTO_SCROLL_PX_PER_TICK = 1;
const AUTO_SCROLL_TICK_MS = 30;

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

interface FeaturesCarouselProps {
  variant?: "light" | "dark";
}

export function FeaturesCarousel({ variant = "light" }: FeaturesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDark = variant === "dark";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const getScrollAmount = useCallback(() => {
    if (!scrollRef.current) return 340 + GAP;
    const card = scrollRef.current.querySelector("[data-slide]");
    return (card?.clientWidth ?? 340) + GAP;
  }, []);

  /** Width of one full set of slides (used to loop seamlessly) */
  const getOneSetWidth = useCallback(() => {
    return getScrollAmount() * FEATURES.length;
  }, [getScrollAmount]);

  const scrollToIndex = useCallback(
    (index: number, useSecondSet?: boolean) => {
      if (!scrollRef.current) return;
      const amount = getScrollAmount();
      const oneSet = getOneSetWidth();
      const slideIndex = index % FEATURES.length;
      const baseLeft = slideIndex * amount;
      const left = useSecondSet ? oneSet + baseLeft : baseLeft;
      scrollRef.current.scrollTo({ left, behavior: "smooth" });
      setCurrentIndex(slideIndex);
    },
    [getScrollAmount, getOneSetWidth]
  );

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const oneSet = getOneSetWidth();
    const inSecondSet = scrollRef.current.scrollLeft >= oneSet * 0.5;
    if (direction === "right") {
      const next = currentIndex >= FEATURES.length - 1 ? 0 : currentIndex + 1;
      scrollToIndex(next, inSecondSet);
    } else {
      const next = currentIndex <= 0 ? FEATURES.length - 1 : currentIndex - 1;
      scrollToIndex(next, inSecondSet);
    }
  };

  // Sync currentIndex from scroll position (for dots/buttons)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const amount = getScrollAmount();
      const rawIndex = el.scrollLeft / amount;
      const indexInSet = Math.round(rawIndex % FEATURES.length);
      setCurrentIndex(indexInSet);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [getScrollAmount]);

  // Continuous right-to-left auto scroll (looping)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isPaused) return;
    const oneSetWidth = getOneSetWidth();
    if (oneSetWidth <= 0) return;
    const id = setInterval(() => {
      if (!el) return;
      const nextLeft = el.scrollLeft + AUTO_SCROLL_PX_PER_TICK;
      if (nextLeft >= oneSetWidth) {
        el.scrollLeft = nextLeft - oneSetWidth;
      } else {
        el.scrollLeft = nextLeft;
      }
    }, AUTO_SCROLL_TICK_MS);
    return () => clearInterval(id);
  }, [isPaused, getOneSetWidth]);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 pt-2"
        style={{
          scrollbarWidth: "none",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {[...FEATURES, ...FEATURES].map((feature, index) => (
          <div
            key={index}
            data-slide
            className={`flex w-[min(340px,85vw)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-xl ${
              isDark
                ? "border border-white/15 bg-gray-800/70"
                : "border border-slate-200/80 bg-white hover:shadow-lg"
            }`}
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="screen-3d-card p-2 pt-3">
              <div className="screen-3d-card-inner relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={feature.imageSrc}
                  alt={feature.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col p-5">
              <h3 className={`text-xl font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>{feature.title}</h3>
              <p className={`mt-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Previous feature"
          className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-colors ${
            isDark
              ? "border border-white/20 bg-gray-700/80 text-white hover:bg-gray-600/80"
              : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scroll("right")}
          className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-colors ${
            isDark
              ? "border border-white/20 bg-gray-700/80 text-white hover:bg-gray-600/80"
              : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
          }`}
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
