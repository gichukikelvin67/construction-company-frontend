"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createProject,
  getProjects,
  type Project,
} from "@/services/projectService";

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoadingProjects(true);

        const data = await getProjects();

        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
        setError("Unable to load projects.");
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const newProject = await createProject({
        name,
        location,
        budget: Number(budget),
        startDate,
        description,
      });

      setProjects((currentProjects) => [
        newProject,
        ...currentProjects,
      ]);

      setName("");
      setLocation("");
      setBudget("");
      setStartDate("");
      setDescription("");

      setSuccess("Project created successfully.");

      setShowForm(false);
    } catch (error) {
      console.error("Failed to create project:", error);

      setError("Unable to create project. Please check your information.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
            Projects
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            Construction Projects
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Create and manage your company's construction projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            setError("");
            setSuccess("");
          }}
          className="border border-[var(--architect-green)] bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--architect-green-dark)]"
        >
          {showForm ? "Close Form" : "Create Project"}
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="mt-6 border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Create project form */}
      {showForm && (
        <section className="mt-6 border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="border-b border-[var(--border)] pb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              New Construction Project
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Enter the basic project information below.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-5 md:grid-cols-2"
          >
            {/* Project name */}
            <div>
              <label
                htmlFor="projectName"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Project Name
              </label>

              <input
                id="projectName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Karen Residential Development"
                required
                className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Location
              </label>

              <input
                id="location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Karen, Nairobi"
                required
                className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              />
            </div>

            {/* Budget */}
            <div>
              <label
                htmlFor="budget"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Budget (KES)
              </label>

              <input
                id="budget"
                type="number"
                min="0"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="e.g. 5000000"
                required
                className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              />
            </div>

            {/* Start date */}
            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Start Date
              </label>

              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
                className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Description
              </label>

              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the construction project..."
                required
                className="w-full resize-none border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="border border-[var(--architect-green)] bg-[var(--architect-green)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--architect-green-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Saving Project..." : "Save Project"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Projects list */}
      <section className="mt-8 border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Your Projects
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Projects belonging to your company.
            </p>
          </div>

          <span className="border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            {projects.length} PROJECTS
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {isLoadingProjects ? (
            <div className="border border-dashed border-[var(--border)] p-8 text-center">
              <p className="text-sm text-[var(--muted)]">
                Loading projects...
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="border border-dashed border-[var(--border)] p-8 text-center">
              <p className="text-sm text-[var(--muted)]">
                No projects have been created yet.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project._id}
                className="border border-[var(--border)] p-5 transition hover:border-[var(--architect-green)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--foreground)]">
                      {project.name}
                    </h3>

                    {project.location && (
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {project.location}
                      </p>
                    )}
                  </div>

                  <span className="w-fit border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
                    {project.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      Budget
                    </p>

                    <p className="mt-1 font-semibold text-[var(--foreground)]">
                      KES{" "}
                      {(project.budget ?? 0).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      Start Date
                    </p>

                    <p className="mt-1 font-semibold text-[var(--foreground)]">
                      {project.startDate
                        ? new Date(
                            project.startDate
                          ).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      Description
                    </p>

                    <p className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">
                      {project.description || "No description"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );
}