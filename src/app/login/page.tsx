
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginUser({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setError("Unable to sign in. Check your email and password, then try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4ead7] text-[#002147]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        {/* Brand panel */}
        <section className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-[#002147] px-7 py-8 text-white sm:px-12 sm:py-10 lg:min-h-screen lg:w-[52%] lg:px-16 lg:py-12 xl:px-24">
          {/* Architectural line artwork */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rotate-12 rounded-3xl border border-white/10 sm:h-96 sm:w-96"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 top-40 h-56 w-56 rotate-12 rounded-3xl border border-[#f6c700]/20 sm:h-72 sm:w-72"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-20 left-1/4 h-px w-full bg-white/10"
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

          <div className="relative z-10 max-w-xl py-12 lg:py-0">
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-[#f6c700]">
              <span className="h-px w-9 bg-[#f6c700]" />
              Built for better projects
            </p>

            <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Every project.
              <span className="mt-2 block text-[#f6c700]">
                Under control.
              </span>
            </h1>

            <p className="mt-7 max-w-md text-sm leading-7 text-white/65 sm:text-base">
              Bring your construction operations together. Manage projects,
              coordinate teams and keep your business records organized in one
              place.
            </p>

            <div className="mt-10 grid max-w-md grid-cols-2 gap-4 border-t border-white/15 pt-6">
              <div>
                <p className="text-sm font-bold text-white">One workspace</p>
                <p className="mt-1 text-xs leading-5 text-white/50">
                  Your operations, connected
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Better visibility</p>
                <p className="mt-1 text-xs leading-5 text-white/50">
                  Make informed decisions
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 hidden text-xs text-white/40 lg:block">
            Plan with purpose. Build with confidence.
          </p>
        </section>

        {/* Sign-in panel */}
        <section className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b111e]">
                Aesthetics
              </p>
            </div>

            <div className="rounded-2xl border border-[#002147]/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,33,71,0.08)] sm:p-9">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b111e]">
                  Welcome back
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Sign in to Aesthetics
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#002147]/60">
                  Enter your account details to continue to your workspace.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-[#9b111e]/20 bg-red-50 px-4 py-3 text-sm leading-6 text-[#9b111e]"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    className="mt-2 w-full rounded-xl border border-[#002147]/15 bg-[#fcfbf8] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#002147]/35 focus:border-[#9b111e] focus:bg-white focus:ring-4 focus:ring-[#9b111e]/10"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-[#9b111e] transition hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative mt-2">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-[#002147]/15 bg-[#fcfbf8] px-4 py-3.5 pr-16 text-sm outline-none transition placeholder:text-[#002147]/35 focus:border-[#9b111e] focus:bg-white focus:ring-4 focus:ring-[#9b111e]/10"
                    />
                     <div className="flex items-center justify-between gap-3">
  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#002147]/75">
    <input
      type="checkbox"
      checked={rememberMe}
      onChange={(event) => setRememberMe(event.target.checked)}
      className="h-4 w-4 rounded border-[#002147]/25 accent-[#9b111e] focus:ring-[#9b111e]"
    />
    Remember me for 30 days
  </label>
</div>

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-4 text-xs font-bold text-[#002147]/60 transition hover:text-[#9b111e]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#9b111e] px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#7f0e18] focus:outline-none focus:ring-4 focus:ring-[#9b111e]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Signing you in..." : "Sign in to your account"}
                  {!isLoading && <span aria-hidden="true">→</span>}
                </button>
              </form>
              <button
  type="button"
  disabled={isGoogleLoading || isLoading}
  onClick={() => {
    setIsGoogleLoading(true);
    window.location.assign(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
    );
  }}
  className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-[#002147]/15 bg-white px-5 py-3.5 text-sm font-semibold transition hover:border-[#002147]/40 hover:bg-[#fcfbf8] disabled:cursor-not-allowed disabled:opacity-60"
>
  <span
    aria-hidden="true"
    className="text-lg font-black text-[#4285F4]"
  >
    G
  </span>
  {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
</button>

              <div className="my-7 flex items-center gap-4">
                <span className="h-px flex-1 bg-[#002147]/10" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#002147]/35">
                  New to Aesthetics?
                </span>
                <span className="h-px flex-1 bg-[#002147]/10" />
              </div>

              <Link
                href="/register"
                className="flex w-full items-center justify-center rounded-xl border border-[#002147]/15 px-5 py-3.5 text-sm font-bold transition hover:border-[#002147] hover:bg-[#f4ead7]/40"
              >
                Create a company account
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#002147]/50">
              <Link href="/terms" className="transition hover:text-[#9b111e]">
                Terms
              </Link>
              <Link href="/privacy" className="transition hover:text-[#9b111e]">
                Privacy
              </Link>
              <Link href="/cookies" className="transition hover:text-[#9b111e]">
                Cookies
              </Link>
            </div>

            <p className="mt-4 text-center text-xs text-[#002147]/40">
              © {new Date().getFullYear()} Aesthetics. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
