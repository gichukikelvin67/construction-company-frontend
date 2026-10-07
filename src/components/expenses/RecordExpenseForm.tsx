"use client";

import { FormEvent, useState } from "react";
import {
  createExpense,
  type CreateExpenseData,
} from "@/services/expenseService";

interface RecordExpenseFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const categories: CreateExpenseData["category"][] = [
  "materials",
  "transport",
  "fuel",
  "equipment",
  "labour",
  "permits",
  "utilities",
  "other",
];

export default function RecordExpenseForm({
  projectId,
  onSuccess,
  onCancel,
}: RecordExpenseFormProps) {
  const [category, setCategory] =
    useState<CreateExpenseData["category"]>("materials");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const expenseData: CreateExpenseData = {
        projectId,
        category,
        description: description.trim(),
        amount: Number(amount),
        expenseDate: new Date(expenseDate).toISOString(),
        receiptNumber: receiptNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      await createExpense(expenseData);

      onSuccess();
    } catch (error: any) {
      console.error("Failed to create expense:", error);

      const message =
        error?.response?.data?.message ||
        "Unable to record this expense.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Record Expense
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Record a cost associated with this construction project.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="expense-category"
              className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
            >
              Category
            </label>

            <select
              id="expense-category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value as CreateExpenseData["category"]
                )
              }
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="expense-amount"
              className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
            >
              Amount (KES)
            </label>

            <input
              id="expense-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="e.g. 15000"
              required
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="expense-description"
            className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
          >
            Description
          </label>

          <input
            id="expense-description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="e.g. Cement purchased for foundation work"
            maxLength={300}
            required
            className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="expense-date"
              className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
            >
              Expense Date
            </label>

            <input
              id="expense-date"
              type="datetime-local"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
              required
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label
              htmlFor="receipt-number"
              className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
            >
              Receipt Number
              <span className="ml-2 font-normal text-[var(--muted)]">
                Optional
              </span>
            </label>

            <input
              id="receipt-number"
              type="text"
              value={receiptNumber}
              onChange={(event) => setReceiptNumber(event.target.value)}
              placeholder="e.g. INV-10482"
              maxLength={100}
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="expense-notes"
            className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
          >
            Notes
            <span className="ml-2 font-normal text-[var(--muted)]">
              Optional
            </span>
          </label>

          <textarea
            id="expense-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add any additional information..."
            maxLength={500}
            rows={4}
            className="w-full resize-y border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--concrete)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="border border-[var(--architect-green)] bg-[var(--architect-green)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--architect-green-dark)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Recording..." : "Record Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}