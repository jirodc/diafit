import { useEffect, useState, lazy, Suspense } from "react";

const Lanyard = lazy(() => import("@/components/Lanyard").then((m) => ({ default: m.default })));

const CARD_GLB = "/lanyard/card.glb";
const LANYARD_PNG = "/lanyard/lanyard.png";

export default function LanyardSection() {
  const [assetsReady, setAssetsReady] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(CARD_GLB, { method: "HEAD" }).then((r) => r.ok),
      fetch(LANYARD_PNG, { method: "HEAD" }).then((r) => r.ok),
    ])
      .then(([cardOk, pngOk]) => {
        if (!cancelled) setAssetsReady(cardOk && pngOk);
      })
      .catch(() => {
        if (!cancelled) setAssetsReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (assetsReady === null) {
    return (
      <div className="absolute inset-0 z-0 flex h-full items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!assetsReady) {
    return (
      <div className="absolute inset-0 z-0 flex h-full items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="font-medium text-slate-800">3D Lanyard placeholder</p>
          <p className="mt-2 text-sm text-slate-600">
            Add <code className="rounded bg-slate-100 px-1">card.glb</code> and{" "}
            <code className="rounded bg-slate-100 px-1">lanyard.png</code> to{" "}
            <code className="rounded bg-slate-100 px-1">public/lanyard/</code> to
            see the interactive badge. See{" "}
            <a
              href="https://vercel.com/blog/building-an-interactive-3d-event-badge-with-react-three-fiber"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Vercel’s 3D badge post
            </a>{" "}
            for the concept; assets are typically in a repo’s{" "}
            <code className="rounded bg-slate-100 px-1">src/assets/lanyard</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 h-full">
      <Suspense fallback={<div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">Loading…</div>}>
        <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
      </Suspense>
    </div>
  );
}
