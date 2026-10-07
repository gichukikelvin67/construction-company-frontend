"use client";

import { useState } from "react";
import {
  voidExpense,
  type Expense,
} from "@/services/expenseService";

interface VoidExpenseFormProps {
  expense: Expense;
  onSuccess: (expense: Expense) => void;
  onCancel: () => void;
}

export default function VoidExpenseForm({
  expense,
  onSuccess,
  onCancel,
}: VoidExpenseFormProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const updatedExpense = await voidExpense(
        expense._id,
        reason
      );

      onSuccess(updatedExpense);
    } catch (error) {
      console.error("Failed to void expense:", error);

      setError("Unable to void this expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-red-200 bg-[var(--surface)]">
      <div className="border-b border-red-200 bg-red-50 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
          Expense Management
        </p>

        <h2 className="mt-2 text-xl font-bold text-red-800">
          Void Expense
        </h2>

        <p className="mt-1 text-sm text-red-700">
          This expense will remain in the system for audit
          purposes but will no longer be treated as an active
          expense.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6"
      >
        {error && (
          <div className="border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        <div className="border border-[var(--border)] bg-[var(--concrete)] p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Expense
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                {expense.description || "Unnamed expense"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Amount
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                KES {expense.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="void-reason"
            className="text-sm font-semibold text-[var(--foreground)]"
          >
            Reason for voiding
          </label>

          <textarea
            id="void-reason"
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            required
            minLength={3}
            maxLength={500}
            rows={4}
            placeholder="Explain why this expense is being voided..."
            className="mt-2 w-full resize-none border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-red-400"
          />

          <p className="mt-1 text-xs text-[var(--muted)]">
            A reason is required for audit purposes.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--concrete)]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="border border-red-600 bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Voiding..." : "Void Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}