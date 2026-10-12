"use client";

import Image from "next/image";

import { FaWhatsapp, FaInstagram, FaTiktok } from "react-icons/fa";

import Link from "next/link";
import { useState } from "react";
export default function Home() {
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleContactSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setIsSubmitting(true);
    setSubmissionMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      companyName: formData.get("companyName"),
      enquiryType: formData.get("enquiryType"),
      message: formData.get("message"),
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("The API URL is not configured.");
      }

      const response = await fetch(
        `${apiUrl}/contact-enquiries`,
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

  return (
    <main className="min-h-screen overflow-hidden bg-[#002147] text-white">
      {/* =========================
          NAVBAR
      ========================== */}
      <header className="relative z-50 border-b border-white/10 bg-[#002147]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center text-[#f6c700]">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-11 w-11"
              >
                <path
                  d="M7 41V20L15 14V41"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M15 41V14L24 7V41"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M24 41V7L33 14V41"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M33 41V14L41 20V41"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M4 41H44"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
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

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <NavLink active>Home</NavLink>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#solutions">Solutions</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 md:flex"
              aria-label="Search"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>

            <Link
              href="/login"
              className="hidden rounded-lg border border-[#f6c700] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#f6c700] hover:text-[#002147] sm:block"
            >
              Sign In
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-[#f6c700] px-6 py-3 text-sm font-bold text-[#002147] shadow-[0_10px_30px_rgba(246,199,0,0.18)] transition duration-300 hover:-translate-y-1 hover:bg-[#ffd633]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* =========================
          HERO
      ========================== */}
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Construction image */}
        <div className="absolute inset-0">
          <Image
            src="/images/Plan your home project with clear and reliable estimates.jpg"
            alt="Construction site"
            fill
            priority
            className="object-cover"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[#002147]/75" />

          {/* Stronger left overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00172f] via-[#002147]/95 to-[#002147]/20" />

          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f4ead7] to-transparent" />
        </div>

        {/* Decorative grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
            `,
            backgroundSize: "70px 70px",
          }}
        />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
          {/* =====================
              LEFT CONTENT
          ====================== */}
          <div className="relative z-30">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/80 sm:text-sm">
                Construction Management Platform
              </p>
            </div>

            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.94] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block text-[#f6c700]">
                Build smarter.
              </span>

              <span className="mt-2 block text-white">
                Manage everything.
              </span>
            </h1>

            {/* Architectural underline */}
            <div className="relative mt-5 h-4 w-64">
              <div className="absolute left-0 top-1 h-2 w-60 -rotate-2 rounded-full bg-[#f6c700]" />
              <div className="absolute left-12 top-3 h-1 w-32 rotate-1 rounded-full bg-[#f6c700]/70" />
            </div>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              Aesthetics brings construction projects, workers, materials,
              expenses, suppliers, invoices, and site operations into one
              organized platform.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="group inline-flex items-center gap-3 rounded-lg bg-[#f6c700] px-8 py-4 font-bold text-[#002147] shadow-[0_15px_40px_rgba(246,199,0,0.2)] transition duration-300 hover:-translate-y-1 hover:bg-[#ffd633]"
              >
                Get Started

                <span className="text-xl transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <a
                href="#features"
                className="group inline-flex items-center gap-3 rounded-lg border border-[#f6c700]/70 bg-[#002147]/40 px-8 py-4 font-semibold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-[#f6c700] hover:text-[#002147]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">
                  ▶
                </span>

                Explore Platform
              </a>
            </div>

            {/* Feature indicators */}
            <div className="mt-12 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
              <HeroFeature
                icon=""
                title="Projects"
                description="Plan & track"
              />

              <HeroFeature
                icon=""
                title="Workers"
                description="Manage teams"
              />

              <HeroFeature
                icon=""
                title="Materials"
                description="Monitor stock"
              />

              <HeroFeature
                icon=""
                title="Finances"
                description="Control costs"
              />
            </div>
          </div>

          {/* =====================
              RIGHT CONSTRUCTION VISUAL
          ====================== */}
          <div className="relative min-h-[540px] lg:min-h-[620px]">
            {/* Main construction image */}
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
              <Image
                src="/images/WE BUILD IT FOR YOU!.jpg"
                alt="Active construction site with building, machinery and workers"
                fill
                priority
                className="object-cover transition duration-1000 hover:scale-105"
              />

              {/* Cinematic overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#002147]/60 via-transparent to-transparent" />

              <div className="absolute inset-0 bg-gradient-to-t from-[#002147]/70 via-transparent to-transparent" />
            </div>

            {/* Top label */}
            <div className="absolute left-6 top-6 z-20 rounded-full border border-white/20 bg-[#002147]/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
              Construction Operations
            </div>

            {/* Bottom information card */}
            <div className="absolute bottom-6 left-6 right-6 z-20 rounded-2xl border border-white/20 bg-[#002147]/85 p-5 shadow-2xl backdrop-blur-xl sm:left-8 sm:right-auto sm:w-[390px]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6c700] text-[#002147]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-6 w-6"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 21h18" />
                    <path d="M5 21V8l7-5 7 5v13" />
                    <path d="M9 21v-6h6v6" />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#f6c700]">
                    Built for the field
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    From construction site to business office.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/75">
                  Projects
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/75">
                  Workers
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/75">
                  Materials
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/75">
                  Finance
                </span>
              </div>
            </div>

            {/* Small yellow accent */}
            <div className="absolute -bottom-5 -right-5 hidden h-28 w-28 rounded-full border border-[#f6c700]/30 bg-[#f6c700]/10 lg:block" />
          </div>
        </div>
      </section>

      {/* =========================
          FEATURE CARDS
      ========================== */}
      <section
        id="features"
        className="relative bg-[#f4ead7] px-6 pb-24 pt-4 text-[#002147] lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="-mt-2 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              image="/images/download (1).jpg"
              icon=""
              title="Project Management"
              description="Plan, track and deliver projects on time and within budget."
            />

            <FeatureCard
              image="/images/download (2).jpg"
              icon=""
              title="Worker Management"
              description="Organize teams, assign tasks and track productivity."
            />

            <FeatureCard
              image="/images/Download a building materials store containing many tools and building materials_ For building store background or wallpaper for free.jpg"
              icon=""
              title="Material Inventory"
              description="Track materials, monitor stock and manage suppliers."
              ruby
            />

            <FeatureCard
              image="/images/50 Times Architects Outdid Themselves And Came Up With Something So Thoughtful That It Could Only Be Labeled As ‘Friendly Architecture’.jpg"
              icon=""
              title="Financial Control"
              description="Manage expenses, invoices and project profitability."
            />
          </div>
        </div>
      </section>

      {/* =========================
          SOLUTIONS
      ========================== */}
      <section
        id="solutions"
        className="bg-[#002147] px-6 py-24 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f6c700]">
              One connected platform
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl">
              From the construction site
              <span className="text-[#f6c700]"> to the office.</span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-white/60">
              Keep your projects, workers, materials, suppliers and finances
              connected in one place.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <SolutionCard
              number="01"
              title="Know what is happening"
              description="See project progress, worker activity and site operations without chasing information."
            />

            <SolutionCard
              number="02"
              title="Control your materials"
              description="Track what comes in, what goes out, current stock and what needs restocking."
            />

            <SolutionCard
              number="03"
              title="Control your finances"
              description="Connect expenses, invoices, payments and project performance."
            />
          </div>
        </div>
      </section>

      {/* =========================
          ABOUT
      ========================== */}
      <section
        id="about"
        className="bg-white px-6 py-24 text-[#002147] lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9b111e]">
                Why Aesthetics
              </p>

              <h2 className="mt-4 text-4xl font-black sm:text-5xl">
                Built around how construction actually works.
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-[#002147]/60">
                Construction businesses manage projects, people, materials,
                suppliers, expenses and payments every day. Aesthetics connects
                those operations into one organized platform.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4">
                <Stat value="24/7" label="Visibility" />
                <Stat value="1" label="Platform" />
                <Stat value="100%" label="Connected" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* =========================
          PRICING
      ========================== */}
      <section
        id="pricing"
        className="bg-[#f4ead7] px-6 py-24 text-[#002147] lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9b111e]">
              Simple, transparent pricing
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl">
              The right tools for every
              <span className="text-[#9b111e]"> construction business.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#002147]/65">
              Manage projects, teams, materials and finances from one
              connected platform. Choose a plan that suits your operations
              and scale as your business grows.
            </p>
          </div>

          <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
            {/* Starter */}
            <div className="flex flex-col rounded-2xl border border-[#002147]/10 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <p className="text-sm font-bold uppercase tracking-wider text-[#9b111e]">
                Starter
              </p>

              <h3 className="mt-4 text-2xl font-black">
                For small teams
              </h3>

              <p className="mt-3 min-h-12 text-sm leading-6 text-[#002147]/60">
                Get essential project and site operations organized.
              </p>

              <div className="mt-6 border-b border-[#002147]/10 pb-6">
                <p className="text-4xl font-black">
                  KES 4000
                </p>
                <p className="mt-2 text-sm text-[#002147]/50">
                  per site visit
                </p>
              </div>

              <ul className="mt-6 flex-1 space-y-4 text-sm text-[#002147]/80">
                <li>Project tracking</li>
                <li>Worker management</li>
                <li>Material inventory</li>
                <li>Expense recording</li>
                <li>Basic project reports</li>
              </ul>

              <Link
                href="/register?plan=starter"
                className="mt-8 block rounded-lg border border-[#002147] px-6 py-3.5 text-center text-sm font-bold transition hover:bg-[#002147] hover:text-white"
              >
                Get Started
              </Link>
            </div>

            {/* Professional */}
            <div className="relative flex flex-col rounded-2xl border-2 border-[#f6c700] bg-[#002147] p-7 text-white shadow-2xl transition duration-300 hover:-translate-y-1 lg:scale-[1.03]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#f6c700] px-5 py-1.5 text-xs font-black uppercase tracking-wider text-[#002147]">
                Recommended
              </div>

              <p className="mt-3 text-sm font-bold uppercase tracking-wider text-[#f6c700]">
                Professional
              </p>

              <h3 className="mt-4 text-2xl font-black">
                For growing businesses
              </h3>

              <p className="mt-3 min-h-12 text-sm leading-6 text-white/60">
                Gain stronger control over purchasing and project finances.
              </p>

              <div className="mt-6 border-b border-white/15 pb-6">
                <p className="text-4xl font-black text-[#f6c700]">
                  KES 6,500
                </p>
                <p className="mt-2 text-sm text-white/50">
                  per site visit
                </p>
              </div>

              <ul className="mt-6 flex-1 space-y-4 text-sm text-white/80">
                <li>Everything in Starter</li>
                <li>Purchase orders and suppliers</li>
                <li>Budget and expense tracking</li>
                <li>Invoices and payment records</li>
                <li>Role-based access</li>
                <li>Audit logs and financial reports</li>
              </ul>

              <Link
                href="/register?plan=professional"
                className="mt-8 block rounded-lg bg-[#f6c700] px-6 py-3.5 text-center text-sm font-black text-[#002147] transition hover:bg-[#ffd633]"
              >
                Choose Professional
              </Link>
            </div>

            {/* Enterprise */}
            <div className="flex flex-col rounded-2xl border border-[#002147]/10 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <p className="text-sm font-bold uppercase tracking-wider text-[#9b111e]">
                Enterprise
              </p>

              <h3 className="mt-4 text-2xl font-black">
                For larger contractors
              </h3>

              <p className="mt-3 min-h-12 text-sm leading-6 text-[#002147]/60">
                Tailored support for complex operations and multiple sites.
              </p>

              <div className="mt-6 border-b border-[#002147]/10 pb-6">
                <p className="text-4xl font-black">
                  Custom
                </p>
                <p className="mt-2 text-sm text-[#002147]/50">
                  contact us for a quote
                </p>
              </div>

              <ul className="mt-6 flex-1 space-y-4 text-sm text-[#002147]/80">
                <li>Professional plan capabilities</li>
                <li>Multi-site workflows</li>
                <li>Advanced reporting requirements</li>
                <li>Customized configuration</li>
                <li>Onboarding and training options</li>
                <li>Tailored support arrangements</li>
              </ul>

              <Link
                href="#contact"
                className="mt-8 block rounded-lg border border-[#9b111e] px-6 py-3.5 text-center text-sm font-bold text-[#9b111e] transition hover:bg-[#9b111e] hover:text-white"
              >
                Request a Quote
              </Link>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-6 text-[#002147]/50">
            Pricing is proposed and subject to confirmation. Available
            features, usage limits, onboarding costs and subscription terms
            should be confirmed before these plans are offered to customers.
          </p>
        </div>
      </section>


      {/* =========================
          CTA
      ========================== */}
      
<section
  id="contact"
  className="relative overflow-hidden bg-[#9b111e] px-6 py-20 lg:px-8"
>
  <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#f6c700]/20 blur-3xl" />

  <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-start">
    <div className="lg:sticky lg:top-10">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f6c700]">
        Contact our team
      </p>

      <h2 className="mt-4 text-4xl font-black text-white sm:text-5xl">
        Ready to build better?
      </h2>

      <p className="mt-6 max-w-xl text-base leading-8 text-white/80">
        Tell us about your construction business and what you need.
        Our team can help you explore the right solution for your
        projects, materials, workers and finances.
      </p>

      <div className="mt-8 space-y-4 text-sm text-white/90">
        <p>Construction project management</p>
        <p>Materials and supplier management</p>
        <p>Project expenses and financial control</p>
      </div>
    </div>

    <div className="rounded-2xl border border-white/15 bg-white p-6 text-[#002147] shadow-2xl sm:p-8">
      <h3 className="text-2xl font-black">Send us an enquiry</h3>

      <p className="mt-2 text-sm leading-6 text-[#002147]/60">
        Complete the form and we'll receive your message.
      </p>

      <form onSubmit={handleContactSubmit} className="mt-7 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-fullName" className="mb-2 block text-sm font-semibold">
              Full name *
            </label>
            <input
              id="contact-fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              maxLength={100}
              placeholder="Your full name"
              className="w-full rounded-lg border border-[#002147]/15 px-4 py-3 outline-none transition focus:border-[#9b111e] focus:ring-2 focus:ring-[#9b111e]/15"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold">
              Email address *
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-[#002147]/15 px-4 py-3 outline-none transition focus:border-[#9b111e] focus:ring-2 focus:ring-[#9b111e]/15"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-phone" className="mb-2 block text-sm font-semibold">
              Phone number
            </label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
              placeholder="+254 7XX XXX XXX"
              className="w-full rounded-lg border border-[#002147]/15 px-4 py-3 outline-none transition focus:border-[#9b111e] focus:ring-2 focus:ring-[#9b111e]/15"
            />
          </div>

          <div>
            <label htmlFor="contact-company" className="mb-2 block text-sm font-semibold">
              Company name
            </label>
            <input
              id="contact-company"
              name="companyName"
              type="text"
              autoComplete="organization"
              maxLength={150}
              placeholder="Your company"
              className="w-full rounded-lg border border-[#002147]/15 px-4 py-3 outline-none transition focus:border-[#9b111e] focus:ring-2 focus:ring-[#9b111e]/15"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-enquiryType" className="mb-2 block text-sm font-semibold">
            What can we help you with? *
          </label>
          <select
            id="contact-enquiryType"
            name="enquiryType"
            required
            defaultValue="general"
            className="w-full rounded-lg border border-[#002147]/15 bg-white px-4 py-3 outline-none transition focus:border-[#9b111e] focus:ring-2 focus:ring-[#9b111e]/15"
          >
            <option value="general">General enquiry</option>
            <option value="demo">Request a product demo</option>
            <option value="pricing">Pricing information</option>
            <option value="enterprise">Enterprise solution</option>
          </select>
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold">
            Your message *
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            minLength={5}
            maxLength={3000}
            rows={5}
            placeholder="Tell us about your construction business and what you're looking for..."
            className="w-full resize-y rounded-lg border border-[#002147]/15 px-4 py-3 outline-none transition focus:border-[#9b111e] focus:ring-2 focus:ring-[#9b111e]/15"
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

        <p className="text-xs leading-5 text-[#002147]/50">
          Fields marked with * are required. Your enquiry will be sent
          securely to our application server for processing.
        </p>
      </form>
    </div>
  </div>
</section>

 
      {/* =========================
          FOOTER
      ========================== */}
      <footer className="bg-[#00172f] px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black tracking-wide text-white">
              AESTHETICS
            </p>

            <p className="mt-1 text-xs text-white/50">
              Construction Management Platform
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/254758475640"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Aesthetics on WhatsApp"
              title="WhatsApp"
              className="rounded-full border border-white/15 p-3 text-white/70 transition hover:border-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366]"
            >
              <FaWhatsapp size={20} />
            </a>

            <a
              href="https://www.instagram.com/YOUR_INSTAGRAM_USERNAME/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Aesthetics on Instagram"
              title="Instagram"
              className="rounded-full border border-white/15 p-3 text-white/70 transition hover:border-[#E4405F] hover:bg-[#E4405F]/10 hover:text-[#E4405F]"
            >
              <FaInstagram size={20} />
            </a>

            <a
              href="https://www.tiktok.com/@YOUR_TIKTOK_USERNAME"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Aesthetics on TikTok"
              title="TikTok"
              className="rounded-full border border-white/15 p-3 text-white/70 transition hover:border-white hover:bg-white/10 hover:text-white"
            >
              <FaTiktok size={19} />
            </a>
          </div>
          
<div className="mx-auto mt-6 flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-sm text-white/60 sm:justify-start">
  <a href="/terms" className="transition hover:text-[#f6c700]">
    Terms and Conditions
  </a>
  <a href="/privacy" className="transition hover:text-[#f6c700]">
    Privacy Policy
  </a>
  <a href="/cookies" className="transition hover:text-[#f6c700]">
    Cookie Policy
  </a>
</div>


          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Aesthetics. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* =========================
   NAV LINK
========================= */

function NavLink({
  children,
  href,
  active = false,
}: {
  children: React.ReactNode;
  href?: string;
  active?: boolean;
}) {
  const content = (
    <span
      className={`relative py-7 text-sm font-medium transition ${
        active
          ? "text-[#f6c700]"
          : "text-white/75 hover:text-white"
      }`}
    >
      {children}

      {active && (
        <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-[#f6c700]" />
      )}
    </span>
  );

  if (!href) {
    return <div>{content}</div>;
  }

  return <a href={href}>{content}</a>;
}

/* =========================
   HERO FEATURE
========================= */

function HeroFeature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#f6c700] text-lg text-[#f6c700] transition duration-300 group-hover:bg-[#f6c700] group-hover:text-[#002147]">
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold text-white">{title}</p>

        <p className="mt-0.5 text-[11px] text-white/45">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================
   FEATURE CARD
========================= */

function FeatureCard({
  image,
  icon,
  title,
  description,
  ruby = false,
}: {
  image: string;
  icon: string;
  title: string;
  description: string;
  ruby?: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-[#002147]/10 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative h-32 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-[#002147]/30" />

        <div
          className={`absolute bottom-0 left-6 flex h-12 w-12 translate-y-1/2 items-center justify-center rounded-full border-4 border-white text-lg font-bold shadow-lg ${
            ruby
              ? "bg-[#9b111e] text-white"
              : "bg-[#f6c700] text-[#002147]"
          }`}
        >
          {icon}
        </div>
      </div>

      <div className="p-6 pt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-black">{title}</h3>

            <p className="mt-2 text-sm leading-6 text-[#002147]/55">
              {description}
            </p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4ead7] text-lg transition group-hover:bg-[#f6c700]">
            →
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   SOLUTION CARD
========================= */

function SolutionCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#f6c700]/40 hover:bg-white/[0.07]">
      <p className="text-sm font-black text-[#f6c700]">{number}</p>

      <h3 className="mt-5 text-xl font-black text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-white/50">
        {description}
      </p>
    </div>
  );
}

/* =========================
   STAT
========================= */

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-[#002147]/10 bg-[#f4ead7] p-5">
      <p className="text-3xl font-black">{value}</p>

      <p className="mt-1 text-xs font-medium text-[#002147]/50">
        {label}
      </p>
    </div>
  );
}