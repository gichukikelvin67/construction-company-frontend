
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (!acceptedTerms) {
      setMessage("Please accept the Terms and Conditions to continue.");
      return;
    }

    const normalizedPhone = form.phone.trim();

    if (!/^(?:\+254|0)7\d{8}$/.test(normalizedPhone)) {
      setMessage("Enter a valid Kenyan phone number, such as 0712345678.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 100) {
      setMessage("Your password must contain between 8 and 100 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/register", {
        ...form,
        companyName: form.companyName.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: normalizedPhone,
        acceptedTerms:true,
      });

      setIsSuccess(true);
      setMessage(
        response.data?.message ||
          "Your account has been created. Check your email to verify your account."
      );

      setForm({
        companyName: "",
        name: "",
        email: "",
        phone: "",
        password: "",
      });
      setAcceptedTerms(false);
    } catch (error: unknown) {
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : null;

      setMessage(
        apiMessage || "Registration failed. Please check your details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#002147]/15 bg-white px-4 py-3 text-sm text-[#002147] outline-none transition placeholder:text-[#002147]/35 focus:border-[#9b111e] focus:ring-2 focus:ring-[#9b111e]/10";

  return (
    <main className="min-h-screen bg-[#f4ead7] px-5 py-10 text-[#002147] sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <Link href="/" className="text-lg font-black tracking-wider">
            AESTHETICS
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold transition hover:text-[#9b111e]"
          >
            Already registered? Sign in
          </Link>
        </header>

        <div className="grid overflow-hidden rounded-3xl border border-[#002147]/10 bg-white shadow-xl lg:grid-cols-2">
          <section className="flex flex-col justify-between bg-[#002147] p-8 text-white sm:p-12 lg:p-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f6c700]">
                Construction management platform
              </p>
              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">
                Build with clarity. Manage with confidence.
              </h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-white/70">
                Create your company account to get started with Aesthetics.
                Keep your construction operations, teams and business records
                organized in one place.
              </p>
            </div>

            <div className="mt-12 border-t border-white/15 pt-6">
              <p className="text-sm font-semibold text-[#f6c700]">
                Secure account setup
              </p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                We will ask you to verify your email after registration.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b111e]">
              Get started
            </p>
            <h2 className="mt-3 text-3xl font-black">Create your account</h2>
            <p className="mt-3 text-sm leading-6 text-[#002147]/60">
              Enter your company and account details below.
            </p>

            {message && (
              <div
                role="alert"
                className={`mt-6 rounded-xl border p-4 text-sm leading-6 ${
                  isSuccess
                    ? "border-green-700/20 bg-green-50 text-green-900"
                    : "border-[#9b111e]/20 bg-red-50 text-[#9b111e]"
                }`}
              >
                {message}
                {isSuccess && (
                  <p className="mt-3">
                    <Link href="/login" className="font-bold underline">
                      Continue to sign in
                    </Link>
                  </p>
                )}
              </div>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="companyName" className="text-sm font-semibold">
                    Company name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    autoComplete="organization"
                    required
                    minLength={2}
                    maxLength={150}
                    value={form.companyName}
                    onChange={(event) =>
                      updateField("companyName", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Your construction company"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="text-sm font-semibold">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-semibold">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className={inputClass}
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="text-sm font-semibold">
                    Kenyan phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    className={inputClass}
                    placeholder="0712345678 or +254712345678"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="text-sm font-semibold">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={100}
                      value={form.password}
                      onChange={(event) =>
                        updateField("password", event.target.value)
                      }
                      className={`${inputClass} pr-20`}
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9b111e]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-[#f4ead7]/60 p-4">
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      required
                      className="mt-1 h-4 w-4 shrink-0 accent-[#9b111e]"
                    />
                    <span>
                      I have read and agree to the{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        className="font-bold text-[#9b111e] underline"
                      >
                        Terms and Conditions
                      </Link>
                      , and acknowledge the{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="font-bold text-[#9b111e] underline"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                  <p className="ml-7 mt-2 text-xs leading-5 text-[#002147]/55">
                    Read our{" "}
                    <Link
                      href="/cookies"
                      target="_blank"
                      className="underline hover:text-[#9b111e]"
                    >
                      Cookie Policy
                    </Link>
                    {" "}to learn about cookies and similar technologies.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#9b111e] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#7f0e18] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating account..." : "Create company account"}
                </button>

                
              </form>
            )}
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-[#002147]/50">
          © {new Date().getFullYear()} Aesthetics. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
