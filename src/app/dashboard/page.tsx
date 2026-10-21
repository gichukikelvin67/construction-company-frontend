
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getDashboardSummary,
  type DashboardProject,
} from "@/services/dashboardService";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleAlert,
  HardHat,
  Layers3,
  Plus,
  Receipt,
  RefreshCw,
  Wallet,
} from "lucide-react";

interface DashboardData {
  projects: number;
  workers: number;
  materials: number;
  expenses: number;
  recentProjects: DashboardProject[];
}

const stats = [
  {
    key: "projects",
    title: "Total projects",
    description: "Construction projects",
    icon: BriefcaseBusiness,
    color: "text-blue-400",
    background: "bg-blue-400/10",
  },
  {
    key: "workers",
    title: "Registered workers",
    description: "Your workforce",
    icon: HardHat,
    color: "text-amber-400",
    background: "bg-amber-400/10",
  },
  {
    key: "materials",
    title: "Materials",
    description: "Recorded materials",
    icon: Layers3,
    color: "text-emerald-400",
    background: "bg-emerald-400/10",
  },
  {
    key: "expenses",
    title: "Recorded expenses",
    description: "Total recorded expenses",
    icon: Wallet,
    color: "text-rose-400",
    background: "bg-rose-400/10",
  },
] as const;

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    projects: 0,
    workers: 0,
    materials: 0,
    expenses: 0,
    recentProjects: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setIsLoading(true);
      setError("");
      const data = await getDashboardSummary();
      setDashboard(data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setError("We couldn't load your dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const currentDate = new Intl.DateTimeFormat("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <section className="mx-auto w-full max-w-[1600px] space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page heading */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--architect-green)]">
            <span className="h-2 w-2 rounded-full bg-[var(--architect-green)]" />
            Overview / Operations
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
            Construction dashboard
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Your projects, workforce and financial activity — all in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--muted)]">
            <CalendarDays size={16} />
            <span>{currentDate}</span>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={isLoading}
            aria-label="Refresh dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--architect-green)] disabled:opacity-50"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Welcome panel */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#172322] p-5 sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-5 -top-14 h-44 w-44 rounded-full border border-white/10" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Operations overview
            </span>

            <h2 className="mt-4 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Build with clarity. Manage with confidence.
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">
              Keep track of your construction activity and access your key
              operational tools from one workspace.
            </p>
          </div>

          <Link
            href="/dashboard/projects"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Plus size={17} />
            View projects
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3 text-sm text-red-300">
            <CircleAlert size={18} />
            {error}
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="text-left text-sm font-semibold text-red-200 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Statistics */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Business at a glance
          </h2>
          <span className="text-xs text-[var(--muted)]">
            {isLoading ? "Updating..." : "Latest available data"}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const rawValue = dashboard[stat.key];
            const value =
              stat.key === "expenses"
                ? `KES ${Number(rawValue).toLocaleString("en-KE")}`
                : Number(rawValue).toLocaleString("en-KE");

            return (
              <article
                key={stat.key}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--architect-green)]/50 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--muted)]">
                      {stat.title}
                    </p>
                    <p className="mt-4 break-words text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                      {isLoading ? "—" : value}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.background} ${stat.color}`}
                  >
                    <Icon size={21} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-[var(--border)] pt-4">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${stat.background} ${stat.color}`}>
                    {stat.key === "expenses" ? (
                      <ArrowDownRight size={14} />
                    ) : (
                      <ArrowUpRight size={14} />
                    )}
                  </span>
                  <p className="text-xs text-[var(--muted)]">
                    {stat.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <section className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Recent projects
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Keep an eye on your latest construction work.
              </p>
            </div>

            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--architect-green)] hover:underline"
            >
              All projects <ArrowRight size={15} />
            </Link>
          </div>

          <div className="space-y-3 p-4 sm:p-6">
            {isLoading ? (
              [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-[var(--border)] p-5"
                >
                  <div className="h-4 w-2/5 rounded bg-[var(--border)]" />
                  <div className="mt-3 h-3 w-1/3 rounded bg-[var(--border)]" />
                </div>
              ))
            ) : dashboard.recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] px-5 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--architect-green)]/10 text-[var(--architect-green)]">
                  <BriefcaseBusiness size={25} />
                </div>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">
                  Your next project starts here
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                  Create a project to start organizing your construction
                  operations.
                </p>
                <Link
                  href="/dashboard/projects"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--architect-green)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  <Plus size={16} /> Create project
                </Link>
              </div>
            ) : (
              dashboard.recentProjects.map((project) => (
                <article
                  key={project._id}
                  className="rounded-xl border border-[var(--border)] p-4 transition hover:border-[var(--architect-green)]/50 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold text-[var(--foreground)]">
                        {project.name}
                      </h3>
                      {project.location && (
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {project.location}
                        </p>
                      )}
                    </div>

                    <span className="w-fit rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold capitalize text-[var(--architect-green)]">
                      {project.status.replace(/[_-]/g, " ")}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Quick actions
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Get straight to the task at hand.
            </p>
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            <QuickAction
              href="/dashboard/projects"
              title="Create a project"
              description="Set up a new construction job"
              icon={BriefcaseBusiness}
            />

            <QuickAction
              href="/dashboard/workers"
              title="Manage workers"
              description="View your registered workforce"
              icon={HardHat}
            />

            <QuickAction
              href="/dashboard/expenses"
              title="View expenses"
              description="Review recorded business costs"
              icon={Receipt}
            />

            <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-400/10 p-2 text-amber-400">
                  <CircleAlert size={17} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Stay on top of operations
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    Review your projects and records regularly to keep your
                    dashboard useful and up to date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

interface QuickActionProps {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-[var(--border)] p-4 transition hover:border-[var(--architect-green)]/60 hover:bg-[var(--background)]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--architect-green)]/10 text-[var(--architect-green)]">
        <Icon size={19} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--foreground)]">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <ArrowRight
        size={16}
        className="shrink-0 text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--architect-green)]"
      />
    </Link>
  );
}
