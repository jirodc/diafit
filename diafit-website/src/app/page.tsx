import Link from "next/link";
import Image from "next/image";
import { GetStartedButton } from "@/components/GetStartedButton";
import Threads from "@/components/Threads";
import SpotlightCard from "@/components/SpotlightCard";
import TextType from "@/components/TextType";
import { FeaturesCarousel } from "@/components/FeaturesCarousel";

const HERO_HEARTBEAT_COLOR: [number, number, number] = [0.88, 0.18, 0.18];

export default function Home() {
  return (
    <div>
      {/* Hero - heartbeat full-screen background, plain text on top */}
      <section className="relative flex min-h-screen min-w-full flex-col justify-center overflow-hidden bg-white lg:flex-row lg:items-center">
        <div className="absolute inset-0 z-0">
          <Threads
            color={HERO_HEARTBEAT_COLOR}
            amplitude={1.0}
            distance={0.06}
            enableMouseInteraction={false}
            className="absolute inset-0 size-full min-h-full min-w-full"
          />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
          <div className="flex max-w-xl flex-col">
            <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl lg:text-6xl">
              Manage Diabetes with{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  AI-Powered
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />
              </span>{" "}
              Insights
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              <TextType
                text={[
                  "Track glucose levels with confidence.",
                  "Get personalized meal plans.",
                  "Receive intelligent health recommendations.",
                  "All in one place.",
                ]}
                typingSpeed={75}
                pauseDuration={1500}
                deletingSpeed={50}
                showCursor
                cursorCharacter="|"
                cursorBlinkDuration={0.5}
                className="text-slate-600"
              />
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <GetStartedButton />
              <Link
                href="/about"
                className="inline-flex items-center rounded-lg border-2 border-blue-600 bg-white px-6 py-3 text-base font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="relative hidden aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl shadow-2xl lg:block lg:max-w-lg">
            <Image
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80"
              alt="Person checking health metrics on phone"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 0px, 512px"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features – Scroll Stack */}
      <section id="features" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              Everything You Need to Stay Healthy
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Powerful features designed to help you manage diabetes effectively
            </p>
          </div>
          {/* Replace src below with your Pinterest image URL (right‑click image on Pinterest → Copy image address) */}
          <div className="mt-10 mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
              alt="Stay healthy - diabetes management and wellness"
              width={800}
              height={500}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
        <div className="mt-12 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturesCarousel />
        </div>
      </section>

      {/* Lifestyle / imagery section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
            Live healthier, one day at a time
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">
            Join a community that understands. Track, learn, and thrive with Diafit.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80"
                alt="Healthy balanced meal"
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-4 left-4 text-sm font-medium text-white drop-shadow">
                Personalized meal plans
              </span>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80"
                alt="Glucose monitoring"
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-4 left-4 text-sm font-medium text-white drop-shadow">
                Smart glucose tracking
              </span>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-lg sm:col-span-2 lg:col-span-1">
              <Image
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"
                alt="Active lifestyle"
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-4 left-4 text-sm font-medium text-white drop-shadow">
                Your health, your way
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="bg-slate-100 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              How Diafit Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Simple steps to better health management
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
              <span className="text-5xl font-bold text-slate-200">01</span>
              <h3 className="mt-4 text-xl font-semibold text-slate-800">
                Track Your Data
              </h3>
              <p className="mt-2 text-slate-600">
                Log glucose readings, meals, medications, and activities in
                seconds.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-sm font-medium text-white">
                  ✓
                </span>
              </div>
            </SpotlightCard>
            <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
              <span className="text-5xl font-bold text-slate-200">02</span>
              <h3 className="mt-4 text-xl font-semibold text-slate-800">
                Get AI Insights
              </h3>
              <p className="mt-2 text-slate-600">
                Our AI analyzes your data and provides personalized
                recommendations.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-sm font-medium text-white">
                  ✓
                </span>
              </div>
            </SpotlightCard>
            <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
              <span className="text-5xl font-bold text-slate-200">03</span>
              <h3 className="mt-4 text-xl font-semibold text-slate-800">
                Improve Your Health
              </h3>
              <p className="mt-2 text-slate-600">
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

      {/* CTA */}
      <section className="bg-gradient-to-r from-violet-600 to-violet-700 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Take Control of Your Health?
          </h2>
          <p className="mt-4 text-lg text-violet-100">
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
