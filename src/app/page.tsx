import Image from "next/image";

export default function Home() {
  return (
 <main className="min-h-screen bg-[var(--concrete)] text-[var(--foreground)]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--architect-green)]">
            Construction Management Platform
          </p>

          <h1 className="text-5xl font-bold tracking-tight text-[var(--foreground)] sm:text-6xl">
            Build smarter.
            <br />
            Manage everything.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Aesthetics brings construction projects, workers, materials,
            expenses, suppliers, invoices, and site operations into one
            organized platform.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              className="rounded-lg bg-[var(--architect-green)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--architect-green-dark)]"
            >
              Get Started
            </button>

            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-3 font-semibold text-[var(--foreground)] transition hover:border-[var(--architect-green)]"
            >
              View Platform
            </button>
          </div>
        </div>
      </section>
    </main>
    

  );
}
