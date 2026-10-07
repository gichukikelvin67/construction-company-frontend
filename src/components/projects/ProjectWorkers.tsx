"use client";

import { useEffect, useState } from "react";
import {
  getProjectWorkers,
  type WorkerAssignment,
} from "@/services/workerAssignmentService";
import { getWorkers, type Worker } from "@/services/workerService";
import AssignWorkerForm from "@/components/workers/AssignWorkerForm";

interface ProjectWorkersProps {
  projectId: string;
}

export default function ProjectWorkers({
  projectId,
}: ProjectWorkersProps) {
  const [assignments, setAssignments] = useState<
    WorkerAssignment[]
  >([]);

  const [workers, setWorkers] = useState<Worker[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [error, setError] = useState("");

  const loadWorkers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [assignmentData, workerData] =
        await Promise.all([
          getProjectWorkers(projectId),
          getWorkers(),
        ]);

      setAssignments(assignmentData);
      setWorkers(workerData);
    } catch (error) {
      console.error(
        "Failed to load project workers:",
        error
      );

      setError(
        "Unable to load the project workforce."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, [projectId]);

  const activeAssignments = assignments.filter(
    (assignment) =>
      assignment.status === "active"
  );

  return (
    <section className="mt-8 border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
            Workforce
          </p>

          <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            Project Workers
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Workers currently assigned to this project.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAssignForm(true)}
          className="w-fit border border-[var(--architect-green)] bg-[var(--architect-green)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--architect-green-dark)]"
        >
          + Assign Worker
        </button>
      </div>

      {showAssignForm && (
        <div className="border-b border-[var(--border)] p-6">
          <AssignWorkerForm
            projectId={projectId}
            workers={workers}
            onCancel={() => setShowAssignForm(false)}
            onSuccess={async () => {
              setShowAssignForm(false);
              await loadWorkers();
            }}
          />
        </div>
      )}

      <div className="p-6">
        {isLoading ? (
          <div className="border border-dashed border-[var(--border)] p-8 text-center">
            <p className="text-sm text-[var(--muted)]">
              Loading project workers...
            </p>
          </div>
        ) : error ? (
          <div className="border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        ) : activeAssignments.length === 0 ? (
          <div className="border border-dashed border-[var(--border)] p-8 text-center">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              No workers assigned
            </p>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Assign workers to start tracking the
              project's workforce.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Worker
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Project Role
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Start Date
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Daily Rate
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {activeAssignments.map(
                  (assignment) => (
                    <tr
                      key={assignment._id}
                      className="border-b border-[var(--border)] last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {assignment.worker.name}
                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {assignment.worker.phone}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-[var(--muted)]">
                        {assignment.roleOnProject}
                      </td>

                      <td className="px-4 py-4 text-sm text-[var(--muted)]">
                        {new Date(
                          assignment.startDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-semibold text-[var(--foreground)]">
                        KES{" "}
                        {assignment.agreedDailyRate.toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold uppercase text-blue-700">
                          Active
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}