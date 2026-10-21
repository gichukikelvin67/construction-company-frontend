"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  HardHat,
  Menu,
  Package,
  Search,
  Wallet,
  X,
} from "lucide-react";

type EnquiryPayload = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  enquiryType: string;
  message: string;
};

const features = [
  {
    title: "Project Management",
    description:
      "Plan projects, track progress, and keep your construction work organized.",
    image: "/images/download (1).jpg",
    icon: ClipboardList,
  },
  {
    title: "Worker Management",
    description:
      "Organize teams, assign responsibilities, and monitor site activities.",
    image: "/images/download (2).jpg",
    icon: HardHat,
  },
  {
    title: "Material Inventory",
    description:
      "Track stock, manage suppliers, and monitor materials used on site.",
    image:
      "/images/Download a building materials store containing many tools and building materials_ For building store background or wallpaper for free.jpg",
    icon: Package,
  },
  {
    title: "Financial Control",
    description:
      "Record expenses, manage invoices, and understand project costs.",
    image:
      "/images/50 Times Architects Outdid Themselves And Came Up With Something So Thoughtful That It Could Only Be Labeled As ‘Friendly Architecture’.jpg",
    icon: Wallet,
  },
];

const solutions = [
  {
    number: "01",
    title: "Track your projects",
    description:
      "Monitor progress, organize tasks, and keep project information accessible.",
  },
  {
    number: "02",
    title: "Manage your materials",
    description:
      "Keep records of materials, stock movements, suppliers, and purchases.",
  },
  {
    number: "03",
    title: "Understand your finances",
    description:
      "Bring expenses, invoices, payments, and project budgets together.",
  },
];

const plans = [
  {
    name: "Starter",
    subtitle: "For small construction teams",
    price: "KES 4,000",
    priceDescription: "per site visit",
    features: [
      "Project tracking",
      "Worker management",
      "Material inventory",
      "Expense recording",
      "Basic project reports",
    ],
    button: "Get Started",
    href: "/register?plan=starter",
    featured: false,
  },
  {
    name: "Professional",
    subtitle: "For growing businesses",
    price: "KES 6,500",
    priceDescription: "per site visit",
    features: [
      "Everything in Starter",
      "Purchase orders and suppliers",
      "Budget and expense tracking",
      "Invoices and payment records",
      "Role-based access",
      "Financial reports",
    ],
    button: "Choose Professional",
    href: "/register?plan=professional",
    featured: true,
  },
  {
    name: "Enterprise",
    subtitle: "For larger contractors",
    price: "Custom",
    priceDescription: "contact us for a quote",
    features: [
      "Professional plan capabilities",
      "Multi-site workflows",
      "Advanced reporting",
      "Customized configuration",
      "Onboarding and training",
      "Tailored support",
    ],
    button: "Request a Quote",
    href: "#contact",
    featured: false,
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim().toLowerCase();

    if (!query) return;

    const sections = [
      { id: "features", terms: ["feature", "project", "worker", "material"] },
      { id: "solutions", terms: ["solution", "inventory", "finance", "supplier"] },
      { id: "about", terms: ["about", "company", "why"] },
      { id: "pricing", terms: ["price", "pricing", "plan", "cost"] },
      { id: "contact", terms: ["contact", "enquiry", "demo", "quote"] },
    ];

    const match = sections.find((section) =>
      section.terms.some((term) => term.includes(query) || query.includes(term))
    );

    if (match) {
      document.getElementById(match.id)?.scrollIntoView({
        behavior: "smooth",
      });
      setSearchOpen(false);
      setSearchQuery("");
    } else {
      setSubmissionSuccess(false);
      setSubmissionMessage(
        "No matching section found. Try projects, pricing, or contact."
      );
    }
  };

  const handleContactSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setIsSubmitting(true);
    setSubmissionMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload: EnquiryPayload = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      companyName: String(formData.get("companyName") ?? "").trim(),
      enquiryType: String(formData.get("enquiryType") ?? "general"),
      message: String(formData.get("message") ?? "").trim(),
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("The API URL is not configured.");
      }

      const response = await fetch(
        `${apiUrl.replace(/\/+$/, "")}/contact-enquiries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to submit your enquiry."
        );
      }

      setSubmissionSuccess(true);
      setSubmissionMessage(
        result.message || "Your enquiry has been received."
      );

      form.reset();
    } catch (error) {
      setSubmissionSuccess(false);
      setSubmissionMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#002147]">
      {/* Navigation */}
      <header className="relative z-50 border-b border-white/10 bg-[#002147]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center text-[#f6c700]">
              <Building2 size={38} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-xl font-black tracking-wide text-white">
                AESTHETICS
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Construction Management
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <a href="#home" className="text-sm font-semibold text-[#f6c700]">
              Home
            </a>
            <a href="#features" className="text-sm text-white/75 hover:text-white">
              Features
            </a>
            <a href="#solutions" className="text-sm text-white/75 hover:text-white">
              Solutions
            </a>
            <a href="#about" className="text-sm text-white/75 hover:text-white">
              About
            </a>
            <a href="#pricing" className="text-sm text-white/75 hover:text-white">
              Pricing
            </a>
            <a href="#contact" className="text-sm text-white/75 hover:text-white">
              Contact
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search sections"
              className="rounded-lg p-3 text-white hover:bg-white/10"
            >
              <Search size={20} />
            </button>

            <Link
              href="/login"
              className="rounded-lg border border-[#f6c700] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#f6c700] hover:text-[#002147]"
            >
              Sign In
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-[#f6c700] px-5 py-3 text-sm font-bold text-[#002147] transition hover:bg-[#ffd633]"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>

        {searchOpen && (
          <form
            onSubmit={handleSearch}
            className="absolute right-5 top-20 z-50 w-[calc(100%-2.5rem)] max-w-sm rounded-xl border border-white/15 bg-[#00172f] p-4 shadow-xl md:right-8"
          >
            <label
              htmlFor="landing-search"
              className="mb-2 block text-sm font-semibold text-white"
            >
              Search Aesthetics
            </label>

            <input
              id="landing-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Try projects, pricing, contact..."
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#f6c700]"
            />

            <button
              type="submit"
              className="mt-3 w-full rounded-lg bg-[#f6c700] px-4 py-2.5 text-sm font-bold text-[#002147]"
            >
              Search
            </button>
          </form>
        )}

        {menuOpen && (
          <nav className="absolute left-0 right-0 top-20 flex flex-col gap-1 border-t border-white/10 bg-[#002147] p-5 shadow-xl lg:hidden">
            {[
              ["Home", "#home"],
              ["Features", "#features"],
              ["Solutions", "#solutions"],
              ["About", "#about"],
              ["Pricing", "#pricing"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
              >
                {label}
              </a>
            ))}

            <Link
              href="/login"
              onClick={closeMenu}
              className="mt-2 rounded-lg bg-[#f6c700] px-4 py-3 text-center text-sm font-bold text-[#002147]"
            >
              Sign In
            </Link>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative isolate overflow-hidden bg-[#002147]"
      >
        <div className="absolute inset-0 -z-20">
          <Image
            src="/images/Plan your home project with clear and reliable estimates.jpg"
            alt="Construction project"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* A light overlay keeps the background photo visible. */}
        <div className="absolute inset-0 -z-10 bg-[#002147]/35" />

        <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white sm:text-sm">
              Construction Management Platform
            </p>

            <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block text-[#f6c700]">
                Build smarter.
              </span>
              <span className="mt-2 block text-white">
                Manage everything.
              </span>
            </h1>

            <div className="mt-6 h-1.5 w-24 rounded-full bg-[#f6c700]" />

            <p className="mt-7 max-w-xl text-base leading-8 text-white sm:text-lg">
              Aesthetics brings construction projects, workers, materials,
              expenses, suppliers, invoices, and site operations into one
              organized platform.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-3 rounded-lg bg-[#f6c700] px-7 py-4 font-bold text-[#002147] transition hover:bg-[#ffd633]"
              >
                Get Started
                <ArrowRight size={19} />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center gap-3 rounded-lg border border-white/70 bg-[#002147]/40 px-7 py-4 font-semibold text-white transition hover:bg-white hover:text-[#002147]"
              >
                Explore Platform
              </a>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { icon: ClipboardList, title: "Projects", text: "Plan and track" },
                { icon: HardHat, title: "Workers", text: "Manage teams" },
                { icon: Package, title: "Materials", text: "Monitor stock" },
                { icon: Wallet, title: "Finances", text: "Control costs" },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex items-center gap-3">
                    <Icon
                      size={25}
                      strokeWidth={1.8}
                      className="shrink-0 text-[#f6c700]"
                    />
                    <div>
                      <p className="text-sm font-bold text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-white/75">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

              
            </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="bg-[#f4ead7] px-5 py-20 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Everything in one place"
            title="Tools that keep your projects moving."
            description="Manage the essential parts of your construction business through one connected platform."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group overflow-hidden rounded-xl border border-[#002147]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#f4ead7] text-[#002147]">
                      <Icon size={23} />
                    </div>

                    <h3 className="text-lg font-black">{feature.title}</h3>

                    <p className="mt-3 text-sm leading-7 text-[#002147]/65">
                      {feature.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section
        id="solutions"
        className="bg-[#002147] px-5 py-20 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="One connected platform"
            title="From the construction site to the office."
            description="Keep project information, materials, suppliers, and finances connected."
            light
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {solutions.map((solution) => (
              <article
                key={solution.number}
                className="rounded-xl border border-white/15 bg-white/5 p-7 transition hover:border-[#f6c700]/60"
              >
                <p className="text-sm font-black text-[#f6c700]">
                  {solution.number}
                </p>

                <h3 className="mt-5 text-xl font-black">
                  {solution.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/70">
                  {solution.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-white px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9b111e]">
              Why Aesthetics
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Built around how construction actually works.
            </h2>
          </div>

          <div>
            <p className="text-lg leading-8 text-[#002147]/70">
              Construction businesses manage projects, people, materials,
              suppliers, expenses, and payments every day. Aesthetics brings
              these operations into one organized platform, helping businesses
              make informed decisions and maintain better records.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { value: "24/7", label: "Access" },
                { value: "1", label: "Platform" },
                { value: "360°", label: "Visibility" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-[#f4ead7] p-4 sm:p-5"
                >
                  <p className="text-2xl font-black sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs text-[#002147]/65 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="bg-[#f4ead7] px-5 py-20 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Pricing options"
            title="Choose a plan for your business."
            description="Explore the proposed plans and contact us to confirm available features, pricing, and terms."
          />

          <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-xl p-7 ${
                  plan.featured
                    ? "border-2 border-[#f6c700] bg-[#002147] text-white"
                    : "border border-[#002147]/10 bg-white text-[#002147]"
                }`}
              >
                {plan.featured && (
                  <span className="mb-5 w-fit rounded-full bg-[#f6c700] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#002147]">
                    Recommended
                  </span>
                )}

                <p
                  className={`text-sm font-bold uppercase tracking-wider ${
                    plan.featured ? "text-[#f6c700]" : "text-[#9b111e]"
                  }`}
                >
                  {plan.name}
                </p>

                <h3 className="mt-4 text-2xl font-black">
                  {plan.subtitle}
                </h3>

                <div
                  className={`mt-6 border-b pb-6 ${
                    plan.featured ? "border-white/20" : "border-[#002147]/10"
                  }`}
                >
                  <p
                    className={`text-3xl font-black ${
                      plan.featured ? "text-[#f6c700]" : ""
                    }`}
                  >
                    {plan.price}
                  </p>
                  <p
                    className={`mt-2 text-sm ${
                      plan.featured ? "text-white/65" : "text-[#002147]/60"
                    }`}
                  >
                    {plan.priceDescription}
                  </p>
                </div>

                <ul className="mt-6 flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-3 text-sm ${
                        plan.featured ? "text-white/85" : "text-[#002147]/75"
                      }`}
                    >
                      <span className="font-bold text-[#9b111e]">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-8 block rounded-lg px-5 py-3.5 text-center text-sm font-bold transition ${
                    plan.featured
                      ? "bg-[#f6c700] text-[#002147] hover:bg-[#ffd633]"
                      : "border border-[#002147] hover:bg-[#002147] hover:text-white"
                  }`}
                >
                  {plan.button}
                </Link>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-[#002147]/60">
            Prices and features are proposed and subject to confirmation.
            Confirm the final charges, usage limits, and service terms before
            offering these plans to customers.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="bg-[#9b111e] px-5 py-20 sm:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f6c700]">
              Contact our team
            </p>

            <h2 className="mt-4 text-4xl font-black text-white sm:text-5xl">
              Ready to build better?
            </h2>

            <p className="mt-6 max-w-xl leading-8 text-white/85">
              Tell us about your construction business and what you need.
              We can help you explore solutions for projects, materials,
              workers, and finances.
            </p>

            <div className="mt-8 space-y-4 text-sm text-white/90">
              <p>Construction project management</p>
              <p>Materials and supplier management</p>
              <p>Project expenses and financial control</p>
            </div>

            <a
              href="https://wa.me/254758475640"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-lg bg-white px-6 py-3.5 font-bold text-[#002147] transition hover:bg-[#f4ead7]"
            >
              <FaWhatsapp size={20} />
              Chat with us
            </a>
          </div>

          <div className="rounded-xl bg-white p-6 text-[#002147] shadow-xl sm:p-8">
            <h3 className="text-2xl font-black">Send us an enquiry</h3>

            <p className="mt-2 text-sm leading-6 text-[#002147]/65">
              Complete the form and our team will receive your message.
            </p>

            <form onSubmit={handleContactSubmit} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  id="contact-fullName"
                  label="Full name"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  maxLength={100}
                  required
                />

                <FormField
                  id="contact-email"
                  label="Email address"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  id="contact-phone"
                  label="Phone number"
                  name="phone"
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  autoComplete="tel"
                  maxLength={30}
                />

                <FormField
                  id="contact-company"
                  label="Company name"
                  name="companyName"
                  type="text"
                  placeholder="Your company"
                  autoComplete="organization"
                  maxLength={150}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-enquiryType"
                  className="mb-2 block text-sm font-semibold"
                >
                  What can we help you with?
                </label>

                <select
                  id="contact-enquiryType"
                  name="enquiryType"
                  defaultValue="general"
                  required
                  className="w-full rounded-lg border border-[#002147]/20 bg-white px-4 py-3 outline-none focus:border-[#9b111e]"
                >
                  <option value="general">General enquiry</option>
                  <option value="demo">Request a product demo</option>
                  <option value="pricing">Pricing information</option>
                  <option value="enterprise">Enterprise solution</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-semibold"
                >
                  Your message
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  required
                  minLength={5}
                  maxLength={3000}
                  rows={5}
                  placeholder="Tell us about your construction business..."
                  className="w-full resize-y rounded-lg border border-[#002147]/20 px-4 py-3 outline-none focus:border-[#9b111e]"
                />
              </div>

              {submissionMessage && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`rounded-lg p-3 text-sm ${
                    submissionSuccess
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {submissionMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[#f6c700] px-6 py-4 font-bold text-[#002147] transition hover:bg-[#ffd633] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending enquiry..." : "Send enquiry"}
              </button>

              <p className="text-xs leading-5 text-[#002147]/55">
                Your enquiry will be sent to our application server for
                processing.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#00172f] px-5 py-8 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black tracking-wide">AESTHETICS</p>
            <p className="mt-1 text-xs text-white/60">
              Construction Management Platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SocialLink
              href="https://wa.me/254758475640"
              label="WhatsApp"
            >
              <FaWhatsapp size={20} />
            </SocialLink>

            <SocialLink
              href="https://www.instagram.com/"
              label="Instagram"
            >
              <FaInstagram size={20} />
            </SocialLink>

            <SocialLink
              href="https://www.tiktok.com/"
              label="TikTok"
            >
              <FaTiktok size={19} />
            </SocialLink>
          </div>
        </div>

        <div className="mx-auto mt-6 flex max-w-7xl flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-sm text-white/60">
          <Link href="/terms" className="hover:text-[#f6c700]">
            Terms and Conditions
          </Link>
          <Link href="/privacy" className="hover:text-[#f6c700]">
            Privacy Policy
          </Link>
          <Link href="/cookies" className="hover:text-[#f6c700]">
            Cookie Policy
          </Link>
        </div>

        <p className="mx-auto mt-5 max-w-7xl text-xs text-white/45">
          © {new Date().getFullYear()} Aesthetics. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p
        className={`text-xs font-bold uppercase tracking-[0.25em] ${
          light ? "text-[#f6c700]" : "text-[#9b111e]"
        }`}
      >
        {eyebrow}
      </p>

      <h2
        className={`mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl ${
          light ? "text-white" : "text-[#002147]"
        }`}
      >
        {title}
      </h2>

      <p
        className={`mt-5 max-w-2xl text-base leading-8 ${
          light ? "text-white/70" : "text-[#002147]/65"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function FormField({
  id,
  label,
  name,
  type,
  placeholder,
  autoComplete,
  maxLength,
  required = false,
}: {
  id: string;
  label: string;
  name: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold"
      >
        {label}
        {required ? " *" : ""}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
        className="w-full rounded-lg border border-[#002147]/20 px-4 py-3 outline-none transition focus:border-[#9b111e]"
      />
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="rounded-full border border-white/20 p-3 text-white/75 transition hover:border-[#f6c700] hover:text-[#f6c700]"
    >
      {children}
    </a>
  );
}