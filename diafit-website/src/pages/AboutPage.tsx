import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Heart, Shield, Sparkles } from "lucide-react";

const SKY_BLUE = "#B7D6FB";

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
    icon: Heart,
  },
  {
    title: "Privacy & Security",
    description:
      "Your health data is protected with enterprise-grade encryption and HIPAA compliance. We never compromise on security.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
    alt: "Security and privacy",
    icon: Shield,
  },
  {
    title: "Innovation",
    description:
      "We continuously improve our AI algorithms to provide better insights and recommendations for diabetes management.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    alt: "Innovation",
    icon: Sparkles,
  },
];

const FAQ_ITEMS = [
  { q: "What is Diafit?", a: "Diafit is an AI-powered app that helps you track glucose, get personalized meal plans, and manage your diabetes with smart insights." },
  { q: "How does Diafit work?", a: "You log your glucose readings, meals, and activities. Our AI analyzes your data and provides personalized recommendations and trends." },
  { q: "What services does Diafit offer?", a: "We offer glucose tracking, meal planning, AI insights, health reports, and community support—all in one place." },
  { q: "Is my data secure?", a: "Yes. Your health data is encrypted and stored securely. We are committed to HIPAA compliance and never share your information without consent." },
  { q: "What makes Diafit different?", a: "Diafit combines cutting-edge AI with a simple, user-friendly design so diabetes management fits into your life—not the other way around." },
];

const HEALTH_TIPS = [
  { tag: "Diet", title: "Sustainable eating for better glucose control", description: "Discover meal planning tips that help stabilize blood sugar without feeling restrictive.", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80", href: "/#services" },
  { tag: "Wellness", title: "Mindful habits for diabetes management", description: "Small daily habits that support your health goals and reduce stress.", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80", href: "/#services" },
  { tag: "Exercise", title: "Stay active, your way", description: "Practical ways to move more and track how activity affects your numbers.", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80", href: "/#services" },
];

const STATS = [
  { value: "12K+", label: "Active users" },
  { value: "50K+", label: "Readings logged" },
  { value: "98%", label: "Satisfaction" },
];

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, index) => (
        <div key={index} className="border-b border-slate-200 last:border-b-0">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between py-4 text-left font-medium text-slate-900 transition-colors hover:text-slate-700"
          >
            {item.q}
            <ChevronDown className={`h-5 w-5 flex-shrink-0 text-slate-500 transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-200 ${openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
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
    return () => { document.title = "Diafit – AI-Powered Diabetes Management"; };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Template 2: Thin sky blue bar at top */}
      <div className="h-2 w-full" style={{ backgroundColor: SKY_BLUE }} />

      {/* Template 1: Hero – dark background, centered headline */}
      <section className="relative min-h-[50vh] overflow-hidden bg-slate-800">
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="relative flex min-h-[50vh] flex-col items-center justify-center px-4 py-24 text-center sm:py-28">
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            We&apos;re designing a new way to manage diabetes
          </h1>
        </div>
      </section>

      {/* Template 1: Full-width team / focus image */}
      <section className="relative w-full">
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80"
          alt="Health and wellness"
          className="h-[320px] w-full object-cover sm:h-[400px]"
        />
      </section>

      {/* Template 1: Stats bar – sky blue, 3 metrics */}
      <section className="flex w-full flex-col sm:flex-row" style={{ backgroundColor: SKY_BLUE }}>
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-1 flex-col items-center justify-center py-8 text-white ${i < STATS.length - 1 ? "border-b border-white/40 sm:border-b-0 sm:border-r sm:border-white/40" : ""}`}
          >
            <span className="text-3xl font-bold sm:text-4xl">{stat.value}</span>
            <span className="mt-1 text-sm font-medium opacity-90">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Template 2: Our Story – white, serif title, body, signature */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Our Story
          </h2>
          <div className="mt-12 space-y-6 text-left text-slate-800 leading-relaxed">
            <p>
              Founded on the belief that <strong>health should be accessible to all</strong>, Diafit was
              created to bridge the gap between expert health advice and everyday practice.
              Our journey began with a passion for wellness and a desire to make a positive
              impact on the lives of people managing diabetes.
            </p>
            <p>
              We empower people with diabetes to live healthier, happier lives through
              AI-powered technology—so you can take control of your health with confidence.
            </p>
          </div>
          <div className="mt-10 text-left">
            <p className="text-slate-700 text-sm">The Diafit Team</p>
            <p className="font-serif text-2xl italic text-slate-800">Diafit</p>
          </div>
        </div>
      </section>

      {/* Template 2/3: Statement block – light gray-blue, centered */}
      <section className="bg-slate-100 py-16 sm:py-20" style={{ backgroundColor: "#e8f0f8" }}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xl font-bold text-slate-900 sm:text-2xl">
            We are building tools so you can manage diabetes on your terms—anytime, anywhere.
          </p>
        </div>
      </section>

      {/* Template 3: Headline + three images with faded edges */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Our focus: your health
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            From tracking to insights, we keep the big picture in view.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {CORE_VALUES.map((value) => (
              <div key={value.title} className="overflow-hidden">
                <div
                  className="aspect-[4/3] w-full object-cover"
                  style={{
                    maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
                  }}
                >
                  <img src={value.image} alt={value.alt} className="h-full w-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template 4: Three columns – sky blue icon, title, description */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            What do we value? All sorts of things.
          </h2>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {CORE_VALUES.map((value) => (
              <div key={value.title} className="flex flex-col items-center text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: SKY_BLUE }}
                >
                  <value.icon className="h-8 w-8 text-slate-800" strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{value.title}</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link
              to="/#services"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: SKY_BLUE }}
            >
              Explore our features
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Template 5: Team grid – circular photo, name, role (sky blue) */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
            What do we value? Our team.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            A dedicated team committed to your health and wellness journey.
          </p>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center">
                <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-slate-100 bg-slate-100">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-blue-600">
                  {member.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote + doctor image – kept, cleaner card */}
      <section className="bg-slate-50 py-16 sm:py-20">
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
              <Link to="/#services" className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-700">
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

      {/* FAQ */}
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

      {/* Health Tips & Insights – kept */}
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
                  <img src={tip.image} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600 text-xs font-medium">{tip.tag}</span>
                  <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-blue-600">{tip.title}</h3>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">{tip.description}</p>
                  <span className="mt-3 inline-block font-medium text-blue-600 text-sm group-hover:underline">Learn More →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Template 6: CTA – light gray, centered, sky blue button */}
      <section className="bg-slate-100 py-16 sm:py-20" style={{ backgroundColor: "#f8fafc" }}>
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Want to be part of the journey?
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            We are always open to connecting with people who want to help shape the future of diabetes care.
          </p>
          <div className="mt-8">
            <Link
              to="/#download"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 font-medium text-slate-800 transition-opacity hover:opacity-90"
              style={{ backgroundColor: SKY_BLUE }}
            >
              Get Started
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
