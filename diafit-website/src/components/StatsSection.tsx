"use client";

import ScrollVelocity from "./ScrollVelocity";

export function StatsSection() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollVelocity
          texts={["DIAFIT", "Scroll Down"]}
          velocity={100}
          className="text-white font-bold"
          parallaxClassName="py-4"
          scrollerClassName="!text-3xl md:!text-5xl lg:!text-6xl text-white"
        />
      </div>
    </section>
  );
}
