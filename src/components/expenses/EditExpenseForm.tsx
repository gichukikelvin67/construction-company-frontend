"use client";

import { useState } from "react";
import {
  updateExpense,
  type Expense,
  type UpdateExpenseData,
} from "@/services/expenseService";

interface EditExpenseFormProps {
  expense: Expense;
  onSuccess: (expense: Expense) => void;
  onCancel: () => void;
}

const categories: UpdateExpenseData["category"][] = [
  "materials",
  "transport",
  "fuel",
  "equipment",
  "labour",
  "permits",
  "utilities",
  "other",
];

export default function EditExpenseForm({
  expense,
  onSuccess,
  onCancel,
}: EditExpenseFormProps) {
  const [category, setCategory] =
    useState<UpdateExpenseData["category"]>(
      expense.category as UpdateExpenseData["category"]
    );

  const [description, setDescription] = useState(
    expense.description || ""
  );

  const [amount, setAmount] = useState(
    expense.amount.toString()
  );

  const [expenseDate, setExpenseDate] = useState(
    expense.expenseDate
      ? new Date(expense.expenseDate)
          .toISOString()
          .slice(0, 16)
      : ""
  );

  const [receiptNumber, setReceiptNumber] = useState("expense.receiptNumber ||");

  const [notes, setNotes] = useState("expense.notes ||");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const data: UpdateExpenseData = {
        category,
        description,
        amount: Number(amount),
        expenseDate: new Date(expenseDate).toISOString(),
        receiptNumber: receiptNumber || undefined,
        notes: notes || undefined,
      };

      const updatedExpense = await updateExpense(
        expense._id,
        data
      );

      onSuccess(updatedExpense);
    } catch (error) {
      console.error("Failed to update expense:", error);

      setError("Unable to update this expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
          Expense Management
        </p>

        <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
          Edit Expense
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Update the recorded expense details.
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

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-[var(--foreground)]">
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value as UpdateExpenseData["category"]
                )
              }
              className="mt-2 w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--architect-green)]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-[var(--foreground)]">
              Amount
            </label>

            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              required
              className="mt-2 w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--architect-green)]"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--foreground)]">
            Description
          </label>

          <input
            type="text"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            required
            maxLength={300}
            className="mt-2 w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--architect-green)]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-[var(--foreground)]">
              Expense Date
            </label>

            <input
              type="datetime-local"
              value={expenseDate}
              onChange={(event) =>
                setExpenseDate(event.target.value)
              }
              required
              className="mt-2 w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--architect-green)]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[var(--foreground)]">
              Receipt Number
            </label>

            <input
              type="text"
              value={receiptNumber}
              onChange={(event) =>
                setReceiptNumber(event.target.value)
              }
              maxLength={100}
              placeholder="Optional"
              className="mt-2 w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--architect-green)]"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--foreground)]">
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            maxLength={500}
            rows={4}
            placeholder="Optional notes"
            className="mt-2 w-full resize-none border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--architect-green)]"
          />
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
            className="border border-[var(--architect-green)] bg-[var(--architect-green)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--architect-green-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Updating..." : "Update Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}