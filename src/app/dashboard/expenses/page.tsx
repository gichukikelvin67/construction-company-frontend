
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  createExpense,
  getProjectExpenses,
  updateExpense,
  voidExpense,
  type Expense,
  type CreateExpenseData,
} from "@/services/expenseService";

import {
  getProjects,
  type Project,
} from "@/services/projectService";

const categories = [
  "materials",
  "transport",
  "fuel",
  "equipment",
  "labour",
  "permits",
  "utilities",
  "other",
] as const;

type ExpenseCategory = (typeof categories)[number];

type ExpenseForm = {
  category: ExpenseCategory;
  description: string;
  amount: string;
  expenseDate: string;
  receiptNumber: string;
  notes: string;
};

type StatusFilter = "all" | "active" | "voided";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): ExpenseForm => ({
  category: "materials",
  description: "",
  amount: "",
  expenseDate: today(),
  receiptNumber: "",
  notes: "",
});

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 2,
});

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const getErrorMessage = (
  error: unknown,
  fallback: string
) => {
  const responseError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return (
    responseError?.response?.data?.message ||
    responseError?.message ||
    fallback
  );
};

export default function ExpensesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] =
    useState("");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState<ExpenseForm>(emptyForm());
  const [editingExpense, setEditingExpense] =
    useState<Expense | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("active");

  const [voidTarget, setVoidTarget] =
    useState<Expense | null>(null);
  const [voidReason, setVoidReason] = useState("");

  const [isLoadingProjects, setIsLoadingProjects] =
    useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      setIsLoadingProjects(true);
      setError("");

      try {
        const result = await getProjects();

        if (cancelled) return;

        setProjects(result);

        if (result.length > 0) {
          setSelectedProjectId((current) => {
            if (
              current &&
              result.some((project) => project._id === current)
            ) {
              return current;
            }

            return result[0]._id;
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getErrorMessage(err, "Unable to load projects.")
          );
        }
      } finally {
        if (!cancelled) setIsLoadingProjects(false);
      }
    };

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshExpenses = useCallback(
    async (projectId: string) => {
      setIsLoadingExpenses(true);

      try {
        const result = await getProjectExpenses(projectId);
        setExpenses(result.expenses);
      } catch (err) {
        setExpenses([]);
        setError(
          getErrorMessage(err, "Unable to load expenses.")
        );
      } finally {
        setIsLoadingExpenses(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!selectedProjectId) {
      setExpenses([]);
      return;
    }

    void refreshExpenses(selectedProjectId);
  }, [selectedProjectId, refreshExpenses]);

  const activeExpenses = useMemo(
    () => expenses.filter((expense) => !expense.isVoided),
    [expenses]
  );

  const activeTotal = useMemo(
    () =>
      activeExpenses.reduce(
        (total, expense) => total + expense.amount,
        0
      ),
    [activeExpenses]
  );

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !query ||
        (expense.description || "").toLowerCase().includes(query) ||
        (expense.receiptNumber || "").toLowerCase().includes(query) ||
        (expense.notes || "").toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "all" ||
        expense.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !expense.isVoided) ||
        (statusFilter === "voided" && expense.isVoided);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [expenses, search, categoryFilter, statusFilter]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingExpense(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedProjectId) {
      setError("Select a project before recording an expense.");
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const expenseDate = new Date(
      `${form.expenseDate}T00:00:00.000Z`
    ).toISOString();

    const details = {
      category: form.category,
      description: form.description.trim(),
      amount,
      expenseDate,
      receiptNumber: form.receiptNumber.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      if (editingExpense) {
        await updateExpense(editingExpense._id, details);
        setSuccess("Expense updated successfully.");
      } else {
        const payload: CreateExpenseData = {
          projectId: selectedProjectId,
          ...details,
        };

        await createExpense(payload);
        setSuccess("Expense recorded successfully.");
      }

      resetForm();
      await refreshExpenses(selectedProjectId);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save the expense. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (expense: Expense) => {
    if (expense.isVoided) return;

    setEditingExpense(expense);
    setForm({
      category: expense.category as ExpenseCategory,
      description: expense.description || "",
      amount: String(expense.amount),
      expenseDate: (
        expense.expenseDate || expense.createdAt || today()
      ).slice(0, 10),
      receiptNumber: expense.receiptNumber || "",
      notes: expense.notes || "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleVoid = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!voidTarget) return;

    if (voidReason.trim().length < 3) {
      setError("Provide a void reason of at least 3 characters.");
      return;
    }

    setIsVoiding(true);
    setError("");
    setSuccess("");

    try {
      await voidExpense(
        voidTarget._id,
        voidReason.trim()
      );

      setSuccess("Expense voided successfully.");
      setVoidTarget(null);
      setVoidReason("");

      if (editingExpense?._id === voidTarget._id) {
        resetForm();
      }

      await refreshExpenses(selectedProjectId);
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to void this expense.")
      );
    } finally {
      setIsVoiding(false);
    }
  };

  const inputClass =
    "mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]";

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
          Finance
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
          Project Expenses
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Record construction costs and monitor project spending.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-3 font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-6 flex items-center justify-between border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          {success}
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
            className="ml-3 font-semibold"
          >
            ×
          </button>
        </div>
      )}

      <section className="mt-8 border border-[var(--border)] bg-[var(--surface)] p-6">
        <label
          htmlFor="expense-project"
          className="text-sm font-medium text-[var(--foreground)]"
        >
          Select project
        </label>

        <select
          id="expense-project"
          value={selectedProjectId}
          onChange={(event) => {
            setSelectedProjectId(event.target.value);
            resetForm();
            setError("");
            setSuccess("");
          }}
          disabled={isLoadingProjects}
          className={inputClass}
        >
          <option value="">
            {isLoadingProjects
              ? "Loading projects..."
              : "Select a project"}
          </option>

          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>

        {!isLoadingProjects && projects.length === 0 && (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Create a project before recording its expenses.
          </p>
        )}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">
            Active project expenses
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
            {currency.format(activeTotal)}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Excludes voided expenses
          </p>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">
            Active expense records
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
            {activeExpenses.length}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {expenses.length - activeExpenses.length} voided records
          </p>
        </div>
      </section>

      <section className="mt-8 border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {editingExpense ? "Edit Expense" : "Record an Expense"}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {editingExpense
              ? "Update the selected expense details."
              : "Enter the details of a project cost."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-5 md:grid-cols-2"
        >
          <div>
            <label
              htmlFor="expense-category"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Category
            </label>
            <select
              id="expense-category"
              value={form.category}
              onChange={(event) =>
                setForm({
                  ...form,
                  category: event.target.value as ExpenseCategory,
                })
              }
              className={inputClass}
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replace("_", " ").replace(
                    /^\w/,
                    (letter) => letter.toUpperCase()
                  )}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="expense-amount"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Amount (KES)
            </label>
            <input
              id="expense-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) =>
                setForm({ ...form, amount: event.target.value })
              }
              placeholder="e.g. 12500"
              className={inputClass}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="expense-description"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Description
            </label>
            <input
              id="expense-description"
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
              minLength={2}
              maxLength={300}
              placeholder="e.g. Cement delivery for foundation work"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label
              htmlFor="expense-date"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Expense date
            </label>
            <input
              id="expense-date"
              type="date"
              value={form.expenseDate}
              onChange={(event) =>
                setForm({
                  ...form,
                  expenseDate: event.target.value,
                })
              }
              className={inputClass}
              required
            />
          </div>

          <div>
            <label
              htmlFor="expense-receipt"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Receipt / reference number
            </label>
            <input
              id="expense-receipt"
              value={form.receiptNumber}
              onChange={(event) =>
                setForm({
                  ...form,
                  receiptNumber: event.target.value,
                })
              }
              maxLength={100}
              placeholder="Optional"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="expense-notes"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Notes
            </label>
            <textarea
              id="expense-notes"
              value={form.notes}
              onChange={(event) =>
                setForm({ ...form, notes: event.target.value })
              }
              maxLength={500}
              rows={3}
              placeholder="Additional details (optional)"
              className={inputClass}
            />
          </div>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || !selectedProjectId}
              className="border border-[var(--architect-green)] bg-[var(--architect-green)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : editingExpense
                  ? "Save Changes"
                  : "Record Expense"}
            </button>

            {editingExpense && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)]"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="mt-8 border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Expense Records
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Search and review project expenses, including voided records.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="expense-search"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Search
            </label>
            <input
              id="expense-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Description or receipt number"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="expense-filter-category"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Category
            </label>
            <select
              id="expense-filter-category"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className={inputClass}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() +
                    category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="expense-filter-status"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Status
            </label>
            <select
              id="expense-filter-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as StatusFilter
                )
              }
              className={inputClass}
            >
              <option value="active">Active expenses</option>
              <option value="voided">Voided expenses</option>
              <option value="all">All records</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          {!selectedProjectId ? (
            <div className="border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
              Select a project to view its expenses.
            </div>
          ) : isLoadingExpenses ? (
            <div className="border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
              Loading expenses...
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="border border-dashed border-[var(--border)] p-8 text-center">
              <p className="font-medium text-[var(--foreground)]">
                No matching expenses
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Record an expense or adjust your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-3 py-3 font-semibold text-[var(--foreground)]">
                      Date
                    </th>
                    <th className="px-3 py-3 font-semibold text-[var(--foreground)]">
                      Expense
                    </th>
                    <th className="px-3 py-3 font-semibold text-[var(--foreground)]">
                      Category
                    </th>
                    <th className="px-3 py-3 font-semibold text-[var(--foreground)]">
                      Amount
                    </th>
                    <th className="px-3 py-3 font-semibold text-[var(--foreground)]">
                      Status
                    </th>
                    <th className="px-3 py-3 font-semibold text-[var(--foreground)]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense._id}
                      className="border-b border-[var(--border)] last:border-b-0"
                    >
                      <td className="px-3 py-4 text-[var(--muted)]">
                        {formatDate(expense.expenseDate)}
                      </td>

                      <td className="px-3 py-4">
                        <p className="font-medium text-[var(--foreground)]">
                          {expense.description || "Untitled expense"}
                        </p>
                        {expense.receiptNumber && (
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            Ref: {expense.receiptNumber}
                          </p>
                        )}
                        {expense.isVoided && expense.voidReason && (
                          <p className="mt-1 text-xs text-red-700">
                            Reason: {expense.voidReason}
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-4 capitalize text-[var(--muted)]">
                        {expense.category}
                      </td>

                      <td className="px-3 py-4 font-semibold text-[var(--foreground)]">
                        {currency.format(expense.amount)}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={
                            expense.isVoided
                              ? "inline-block border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
                              : "inline-block border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                          }
                        >
                          {expense.isVoided ? "Voided" : "Active"}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        {!expense.isVoided ? (
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => startEditing(expense)}
                              className="font-semibold text-[var(--architect-green)] hover:underline"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setVoidTarget(expense);
                                setVoidReason("");
                                setError("");
                              }}
                              className="font-semibold text-red-700 hover:underline"
                            >
                              Void
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">
                            Retained for audit
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {voidTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isVoiding) {
              setVoidTarget(null);
              setVoidReason("");
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="void-expense-title"
            className="w-full max-w-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl"
          >
            <h2
              id="void-expense-title"
              className="text-xl font-bold text-[var(--foreground)]"
            >
              Void expense
            </h2>

            <p className="mt-2 text-sm text-[var(--muted)]">
              You are voiding{" "}
              <strong>{voidTarget.description}</strong> for{" "}
              <strong>{currency.format(voidTarget.amount)}</strong>.
              This keeps the record for audit purposes.
            </p>

            <form onSubmit={handleVoid} className="mt-5">
              <label
                htmlFor="void-reason"
                className="text-sm font-medium text-[var(--foreground)]"
              >
                Reason for voiding
              </label>

              <textarea
                id="void-reason"
                value={voidReason}
                onChange={(event) =>
                  setVoidReason(event.target.value)
                }
                minLength={3}
                maxLength={500}
                rows={4}
                required
                placeholder="Explain why this expense should be voided..."
                className={inputClass}
              />

              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  disabled={isVoiding}
                  onClick={() => {
                    setVoidTarget(null);
                    setVoidReason("");
                  }}
                  className="border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isVoiding || voidReason.trim().length < 3}
                  className="border border-red-700 bg-red-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isVoiding ? "Voiding..." : "Confirm Void"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
