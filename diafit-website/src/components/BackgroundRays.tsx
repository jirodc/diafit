"use client";

import LightRays from "./LightRays";

/**
 * Full-viewport LightRays background for the site.
 * Fixed behind all content, soft violet/blue to match Diafit branding.
 */
export function BackgroundRays() {
  return (
    <div
      className="fixed inset-0 z-0"
      aria-hidden
    >
      <LightRays
        raysOrigin="top-center"
        raysColor="#a5b4fc"
        raysSpeed={0.6}
        lightSpread={1.2}
        rayLength={1.8}
        pulsating={false}
        fadeDistance={1.2}
        saturation={0.9}
        followMouse={true}
        mouseInfluence={0.12}
        noiseAmount={0}
        distortion={0}
        className="absolute inset-0 opacity-60"
      />
    </div>
  );
}
