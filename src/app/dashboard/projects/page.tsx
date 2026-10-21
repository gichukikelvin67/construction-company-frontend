
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  createProject,
  getProjects,
  type Project,
} from "@/services/projectService";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  MapPin,
  Plus,
  Search,
  X,
} from "lucide-react";

type ProjectFilter = "all" | "planning" | "active" | "on_hold" | "completed" | "cancelled";

const projectPhotos = [
  "/images/construction building - Google Search.jpg",
  "/images/Breathtaking new Hamptons style house in Melbourne's south east.jpg",
  "/images/Multi story office building with steel structure.jpg",
];

const statusStyles: Record<string, string> = {
  planning: "border-blue-500/20 bg-blue-500/10 text-blue-600",
  active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  on_hold: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  completed: "border-slate-500/20 bg-slate-500/10 text-slate-500",
  cancelled: "border-red-500/20 bg-red-500/10 text-red-500",
};

const statusLabels: Record<string, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatStatus(status: string) {
  return statusLabels[status] ?? status.replace(/[_-]/g, " ");
}

function formatMoney(value?: number) {
  return `KES ${Number(value ?? 0).toLocaleString("en-KE")}`;
}

function formatDate(value?: string) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const[clientName,setClientName]=useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("all");

  useEffect(() => {
    async function loadProjects() {
      try {
        setIsLoadingProjects(true);
        setError("");
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
        setError("Unable to load projects. Please try again.");
      } finally {
        setIsLoadingProjects(false);
      }
    }

    void loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !term ||
        project.name.toLowerCase().includes(term) ||
        (project.location ?? "").toLowerCase().includes(term) ||
        (project.description ?? "").toLowerCase().includes(term);

      const matchesStatus =
        filter === "all" || project.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, filter]);

  const counts = useMemo(() => {
    return {
      all: projects.length,
      planning: projects.filter((p) => p.status === "planning").length,
      active: projects.filter((p) => p.status === "active").length,
      on_hold: projects.filter((p) => p.status === "on_hold").length,
      completed: projects.filter((p) => p.status === "completed").length,
      cancelled: projects.filter((p) => p.status === "cancelled").length,
    };
  }, [projects]);

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError("");
  setSuccess("");

  if (!startDate || !expectedEndDate) {
    setError("Please provide both the project start date and expected end date.");
    return;
  }

  if (expectedEndDate < startDate) {
    setError("Expected end date cannot be before the start date.");
    return;
  }

  const numericBudget = Number(budget);

  if (!Number.isFinite(numericBudget) || numericBudget < 0) {
    setError("Please enter a valid, non-negative project budget.");
    return;
  }

  setIsLoading(true);

  try {
    const newProject = await createProject({
      name: name.trim(),
      location: location.trim(),
      clientName: clientName.trim(),
      budget: numericBudget,
      startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
      expectedEndDate: new Date(
        `${expectedEndDate}T00:00:00.000Z`
      ).toISOString(),
      description: description.trim(),
    });

    setProjects((current) => [newProject, ...current]);
    setName("");
    setLocation("");
    setClientName("");
    setBudget("");
    setStartDate("");
    setExpectedEndDate("");
    setDescription("");
    setSuccess("Project created successfully.");
    setShowForm(false);
    setFilter("all");
    setSearch("");
  } catch (error) {
    console.error("Failed to create project:", error);

    setError(
      "Unable to create project. Check the required fields and try again."
    );
  } finally {
    setIsLoading(false);
  }
}


  const filters: { label: string; value: ProjectFilter; count: number }[] = [
    { label: "All projects", value: "all", count: counts.all },
    { label: "Active", value: "active", count: counts.active },
    { label: "Planning", value: "planning", count: counts.planning },
    { label: "On hold", value: "on_hold", count: counts.on_hold },
    { label: "Completed", value: "completed", count: counts.completed },
    { label: "Cancelled", value: "cancelled", count: counts.cancelled },
  ];

  return (
    <section className="mx-auto w-full max-w-[1600px] space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
            <Building2 size={15} />
            Project management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
            Construction projects
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Organize your construction portfolio, monitor project status,
            and keep essential details within reach.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            setError("");
            setSuccess("");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        >
          {showForm ? <X size={17} /> : <Plus size={18} />}
          {showForm ? "Close form" : "Create project"}
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total projects" value={projects.length} />
        <SummaryCard label="Active projects" value={counts.active} />
        <SummaryCard label="In planning" value={counts.planning} />
        <SummaryCard label="Completed" value={counts.completed} />
      </div>

      {success && (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          <CircleAlert size={18} />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            <X size={17} />
          </button>
        </div>
      )}

      {/* Create project form */}
      {showForm && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              New construction project
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Add the project's essential information.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <FormField label="Project name" htmlFor="projectName">
              <input
                id="projectName"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Karen Residential Development"
                minLength={2}
                maxLength={150}
                required
                className={inputClass}
              />
            </FormField>

            <FormField label="Location" htmlFor="projectLocation">
              <input
                id="projectLocation"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Karen, Nairobi"
                required
                maxLength={300}
                className={inputClass}
              />
            </FormField>
            
<FormField label="Client name" htmlFor="projectClientName">
  <input
    id="projectClientName"
    value={clientName}
    onChange={(event) => setClientName(event.target.value)}
    placeholder="e.g. ABC Properties Ltd"
    minLength={2}
    maxLength={150}
    required
    className={inputClass}
  />
</FormField>


            <FormField label="Budget (KES)" htmlFor="projectBudget">
              <input
                id="projectBudget"
                type="number"
                min="0"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="e.g. 5000000"
                required
                className={inputClass}
              />
            </FormField>

            <FormField label="Start date" htmlFor="projectStartDate">
              <input
                id="projectStartDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
                className={inputClass}
              />
            </FormField>
            
<FormField label="Expected end date" htmlFor="projectExpectedEndDate">
  <input
    id="projectExpectedEndDate"
    type="date"
    value={expectedEndDate}
    min={startDate || undefined}
    onChange={(event) => setExpectedEndDate(event.target.value)}
    required
    className={inputClass}
  />
</FormField>


            <div className="sm:col-span-2">
              <FormField label="Project description" htmlFor="projectDescription">
                <textarea
                  id="projectDescription"
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the scope and objectives of this project..."
                  maxLength={2000}
                  required
                  className={`${inputClass} resize-y`}
                />
              </FormField>
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {isLoading ? "Saving project..." : "Save project"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Project gallery */}
      <section>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Your project portfolio
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {isLoadingProjects
                ? "Loading your projects..."
                : `${filteredProjects.length} of ${projects.length} projects displayed`}
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects or locations..."
              aria-label="Search projects"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        {/* Status filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
                filter === item.value
                  ? "border-[var(--architect-green)] bg-[var(--architect-green)] text-white"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--architect-green)]"
              }`}
            >
              {item.label}
              <span className={filter === item.value ? "text-white/80" : "opacity-70"}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {isLoadingProjects ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="h-48 bg-[var(--border)]" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/5 rounded bg-[var(--border)]" />
                  <div className="h-3 w-2/5 rounded bg-[var(--border)]" />
                  <div className="h-12 rounded bg-[var(--border)]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--architect-green)]/10 text-[var(--architect-green)]">
              <Building2 size={25} />
            </div>
            <h3 className="mt-4 font-semibold text-[var(--foreground)]">
              {projects.length === 0 ? "Your portfolio starts here" : "No matching projects"}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
              {projects.length === 0
                ? "Create your first project to start building your construction portfolio."
                : "Try a different search term or status filter."}
            </p>
            {projects.length === 0 && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--architect-green)] px-4 py-3 text-sm font-semibold text-white"
              >
                <Plus size={16} /> Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const photoIndex =
                projects.findIndex((item) => item._id === project._id) %
                projectPhotos.length;

              return (
                <Link
                  key={project._id}
                  href={`/dashboard/projects/${project._id}`}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition duration-200 hover:-translate-y-1 hover:border-[var(--architect-green)]/60 hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden bg-[var(--background)]">
                    <img
                      src={projectPhotos[photoIndex]}
                      alt={`Illustrative construction image for ${project.name}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                    <div className="absolute left-4 top-4">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold ${statusStyles[project.status] ?? statusStyles.planning}`}>
                        {formatStatus(project.status)}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-white/85">
                        <MapPin size={13} />
                        {project.location || "Location not provided"}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold leading-snug text-white">
                        {project.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
                          Project budget
                        </p>
                        <p className="mt-1 break-words text-lg font-bold tracking-tight text-[var(--foreground)]">
                          {formatMoney(project.budget)}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--architect-green)]/10 text-[var(--architect-green)]">
                        <Building2 size={19} />
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-[var(--muted)]">
                      {project.description || "No project description has been added."}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                          <CalendarDays size={12} />
                          Start date
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[var(--foreground)]">
                          {formatDate(project.startDate)}
                        </p>
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[var(--architect-green)] transition group-hover:gap-2.5">
                        View details <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--architect-green)] focus:ring-2 focus:ring-[var(--architect-green)]/10";

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">
        {value.toLocaleString("en-KE")}
      </p>
    </div>
  );
}

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-[var(--foreground)]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
