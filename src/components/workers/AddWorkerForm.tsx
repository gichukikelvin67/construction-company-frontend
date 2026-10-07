"use client";

import { FormEvent, useState } from "react";
import {
  createWorker,
  type CreateWorkerData,
} from "@/services/workerService";

interface AddWorkerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddWorkerForm({
  onSuccess,
  onCancel,
}: AddWorkerFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const workerData: CreateWorkerData = {
        name: name.trim(),
        phone: phone.trim(),
        jobTitle: jobTitle.trim(),
        dailyRate: Number(dailyRate),
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

      await createWorker(workerData);

      onSuccess();
    } catch (error: any) {
      console.error("Failed to create worker:", error);

      const message =
        error?.response?.data?.message ||
        "Unable to create worker.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Add Worker
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Register a new worker under your company.
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
              htmlFor="worker-name"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Full Name *
            </label>

            <input
              id="worker-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="e.g. John Kamau"
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label
              htmlFor="worker-phone"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Phone Number *
            </label>

            <input
              id="worker-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              placeholder="0712345678"
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label
              htmlFor="worker-email"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Email
            </label>

            <input
              id="worker-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="worker@example.com"
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label
              htmlFor="worker-id"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              National ID
            </label>

            <input
              id="worker-id"
              type="text"
              value={nationalId}
              onChange={(event) => setNationalId(event.target.value)}
              placeholder="e.g. 12345678"
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label
              htmlFor="worker-job-title"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Job Title *
            </label>

            <input
              id="worker-job-title"
              type="text"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              required
              placeholder="e.g. Mason"
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label
              htmlFor="worker-rate"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Daily Rate (KES) *
            </label>

            <input
              id="worker-rate"
              type="number"
              min="0"
              step="1"
              value={dailyRate}
              onChange={(event) => setDailyRate(event.target.value)}
              required
              placeholder="1500"
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Emergency Contact
          </h3>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Optional contact information for emergencies on site.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="emergency-name"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Contact Name
              </label>

              <input
                id="emergency-name"
                type="text"
                value={emergencyContactName}
                onChange={(event) =>
                  setEmergencyContactName(event.target.value)
                }
                placeholder="e.g. Mary Kamau"
                className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              />
            </div>

            <div>
              <label
                htmlFor="emergency-phone"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Contact Phone
              </label>

              <input
                id="emergency-phone"
                type="tel"
                value={emergencyContactPhone}
                onChange={(event) =>
                  setEmergencyContactPhone(event.target.value)
                }
                placeholder="0712345678"
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
            {isSubmitting ? "Saving..." : "Save Worker"}
          </button>
        </div>
      </form>
    </div>
  );
}