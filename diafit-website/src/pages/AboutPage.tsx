import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GetStartedButton } from "@/components/GetStartedButton";
import { ChevronDown } from "lucide-react";
import ChromaGrid from "@/components/ChromaGrid";

const TEAM = [
  { name: "Jiro L. Del Carmon", title: "UI/UX Developer", avatarUrl: "/team/Delcarmen.jpg" },
  { name: "John Bryan V. Cancel", title: "Project Manager", avatarUrl: "/team/Cancel.jpg" },
  { name: "John Brieyloo E. Umipon", title: "UI & Documentation", avatarUrl: "/team/Umipon.jpg" },
];

const CORE_VALUES = [
  {
    title: "Patient-Centered",
    description:
      "Everything we do is designed with our users' health and well-being in mind. We put people first in every feature and decision.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
    alt: "Patient-centered care",
  },
  {
    title: "Privacy & Security",
    description:
      "Your health data is protected with enterprise-grade encryption and HIPAA compliance. We never compromise on security.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
    alt: "Security and privacy",
  },
  {
    title: "Innovation",
    description:
      "We continuously improve our AI algorithms to provide better insights and recommendations for diabetes management.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    alt: "Innovation",
  },
];

const FAQ_ITEMS = [
  {
    q: "What is Diafit?",
    a: "Diafit is an AI-powered app that helps you track glucose, get personalized meal plans, and manage your diabetes with smart insights.",
  },
  {
    q: "How does Diafit work?",
    a: "You log your glucose readings, meals, and activities. Our AI analyzes your data and provides personalized recommendations and trends.",
  },
  {
    q: "What services does Diafit offer?",
    a: "We offer glucose tracking, meal planning, AI insights, health reports, and community support—all in one place.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your health data is encrypted and stored securely. We are committed to HIPAA compliance and never share your information without consent.",
  },
  {
    q: "What makes Diafit different?",
    a: "Diafit combines cutting-edge AI with a simple, user-friendly design so diabetes management fits into your life—not the other way around.",
  },
];

const HEALTH_TIPS = [
  {
    tag: "Diet",
    title: "Sustainable eating for better glucose control",
    description: "Discover meal planning tips that help stabilize blood sugar without feeling restrictive.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
    href: "/#services",
  },
  {
    tag: "Wellness",
    title: "Mindful habits for diabetes management",
    description: "Small daily habits that support your health goals and reduce stress.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
    href: "/#services",
  },
  {
    tag: "Exercise",
    title: "Stay active, your way",
    description: "Practical ways to move more and track how activity affects your numbers.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    href: "/#services",
  },
];

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, index) => (
        <div
          key={index}
          className="border-b border-slate-200 last:border-b-0"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between py-4 text-left font-medium text-slate-900 transition-colors hover:text-slate-700"
          >
            {item.q}
            <ChevronDown
              className={`h-5 w-5 flex-shrink-0 text-slate-500 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="pb-4 text-slate-600 text-sm leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us – Diafit";
    return () => {
      document.title = "Diafit – AI-Powered Diabetes Management";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero: full-width bg image + left overlay card (header overlays this) */}
      <section className="relative min-h-screen overflow-hidden bg-slate-800">
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-slate-900/40" />
        <div className="relative mx-auto flex min-h-[420px] max-w-6xl items-center px-4 pt-24 pb-16 sm:min-h-[480px] sm:pt-28 sm:px-6 lg:min-h-[520px] lg:px-8">
          <div className="max-w-xl">
            <p className="text-blue-300 text-sm font-medium">About Diafit</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Advancing health with accessible wellness
            </h1>
            <p className="mt-4 text-slate-200 leading-relaxed">
              We empower people with diabetes to live healthier, happier lives through
              AI-powered technology—so you can take control of your health with confidence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <GetStartedButton />
              <Link
                to="/#services"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro paragraph */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-slate-600 text-lg leading-relaxed">
            Founded on the belief that health should be accessible to all, Diafit was
            created to bridge the gap between expert health advice and everyday practice.
            Our journey began with a passion for wellness and a desire to make a positive
            impact on the lives of people managing diabetes.
          </p>
        </div>
      </section>

      {/* Our Core Values: text left, images right */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Our Core Values
          </h2>
          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-12">
              {CORE_VALUES.map((value, i) => (
                <div key={value.title}>
                  <h3 className="text-xl font-bold text-slate-900">{value.title}</h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {CORE_VALUES.map((value) => (
                <div
                  key={value.title}
                  className="overflow-hidden rounded-xl border border-slate-200 shadow-md"
                >
                  <img
                    src={value.image}
                    alt={value.alt}
                    className="h-48 w-full object-cover sm:h-56"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Expert Team: ChromaGrid with sky blue cards */}
      <section className="bg-[#FFFBEB] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Meet Our Expert Team
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            A dedicated team of developers and designers committed to your health and
            wellness journey.
          </p>
          <div className="mt-12" style={{ minHeight: "520px", position: "relative" }}>
            <ChromaGrid
              items={TEAM.map((member) => ({
                image: member.avatarUrl,
                title: member.name,
                subtitle: member.title,
                handle: `@${member.name.replace(/\s+/g, "").toLowerCase()}`,
                borderColor: "#93C5FD",
                gradient: "#B7D6FB",
              }))}
              radius={300}
              damping={0.45}
              fadeOut={0.6}
              ease="power3.out"
              lightBackground
            />
          </div>
        </div>
      </section>

      {/* Quote + doctor image */}
      <section className="bg-[#FFFBEB] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 rounded-2xl bg-white p-8 shadow-md sm:p-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <blockquote className="text-slate-700 text-lg leading-relaxed sm:text-xl">
                &ldquo;Eating a balanced diet rich in whole foods is crucial for
                maintaining optimal health and wellness. Proper nutrition not only fuels
                our bodies but also plays a significant role in preventing chronic
                diseases.&rdquo;
              </blockquote>
              <p className="mt-4 text-slate-500 text-sm">— Diafit Health Team</p>
              <Link
                to="/#services"
                className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-700"
              >
                Read more →
              </Link>
            </div>
            <div className="overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80"
                alt="Healthcare professional"
                className="h-72 w-full object-cover sm:h-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ: two columns */}
      <section id="faqs" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="lg:col-span-8">
              <FAQAccordion />
            </div>
          </div>
        </div>
      </section>

      {/* Health Tips & Insights */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Health Tips & Insights
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Additional educational resources for optimal health & wellness.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {HEALTH_TIPS.map((tip) => (
              <Link
                key={tip.title}
                to={tip.href}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={tip.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600 text-xs font-medium">
                    {tip.tag}
                  </span>
                  <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-blue-600">
                    {tip.title}
                  </h3>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                    {tip.description}
                  </p>
                  <span className="mt-3 inline-block font-medium text-blue-600 text-sm group-hover:underline">
                    Learn More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
