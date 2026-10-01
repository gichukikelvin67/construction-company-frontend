"use client";
import{FormEvent,useState}from "react";
import{useRouter,}from "next/navigation";
import { loginUser } from "@/services/authService";

export default function LoginPage(){
    const router=useRouter();
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");

    const[error,setError]=useState("");
    const[isLoading,setIsLoading]=useState(false);

    const handleSubmit=async(
        event:FormEvent<HTMLFormElement>
    )=>{
        event.preventDefault();
        setError("");
        setIsLoading(true);

          try {
      await loginUser({
        email,
        password,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--concrete)] px-6 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
          
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--architect-green)]">
              Aesthetics
            </p>

            <h1 className="mt-3 text-3xl font-bold text-[var(--foreground)]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Sign in to manage your construction operations.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--architect-green)]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--architect-green)]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[var(--architect-green)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--architect-green-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
    