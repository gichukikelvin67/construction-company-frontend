"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardSummary ,type DashboardProject} from "@/services/dashboardService";

interface DashboardData {
  projects: number;
  workers: number;
  materials: number;
  expenses: number;
  recentProjects:DashboardProject[];
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    projects: 0,
    workers: 0,
    materials: 0,
    expenses: 0,
    recentProjects:[],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getDashboardSummary();

        setDashboard(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setError("Unable to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
          Overview
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
          Construction Dashboard
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Monitor your company's construction operations from one place.
        </p>
      </div>

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Projects"
          value={isLoading ? "..." : dashboard.projects.toString()}
          description="Construction projects"
        />

        <DashboardCard
          title="Workers"
          value={isLoading ? "..." : dashboard.workers.toString()}
          description="Registered workers"
        />

        <DashboardCard
          title="Materials"
          value={isLoading ? "..." : dashboard.materials.toString()}
          description="Active materials"
        />

        <DashboardCard
          title="Expenses"
          value={
            isLoading
              ? "..."
              : `KES ${dashboard.expenses.toLocaleString()}`
          }
          description="Recorded expenses"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Recent Projects
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Your latest construction projects will appear here.
          </p>

        <div className="mt-6 space-y-3">
  {dashboard.recentProjects.length === 0 ? (
    <div className="border border-dashed border-[var(--border)] p-8 text-center">
      <p className="text-sm text-[var(--muted)]">
        No projects to display yet.
      </p>
    </div>
  ) : (
    dashboard.recentProjects.map((project) => (
      <div
        key={project._id}
        className="border border-[var(--border)] p-4 transition hover:border-[var(--architect-green)]"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">
              {project.name}
            </h3>

            {project.location && (
              <p className="mt-1 text-sm text-[var(--muted)]">
                {project.location}
              </p>
            )}
          </div>

          <span className="w-fit border border-[var(--border)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--architect-green)]">
            {project.status}
          </span>
        </div>
      </div>
    ))
  )}
</div>
        </section>

        <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Quick Actions
          </h2>

          <div className="mt-5 space-y-3">
             <Link
  href="/dashboard/projects"
  className="block w-full border border-[var(--border)] px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--architect-green)]"
>
  Create Project
</Link>

            <button
              type="button"
              className="w-full border border-[var(--border)] px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--architect-green)]"
            >
              Add Worker
            </button>

            <button
              type="button"
              className="w-full border border-[var(--border)] px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--architect-green)]"
            >
              Record Expense
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
}

function DashboardCard({
  title,
  value,
  description,
}: DashboardCardProps) {
  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-sm font-medium text-[var(--muted)]">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-[var(--foreground)]">
        {value}
      </p>

      <p className="mt-2 text-xs text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}