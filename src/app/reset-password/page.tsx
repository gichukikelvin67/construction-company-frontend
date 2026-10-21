
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("The reset link is missing its token. Request a new reset link.");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 100) {
      setError("Your password must contain between 8 and 100 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword,
      });

      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      window.history.replaceState({}, "", "/reset-password");
    } catch (err: unknown) {
      console.error("Password reset failed:", err);

      setError(
        "We couldn't reset your password. The link may have expired or already been used. Request a new reset link and try again."
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

          <Link
            href="/"
            className="relative z-10 inline-flex w-fit items-center gap-3"
          >
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
              Secure account recovery
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              A fresh start.
              <span className="block text-[#f6c700]">A secure account.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65 sm:text-base">
              Choose a new password to regain access to your construction
              management workspace.
            </p>
          </div>

          <p className="relative z-10 hidden text-xs text-white/40 lg:block">
            Plan with purpose. Build with confidence.
          </p>
        </section>

        <section className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10 lg:px-12">
          <div className="w-full max-w-md rounded-2xl border border-[#002147]/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,33,71,0.08)] sm:p-10">
            {!success ? (
              <>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b111e]">
                  Password recovery
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Set a new password
                </h2>
                <p className="mt-4 text-sm leading-6 text-[#002147]/60">
                  Use at least 8 characters. Choose a password you have not
                  used for this account before.
                </p>

                {error && (
                  <div
                    role="alert"
                    className="mt-6 rounded-xl border border-[#9b111e]/20 bg-red-50 px-4 py-3 text-sm leading-6 text-[#9b111e]"
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="text-sm font-semibold"
                    >
                      New password
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={100}
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                        placeholder="At least 8 characters"
                        className="w-full rounded-xl border border-[#002147]/15 bg-[#fcfbf8] px-4 py-3.5 pr-16 text-sm outline-none transition placeholder:text-[#002147]/35 focus:border-[#9b111e] focus:bg-white focus:ring-4 focus:ring-[#9b111e]/10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((previous) => !previous)
                        }
                        className="absolute inset-y-0 right-4 text-xs font-bold text-[#002147]/60 hover:text-[#9b111e]"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold"
                    >
                      Confirm new password
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={100}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Enter the password again"
                        className="w-full rounded-xl border border-[#002147]/15 bg-[#fcfbf8] px-4 py-3.5 pr-16 text-sm outline-none transition placeholder:text-[#002147]/35 focus:border-[#9b111e] focus:bg-white focus:ring-4 focus:ring-[#9b111e]/10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((previous) => !previous)
                        }
                        className="absolute inset-y-0 right-4 text-xs font-bold text-[#002147]/60 hover:text-[#9b111e]"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !token}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#9b111e] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#7f0e18] focus:outline-none focus:ring-4 focus:ring-[#9b111e]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading
                      ? "Updating password..."
                      : "Reset password"}
                    {!isLoading && <span aria-hidden="true">→</span>}
                  </button>
                </form>

                {!token && (
                  <p className="mt-4 text-xs leading-5 text-[#002147]/55">
                    Open this page using the reset link from your email.
                  </p>
                )}
              </>
            ) : (
              <div aria-live="polite">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4ead7] text-2xl text-[#9b111e]">
                  ✓
                </div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight">
                  Password updated
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#002147]/65">
                  Your password has been changed successfully. Sign in using
                  your new password.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-7 w-full rounded-xl bg-[#9b111e] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#7f0e18]"
                >
                  Continue to sign in
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
