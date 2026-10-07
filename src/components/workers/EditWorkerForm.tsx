"use client";

import { FormEvent, useState } from "react";
import {
  updateWorker,
  type UpdateWorkerData,
  type Worker,
} from "@/services/workerService";

interface EditWorkerFormProps {
  worker: Worker;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditWorkerForm({
  worker,
  onSuccess,
  onCancel,
}: EditWorkerFormProps) {
  const [name, setName] = useState(worker.name);
  const [phone, setPhone] = useState(worker.phone);
  const [email, setEmail] = useState(worker.email || "");
  const [nationalId, setNationalId] = useState(worker.nationalId || "");
  const [jobTitle, setJobTitle] = useState(worker.jobTitle);
  const [dailyRate, setDailyRate] = useState(
    String(worker.dailyRate)
  );
  const [status, setStatus] = useState<Worker["status"]>(
    worker.status
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    worker.emergencyContactName || ""
  );
  const [emergencyContactPhone, setEmergencyContactPhone] =
    useState(worker.emergencyContactPhone || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const workerData: UpdateWorkerData = {
        name: name.trim(),
        phone: phone.trim(),
        jobTitle: jobTitle.trim(),
        dailyRate: Number(dailyRate),
        status,
      };

      if (email.trim()) {
        workerData.email = email.trim();
      }

      if (nationalId.trim()) {
        workerData.nationalId = nationalId.trim();
      }

      if (emergencyContactName.trim()) {
        workerData.emergencyContactName =
          emergencyContactName.trim();
      }

      if (emergencyContactPhone.trim()) {
        workerData.emergencyContactPhone =
          emergencyContactPhone.trim();
      }

      await updateWorker(worker._id, workerData);

      onSuccess();
    } catch (error: any) {
      console.error("Failed to update worker:", error);

      setError(
        error?.response?.data?.message ||
          "Unable to update worker."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Edit Worker
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Update worker information and employment status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="edit-worker-name"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Full Name *
            </label>

            <input
              id="edit-worker-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-worker-phone"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Phone Number *
            </label>

            <input
              id="edit-worker-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-worker-email"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Email
            </label>

            <input
              id="edit-worker-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-worker-id"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              National ID
            </label>

            <input
              id="edit-worker-id"
              type="text"
              value={nationalId}
              onChange={(event) => setNationalId(event.target.value)}
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-worker-job"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Job Title *
            </label>

            <input
              id="edit-worker-job"
              type="text"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              required
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-worker-rate"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Daily Rate (KES) *
            </label>

            <input
              id="edit-worker-rate"
              type="number"
              min="0"
              step="1"
              value={dailyRate}
              onChange={(event) => setDailyRate(event.target.value)}
              required
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-worker-status"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Status *
            </label>

            <select
              id="edit-worker-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as Worker["status"])
              }
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Emergency Contact
          </h3>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="edit-emergency-name"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Contact Name
              </label>

              <input
                id="edit-emergency-name"
                type="text"
                value={emergencyContactName}
                onChange={(event) =>
                  setEmergencyContactName(event.target.value)
                }
                className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              />
            </div>

            <div>
              <label
                htmlFor="edit-emergency-phone"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Contact Phone
              </label>

              <input
                id="edit-emergency-phone"
                type="tel"
                value={emergencyContactPhone}
                onChange={(event) =>
                  setEmergencyContactPhone(event.target.value)
                }
                className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-[var(--border)] pt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--concrete)] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="border border-[var(--architect-green)] bg-[var(--architect-green)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--architect-green-dark)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}