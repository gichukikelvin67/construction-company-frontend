"use client";

import { FormEvent, useState } from "react";
import {
  createWorkerAssignment,
  type CreateWorkerAssignmentData,
} from "@/services/workerAssignmentService";
import type { Worker } from "@/services/workerService";

interface AssignWorkerFormProps {
  projectId: string;
  workers: Worker[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AssignWorkerForm({
  projectId,
  workers,
  onSuccess,
  onCancel,
}: AssignWorkerFormProps) {
  const [workerId, setWorkerId] = useState("");
  const [roleOnProject, setRoleOnProject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [agreedDailyRate, setAgreedDailyRate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedWorker = workers.find(
    (worker) => worker._id === workerId
  );

  const handleWorkerChange = (id: string) => {
    setWorkerId(id);

    const worker = workers.find((item) => item._id === id);

    if (worker) {
      setAgreedDailyRate(String(worker.dailyRate));
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      if (!workerId) {
        setError("Please select a worker.");
        return;
      }

      if (!roleOnProject.trim()) {
        setError("Please enter the worker's role on this project.");
        return;
      }

      if (!startDate) {
        setError("Please select a start date.");
        return;
      }

      const dailyRate = Number(agreedDailyRate);

      if (!Number.isFinite(dailyRate) || dailyRate < 0) {
        setError("Please enter a valid daily rate.");
        return;
      }

      const assignmentData: CreateWorkerAssignmentData = {
        projectId,
        workerId,
        roleOnProject: roleOnProject.trim(),
        startDate: new Date(
          `${startDate}T00:00:00`
        ).toISOString(),
        agreedDailyRate: dailyRate,
      };

      if (endDate) {
        assignmentData.endDate = new Date(
          `${endDate}T00:00:00`
        ).toISOString();
      }

      await createWorkerAssignment(assignmentData);

      onSuccess();
    } catch (error: any) {
      console.error(
        "Failed to assign worker:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Unable to assign worker to this project."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
          Workforce
        </p>

        <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
          Assign Worker
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Assign an existing worker to this construction project.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6"
      >
        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {workers.length === 0 ? (
          <div className="border border-dashed border-[var(--border)] p-6">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              No active workers available
            </p>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Create an active worker before assigning
              someone to this project.
            </p>

            <button
              type="button"
              onClick={onCancel}
              className="mt-4 border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {/* Worker */}
              <div>
                <label
                  htmlFor="worker"
                  className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                  Worker
                </label>

                <select
                  id="worker"
                  value={workerId}
                  onChange={(event) =>
                    handleWorkerChange(event.target.value)
                  }
                  required
                  className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
                >
                  <option value="">
                    Select worker
                  </option>

                  {workers
                    .filter(
                      (worker) =>
                        worker.status === "active"
                    )
                    .map((worker) => (
                      <option
                        key={worker._id}
                        value={worker._id}
                      >
                        {worker.name} — {worker.jobTitle}
                      </option>
                    ))}
                </select>
              </div>

              {/* Project Role */}
              <div>
                <label
                  htmlFor="roleOnProject"
                  className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                  Role on Project
                </label>

                <input
                  id="roleOnProject"
                  type="text"
                  value={roleOnProject}
                  onChange={(event) =>
                    setRoleOnProject(event.target.value)
                  }
                  placeholder="e.g. Masonry Worker"
                  required
                  className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--architect-green)]"
                />
              </div>

              {/* Start Date */}
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
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  required
                  className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
                />
              </div>

              {/* End Date */}
              <div>
                <label
                  htmlFor="endDate"
                  className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                  End Date
                </label>

                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                  className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
                />

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Optional
                </p>
              </div>

              {/* Daily Rate */}
              <div>
                <label
                  htmlFor="agreedDailyRate"
                  className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                  Agreed Daily Rate
                </label>

                <div className="flex">
                  <span className="border border-r-0 border-[var(--border)] bg-[var(--concrete)] px-3 py-2.5 text-sm font-medium text-[var(--muted)]">
                    KES
                  </span>

                  <input
                    id="agreedDailyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={agreedDailyRate}
                    onChange={(event) =>
                      setAgreedDailyRate(
                        event.target.value
                      )
                    }
                    required
                    className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
                  />
                </div>

                {selectedWorker && (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Worker default rate: KES{" "}
                    {selectedWorker.dailyRate.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--architect-green)]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="border border-[var(--architect-green)] bg-[var(--architect-green)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--architect-green-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Assigning..."
                  : "Assign Worker"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}