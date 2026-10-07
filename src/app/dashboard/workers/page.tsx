"use client";

import { useEffect, useState } from "react";
import {
  getWorkers,
  type Worker,
} from "@/services/workerService";
import AddWorkerForm from "@/components/workers/AddWorkerForm";
import EditWorkerForm from "@/components/workers/EditWorkerForm";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [selectedWorker, setSelectedWorker] =
    useState<Worker | null>(null);

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        setIsLoading(true);
        setError("");

        const workerData = await getWorkers();

        setWorkers(workerData);
      } catch (error) {
        console.error("Failed to load workers:", error);

        setError("Unable to load workers.");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkers();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
            Workforce
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            Workers
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Manage construction workers registered under your company.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedWorker(null);
            setShowAddWorker(true);
          }}
          className="w-fit border border-[var(--architect-green)] bg-[var(--architect-green)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--architect-green-dark)]"
        >
          Add Worker
        </button>
      </div>

      {/* Add Worker Form */}
      {showAddWorker && (
        <div className="mt-8">
          <AddWorkerForm
            onCancel={() => setShowAddWorker(false)}
            onSuccess={async () => {
              setShowAddWorker(false);

              try {
                setIsLoading(true);
                setError("");

                const workerData = await getWorkers();

                setWorkers(workerData);
              } catch (error) {
                console.error(
                  "Failed to refresh workers:",
                  error
                );

                setError(
                  "Worker was created, but the list could not be refreshed."
                );
              } finally {
                setIsLoading(false);
              }
            }}
          />
        </div>
      )}

      {/* Edit Worker Form */}
      {selectedWorker && (
        <div className="mt-8">
          <EditWorkerForm
            worker={selectedWorker}
            onCancel={() => setSelectedWorker(null)}
            onSuccess={async () => {
              setSelectedWorker(null);

              try {
                setIsLoading(true);
                setError("");

                const workerData = await getWorkers();

                setWorkers(workerData);
              } catch (error) {
                console.error(
                  "Failed to refresh workers:",
                  error
                );

                setError(
                  "Worker was updated, but the list could not be refreshed."
                );
              } finally {
                setIsLoading(false);
              }
            }}
          />
        </div>
      )}

      {/* Worker Register */}
      <div className="mt-8 border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Worker Register
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Current workers registered in Aesthetics.
          </p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="border border-dashed border-[var(--border)] p-8 text-center">
              <p className="text-sm text-[var(--muted)]">
                Loading workers...
              </p>
            </div>
          ) : error ? (
            <div className="border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          ) : workers.length === 0 ? (
            <div className="border border-dashed border-[var(--border)] p-8 text-center">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                No workers registered
              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Add your first worker to begin managing the workforce.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Worker
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Phone
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Role
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Daily Rate
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {workers.map((worker) => (
                    <tr
                      key={worker._id}
                      className="border-b border-[var(--border)] last:border-b-0"
                    >
                      {/* Worker */}
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {worker.name}
                        </p>

                        {worker.nationalId && (
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            ID: {worker.nationalId}
                          </p>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-4 text-sm text-[var(--muted)]">
                        {worker.phone || "—"}
                      </td>

                      {/* Job Title */}
                      <td className="px-4 py-4 text-sm text-[var(--muted)]">
                        {worker.jobTitle || "—"}
                      </td>

                      {/* Daily Rate */}
                      <td className="px-4 py-4 text-right text-sm font-semibold text-[var(--foreground)]">
                        {worker.dailyRate
                          ? `KES ${worker.dailyRate.toLocaleString()}`
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        {worker.status === "active" ? (
                          <span className="border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold uppercase text-blue-700">
                            Active
                          </span>
                        ) : worker.status === "suspended" ? (
                          <span className="border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold uppercase text-amber-700">
                            Suspended
                          </span>
                        ) : (
                          <span className="border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold uppercase text-gray-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddWorker(false);
                            setSelectedWorker(worker);
                          }}
                          className="border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--architect-green)] hover:text-[var(--architect-green)]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}