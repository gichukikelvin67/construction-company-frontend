
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error("Password reset request failed:", err);
      setError(
        "We couldn't process your request right now. Please try again shortly."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4ead7] text-[#002147]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <section className="relative flex min-h-[240px] flex-col justify-between overflow-hidden bg-[#002147] px-7 py-8 text-white sm:px-12 sm:py-10 lg:min-h-screen lg:w-[45%] lg:px-16 lg:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 top-24 h-64 w-64 rotate-12 rounded-3xl border border-white/10 sm:h-80 sm:w-80"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 top-40 h-48 w-48 rotate-12 rounded-3xl border border-[#f6c700]/20 sm:h-64 sm:w-64"
          />

          <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border border-[#f6c700]/60 text-lg font-black text-[#f6c700]">
              A
            </span>
            <span>
              <span className="block text-sm font-black tracking-[0.22em]">
                AESTHETICS
              </span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-white/55">
                Construction management
              </span>
            </span>
          </Link>

          <div className="relative z-10 max-w-lg py-10 lg:py-0">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f6c700]">
              Account recovery
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Get back to
              <span className="block text-[#f6c700]">building.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65 sm:text-base">
              A forgotten password shouldn't slow your work down. Request a
              secure reset link to regain access to your workspace.
            </p>
          </div>

          <p className="relative z-10 hidden text-xs text-white/40 lg:block">
            Plan with purpose. Build with confidence.
          </p>
        </section>

        <section className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10 lg:px-12">
          <div className="w-full max-w-md rounded-2xl border border-[#002147]/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,33,71,0.08)] sm:p-10">
            {!isSubmitted ? (
              <>
                <div className="mb-8">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b111e]">
                    Password assistance
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Forgot password?
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-[#002147]/60">
                    Enter the email address associated with your account. If
                    eligible, you’ll receive instructions to reset your
                    password.
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-[#9b111e]/20 bg-red-50 px-4 py-3 text-sm leading-6 text-[#9b111e]"
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="text-sm font-semibold">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                      className="mt-2 w-full rounded-xl border border-[#002147]/15 bg-[#fcfbf8] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#002147]/35 focus:border-[#9b111e] focus:bg-white focus:ring-4 focus:ring-[#9b111e]/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#9b111e] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#7f0e18] focus:outline-none focus:ring-4 focus:ring-[#9b111e]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Sending request..." : "Request reset link"}
                    {!isLoading && <span aria-hidden="true">→</span>}
                  </button>
                </form>
              </>
            ) : (
              <div aria-live="polite">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4ead7] text-2xl text-[#9b111e]">
                  ✓
                </div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight">
                  Check your email
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#002147]/65">
                  If an account matches that email address, password reset
                  instructions will be sent. Check your inbox and spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 text-sm font-semibold text-[#9b111e] transition hover:underline"
                >
                  Try another email address
                </button>
              </div>
            )}

            <div className="mt-8 border-t border-[#002147]/10 pt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-bold text-[#002147] transition hover:text-[#9b111e]"
              >
                ← Back to sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
