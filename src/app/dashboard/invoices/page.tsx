
"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  downloadInvoicePdf,
  printInvoice,
} from "@/lib/invoicePdf";

import {
  archiveInvoice,
  createInvoice,
  getInvoices,
  updateInvoice,
  type Invoice,
  type InvoicePagination,
  type InvoiceStatus,
  type InvoiceType,
  type UpdateInvoiceData,
} from "@/services/invoiceService";

import { getProjects, type Project } from "@/services/projectService";

import {
  createPayment,
  getPayments,
  type Payment,
  type PaymentMethod,
} from "@/services/paymentService";

type FilterStatus = "all" | InvoiceStatus;

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--architect-green)] focus:ring-2 focus:ring-[var(--architect-green)]/10";

const statusStyles: Record<string, string> = {
  draft: "border-slate-500/20 bg-slate-500/10 text-slate-600",
  issued: "border-blue-500/20 bg-blue-500/10 text-blue-600",
  partially_paid: "border-amber-500/20 bg-amber-500/10 text-amber-700",
  paid: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
  overdue: "border-red-500/20 bg-red-500/10 text-red-600",
  cancelled: "border-slate-500/20 bg-slate-500/10 text-slate-500",
};

function money(value: number) {
  return `KES ${Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function dateLabel(value?: string) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function dateInputValue(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function labelStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function projectName(invoice: Invoice) {
  if (typeof invoice.project === "object" && invoice.project) {
    return invoice.project.name;
  }

  return "Not linked";
}

function isOverdue(invoice: Invoice) {
  return (
    invoice.amountDue > 0 &&
    invoice.status !== "cancelled" &&
    invoice.status !== "draft" &&
    Boolean(invoice.dueDate) &&
    new Date(invoice.dueDate as string).getTime() < Date.now()
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return fallback;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<InvoicePagination>({
    page: 1,
    limit: 20,
    totalInvoices: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mpesa");
  const [paymentNotes, setPaymentNotes] = useState("");

  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] =
    useState<"draft" | "issued" | "cancelled">("issued");
  const [editSaving, setEditSaving] = useState(false);
  const [archiveSavingId, setArchiveSavingId] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [type, setType] = useState<InvoiceType>("project");
  const [projectId, setProjectId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [description, setDescription] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [taxAmount, setTaxAmount] = useState("0");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [invoiceResult, projectData] = await Promise.all([
        getInvoices({
          page: currentPage,
          limit: pageSize,
          ...(filter !== "all" ? { status: filter } : {}),
          ...(search.trim() ? { search: search.trim() } : {}),
        }),
        getProjects(),
      ]);

      setInvoices(invoiceResult.invoices);
      setPagination(invoiceResult.pagination);
      setProjects(projectData);

      if (
        invoiceResult.pagination.totalPages > 0 &&
        currentPage > invoiceResult.pagination.totalPages
      ) {
        setCurrentPage(invoiceResult.pagination.totalPages);
      } else if (
        invoiceResult.pagination.totalPages === 0 &&
        currentPage !== 1
      ) {
        setCurrentPage(1);
      }
    } catch (loadError) {
      console.error("Unable to load invoice data:", loadError);

      setError(
        getErrorMessage(
          loadError,
          "Unable to load invoices. Check your connection and access permissions, then try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filter, search]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch =
        !term ||
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        (invoice.description ?? "").toLowerCase().includes(term) ||
        projectName(invoice).toLowerCase().includes(term) ||
        (typeof invoice.supplier === "object" && invoice.supplier
          ? invoice.supplier.name.toLowerCase().includes(term)
          : false);

      const status = isOverdue(invoice) ? "overdue" : invoice.status;
      const matchesStatus = filter === "all" || status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, filter]);

  const summary = useMemo(() => {
    return invoices.reduce(
      (result, invoice) => {
        if (invoice.status !== "cancelled") {
          result.invoiced += invoice.totalAmount;
          result.collected += invoice.amountPaid;
          result.outstanding += invoice.amountDue;
        }

        if (isOverdue(invoice)) {
          result.overdue += invoice.amountDue;
          result.overdueCount += 1;
        }

        return result;
      },
      {
        invoiced: 0,
        collected: 0,
        outstanding: 0,
        overdue: 0,
        overdueCount: 0,
      }
    );
  }, [invoices]);

  const filters: { label: string; value: FilterStatus }[] = [
    { label: "All invoices", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Issued", value: "issued" },
    { label: "Partially paid", value: "partially_paid" },
    { label: "Paid", value: "paid" },
    { label: "Overdue", value: "overdue" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const numericSubtotal = Number(subtotal || 0);
  const numericTax = Number(taxAmount || 0);
  const total = numericSubtotal + numericTax;

  const selectedInvoice = invoices.find(
    (invoice) => invoice._id === selectedInvoiceId
  );

  function resetForm() {
    setInvoiceNumber("");
    setType("project");
    setProjectId("");
    setSupplierId("");
    setDescription("");
    setIssueDate("");
    setDueDate("");
    setSubtotal("");
    setTaxAmount("0");
  }

  function openEditForm(invoice: Invoice) {
    setError("");
    setSuccess("");
    setEditingInvoice(invoice);
    setEditDescription(invoice.description ?? "");
    setEditDueDate(dateInputValue(invoice.dueDate));
    setEditStatus(
      invoice.status === "cancelled"
        ? "cancelled"
        : invoice.status === "draft"
          ? "draft"
          : "issued"
    );
  }

  function closeEditForm() {
    if (editSaving) return;

    setEditingInvoice(null);
    setEditDescription("");
    setEditDueDate("");
    setEditStatus("issued");
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingInvoice) return;

    setError("");
    setSuccess("");

    if (!editDueDate) {
      setError("Enter a due date.");
      return;
    }

    if (
      editStatus === "cancelled" &&
      editingInvoice.amountPaid > 0
    ) {
      setError(
        "This invoice has payments recorded. Check your accounting records before cancelling it."
      );
      return;
    }

    const updateData: UpdateInvoiceData = {
      description: editDescription.trim(),
      dueDate: new Date(
        `${editDueDate}T00:00:00.000Z`
      ).toISOString(),
      status: editStatus,
    };

    setEditSaving(true);

    try {
      await updateInvoice(editingInvoice._id, updateData);
      await loadData();

      setEditingInvoice(null);
      setSuccess(
        `Invoice ${editingInvoice.invoiceNumber} updated successfully.`
      );
    } catch (editError) {
      console.error("Invoice update failed:", editError);

      setError(
        getErrorMessage(
          editError,
          "Unable to update the invoice. Check your permissions and invoice details."
        )
      );
    } finally {
      setEditSaving(false);
    }
  }

  async function handleArchive(invoice: Invoice) {
    if (archiveSavingId) return;

    if (
      invoice.amountDue > 0 &&
      invoice.status !== "cancelled"
    ) {
      setError(
        "This invoice has an outstanding balance. Cancel it first if appropriate, then archive it."
      );
      return;
    }

    const confirmed = window.confirm(
      `Archive invoice ${invoice.invoiceNumber}? It will be removed from the active invoice register.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setArchiveSavingId(invoice._id);

    try {
      await archiveInvoice(invoice._id);

      if (selectedInvoiceId === invoice._id) {
        setSelectedInvoiceId("");
        setPayments([]);
      }

      await loadData();

      setSuccess(
        `Invoice ${invoice.invoiceNumber} archived successfully.`
      );
    } catch (archiveError) {
      console.error("Invoice archive failed:", archiveError);

      setError(
        getErrorMessage(
          archiveError,
          "Unable to archive this invoice. Check your permissions and whether the invoice has an outstanding balance."
        )
      );
    } finally {
      setArchiveSavingId("");
    }
  }

  async function openPaymentPanel(invoice: Invoice) {
    setSelectedInvoiceId(invoice._id);
    setPaymentError("");
    setPaymentReference("");
    setPaymentAmount("");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod("mpesa");
    setPaymentNotes("");
    setLoadingPayments(true);

    try {
      const paymentData = await getPayments(invoice._id);
      setPayments(paymentData);
    } catch (loadError) {
      console.error("Unable to load payment history:", loadError);
      setPayments([]);

      setPaymentError(
        getErrorMessage(
          loadError,
          "Unable to load payment history. Close and reopen this invoice to retry."
        )
      );
    } finally {
      setLoadingPayments(false);
    }
  }

  async function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaymentError("");
    setError("");
    setSuccess("");

    const invoice = invoices.find(
      (item) => item._id === selectedInvoiceId
    );

    const amount = Number(paymentAmount);

    if (!invoice) {
      setPaymentError("Select an invoice before recording a payment.");
      return;
    }

    if (!paymentReference.trim()) {
      setPaymentError("Enter the payment reference.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError("Enter a payment amount greater than zero.");
      return;
    }

    if (amount > invoice.amountDue) {
      setPaymentError(
        "The payment cannot exceed the invoice's outstanding balance."
      );
      return;
    }

    if (!paymentDate) {
      setPaymentError("Select the payment date.");
      return;
    }

    setPaymentSaving(true);

    try {
      await createPayment({
        invoiceId: invoice._id,
        paymentReference: paymentReference.trim(),
        amount,
        paymentDate: new Date(
          `${paymentDate}T00:00:00.000Z`
        ).toISOString(),
        method: paymentMethod,
        ...(paymentNotes.trim()
          ? { notes: paymentNotes.trim() }
          : {}),
      });

      const [invoiceResult, paymentData] = await Promise.all([
        getInvoices({
          page: currentPage,
          limit: pageSize,
          ...(filter !== "all" ? { status: filter } : {}),
          ...(search.trim() ? { search: search.trim() } : {}),
        }),
        getPayments(invoice._id),
      ]);

      setInvoices(invoiceResult.invoices);
      setPagination(invoiceResult.pagination);
      setPayments(paymentData);
      setPaymentReference("");
      setPaymentAmount("");
      setPaymentNotes("");

      setSuccess(
        "Payment recorded successfully. Invoice balances have been refreshed."
      );
    } catch (submitError) {
      console.error("Payment recording failed:", submitError);

      setPaymentError(
        getErrorMessage(
          submitError,
          "Unable to record payment. Check the payment details, permissions, and reference number."
        )
      );
    } finally {
      setPaymentSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!issueDate || !dueDate) {
      setError("Enter both the issue date and due date.");
      return;
    }

    if (dueDate < issueDate) {
      setError("The due date cannot be before the issue date.");
      return;
    }

    if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
      setError("Enter a valid subtotal.");
      return;
    }

    if (!Number.isFinite(numericTax) || numericTax < 0) {
      setError("Enter a valid tax amount.");
      return;
    }

    if (!invoiceNumber.trim()) {
      setError("Enter an invoice number.");
      return;
    }

    if (type === "supplier" && !supplierId.trim()) {
      setError("Enter the supplier ID for this supplier invoice.");
      return;
    }

    setSaving(true);

    try {
      await createInvoice({
        invoiceNumber: invoiceNumber.trim(),
        type,
        ...(projectId ? { projectId } : {}),
        ...(type === "supplier"
          ? { supplierId: supplierId.trim() }
          : {}),
        description: description.trim(),
        issueDate: new Date(
          `${issueDate}T00:00:00.000Z`
        ).toISOString(),
        dueDate: new Date(
          `${dueDate}T00:00:00.000Z`
        ).toISOString(),
        subtotal: numericSubtotal,
        taxAmount: numericTax,
      });

      const refreshedInvoices = await getInvoices({
        page: 1,
        limit: pageSize,
      });

      setInvoices(refreshedInvoices.invoices);
      setPagination(refreshedInvoices.pagination);
      setCurrentPage(1);
      setFilter("all");
      setSearch("");

      resetForm();
      setShowForm(false);
      setSuccess("Invoice created successfully.");
    } catch (submitError) {
      console.error("Invoice creation failed:", submitError);

      setError(
        getErrorMessage(
          submitError,
          "Unable to create the invoice. Check the invoice details and try again."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-5 border-b border-[var(--border)] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--architect-green)]">
            Finance / Accounts receivable and payable
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Invoices and billing
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Manage construction billing, monitor outstanding balances, and keep
            invoice records organized across your projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            setError("");
            setSuccess("");
          }}
          className="rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        >
          {showForm ? "Close form" : "Create invoice"}
        </button>
      </header>

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="mt-2 text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total invoiced"
          value={money(summary.invoiced)}
          detail={`Current page only · ${pagination.totalInvoices} matching invoices`}
        />

        <SummaryCard
          label="Payments collected"
          value={money(summary.collected)}
          detail="Current page only"
        />

        <SummaryCard
          label="Outstanding balance"
          value={money(summary.outstanding)}
          detail="Current page only"
        />

        <SummaryCard
          label="Overdue balance"
          value={money(summary.overdue)}
          detail={`${summary.overdueCount} overdue on this page`}
          warning
        />
      </section>

      {showForm && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--architect-green)]">
              Invoice details
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
              Create a new invoice
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Enter the billing information and confirm the amount before saving.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7"
          >
            <Field label="Invoice number" htmlFor="invoiceNumber">
              <input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(event) => setInvoiceNumber(event.target.value)}
                placeholder="e.g. INV-2026-001"
                maxLength={100}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Invoice type" htmlFor="invoiceType">
              <select
                id="invoiceType"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as InvoiceType)
                }
                className={inputClass}
              >
                <option value="project">Project invoice</option>
                <option value="client">Client invoice</option>
                <option value="supplier">Supplier invoice</option>
              </select>
            </Field>

            <Field label="Linked project" htmlFor="invoiceProject">
              <select
                id="invoiceProject"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                className={inputClass}
              >
                <option value="">No project selected</option>

                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </Field>

            {type === "supplier" && (
              <Field label="Supplier ID" htmlFor="supplierId">
                <input
                  id="supplierId"
                  value={supplierId}
                  onChange={(event) => setSupplierId(event.target.value)}
                  placeholder="Paste the supplier record ID"
                  required
                  className={inputClass}
                />

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Enter the ID of an existing supplier record.
                </p>
              </Field>
            )}

            <div className="sm:col-span-2">
              <Field label="Description" htmlFor="invoiceDescription">
                <textarea
                  id="invoiceDescription"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the work, materials, or services being billed"
                  rows={3}
                  maxLength={2000}
                  className={`${inputClass} resize-y`}
                />
              </Field>
            </div>

            <Field label="Issue date" htmlFor="issueDate">
              <input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(event) => setIssueDate(event.target.value)}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Due date" htmlFor="dueDate">
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                min={issueDate || undefined}
                onChange={(event) => setDueDate(event.target.value)}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Subtotal (KES)" htmlFor="invoiceSubtotal">
              <input
                id="invoiceSubtotal"
                type="number"
                min="0"
                step="0.01"
                value={subtotal}
                onChange={(event) => setSubtotal(event.target.value)}
                placeholder="0.00"
                required
                className={inputClass}
              />
            </Field>

            <Field label="Tax amount (KES)" htmlFor="invoiceTax">
              <input
                id="invoiceTax"
                type="number"
                min="0"
                step="0.01"
                value={taxAmount}
                onChange={(event) => setTaxAmount(event.target.value)}
                required
                className={inputClass}
              />
            </Field>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 sm:col-span-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-[var(--muted)]">Subtotal</span>
                <span className="font-medium text-[var(--foreground)]">
                  {money(numericSubtotal)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                <span className="text-[var(--muted)]">Tax</span>
                <span className="font-medium text-[var(--foreground)]">
                  {money(numericTax)}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4">
                <span className="font-semibold text-[var(--foreground)]">
                  Invoice total
                </span>

                <span className="text-xl font-bold tracking-tight text-[var(--architect-green)]">
                  {money(total)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving invoice..." : "Save invoice"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {editingInvoice && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--architect-green)]">
              Invoice maintenance
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
              Edit {editingInvoice.invoiceNumber}
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Invoice amounts and issue date are not editable here.
            </p>
          </div>

          <form
            onSubmit={handleEditSubmit}
            className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7"
          >
            <div className="sm:col-span-2">
              <Field label="Description" htmlFor="editDescription">
                <textarea
                  id="editDescription"
                  value={editDescription}
                  onChange={(event) =>
                    setEditDescription(event.target.value)
                  }
                  rows={3}
                  maxLength={2000}
                  className={`${inputClass} resize-y`}
                />
              </Field>
            </div>

            <Field label="Due date" htmlFor="editDueDate">
              <input
                id="editDueDate"
                type="date"
                value={editDueDate}
                onChange={(event) => setEditDueDate(event.target.value)}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Invoice status" htmlFor="editStatus">
              <select
                id="editStatus"
                value={editStatus}
                onChange={(event) =>
                  setEditStatus(
                    event.target.value as "draft" | "issued" | "cancelled"
                  )
                }
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Your backend controls which status changes are permitted.
              </p>
            </Field>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 sm:col-span-2">
              <p className="text-sm text-[var(--muted)]">
                Total: {money(editingInvoice.totalAmount)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Paid: {money(editingInvoice.amountPaid)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Outstanding: {money(editingInvoice.amountDue)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={editSaving}
                className="rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {editSaving ? "Saving changes..." : "Save changes"}
              </button>

              <button
                type="button"
                disabled={editSaving}
                onClick={closeEditForm}
                className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)] disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {selectedInvoice && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--architect-green)]">
                Payment management
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                {selectedInvoice.invoiceNumber}
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Invoice total: {money(selectedInvoice.totalAmount)}
              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Paid: {money(selectedInvoice.amountPaid)} · Outstanding:{" "}
                {money(selectedInvoice.amountDue)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedInvoiceId("");
                setPayments([]);
                setPaymentError("");
              }}
              className="self-start rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)]"
            >
              Close payments
            </button>
          </div>

          {paymentError && (
            <div
              role="alert"
              className="mx-5 mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 sm:mx-7"
            >
              {paymentError}
            </div>
          )}

          {selectedInvoice.amountDue > 0 &&
            selectedInvoice.status !== "cancelled" &&
            selectedInvoice.status !== "draft" && (
              <form
                onSubmit={handlePaymentSubmit}
                className="grid gap-5 border-b border-[var(--border)] p-5 sm:grid-cols-2 sm:p-7"
              >
                <div className="sm:col-span-2">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    Record a payment
                  </h3>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Record payments only after they have actually been received.
                    Selecting M-Pesa does not initiate an STK Push.
                  </p>
                </div>

                <Field label="Payment reference" htmlFor="paymentReference">
                  <input
                    id="paymentReference"
                    value={paymentReference}
                    onChange={(event) =>
                      setPaymentReference(event.target.value)
                    }
                    placeholder="M-Pesa transaction code or receipt number"
                    maxLength={150}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Amount received (KES)" htmlFor="paymentAmount">
                  <input
                    id="paymentAmount"
                    type="number"
                    min="0.01"
                    max={selectedInvoice.amountDue}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(event) =>
                      setPaymentAmount(event.target.value)
                    }
                    placeholder="0.00"
                    required
                    className={inputClass}
                  />

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Maximum outstanding balance:{" "}
                    {money(selectedInvoice.amountDue)}
                  </p>
                </Field>

                <Field label="Payment date" htmlFor="paymentDate">
                  <input
                    id="paymentDate"
                    type="date"
                    value={paymentDate}
                    onChange={(event) => setPaymentDate(event.target.value)}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Payment method" htmlFor="paymentMethod">
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value as PaymentMethod)
                    }
                    className={inputClass}
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank transfer</option>
                    <option value="card">Card</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Notes (optional)" htmlFor="paymentNotes">
                    <textarea
                      id="paymentNotes"
                      value={paymentNotes}
                      onChange={(event) => setPaymentNotes(event.target.value)}
                      placeholder="Additional payment details"
                      rows={2}
                      maxLength={2000}
                      className={`${inputClass} resize-y`}
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={paymentSaving}
                    className="rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {paymentSaving ? "Recording payment..." : "Record payment"}
                  </button>
                </div>
              </form>
            )}

          <div className="p-5 sm:p-7">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Payment history
            </h3>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Previous payments recorded against this invoice.
            </p>

            {loadingPayments ? (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Loading payment history...
              </p>
            ) : payments.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">
                No payments have been recorded for this invoice yet.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                      {[
                        "Reference",
                        "Date",
                        "Method",
                        "Amount",
                        "Notes",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="border-b border-[var(--border)] last:border-b-0"
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
                          {payment.paymentReference}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--muted)]">
                          {dateLabel(payment.paymentDate)}
                        </td>

                        <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                          {labelStatus(payment.method)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
                          {money(payment.amount)}
                        </td>

                        <td className="max-w-[240px] px-4 py-3 text-sm text-[var(--muted)]">
                          {payment.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] p-5 sm:p-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Invoice register
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              {loading
                ? "Loading invoices..."
                : `Showing ${
                    invoices.length ? (currentPage - 1) * pageSize + 1 : 0
                  }–${Math.min(
                    currentPage * pageSize,
                    pagination.totalInvoices
                  )} of ${pagination.totalInvoices} invoices`}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_180px] xl:w-[480px]">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search invoice number or description"
              aria-label="Search invoices"
              className={inputClass}
            />

            <select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value as FilterStatus);
                setCurrentPage(1);
              }}
              aria-label="Filter invoices by status"
              className={inputClass}
            >
              {filters.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-xl bg-[var(--background)]"
              />
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-8">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              {pagination.totalInvoices === 0
                ? "Your invoice register is ready"
                : "No matching invoices"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
              {pagination.totalInvoices === 0
                ? "Create your first invoice to start tracking construction billing and outstanding balances."
                : "Try another search term or select a different status."}
            </p>

            {pagination.totalInvoices === 0 && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white"
              >
                Create your first invoice
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1350px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                  {[
                    "Invoice",
                    "Project",
                    "Issue date",
                    "Due date",
                    "Total amount",
                    "Outstanding",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((invoice) => {
                  const overdue = isOverdue(invoice);
                  const status = overdue ? "overdue" : invoice.status;
                  const canArchive =
                    invoice.amountDue <= 0 ||
                    invoice.status === "cancelled";

                  return (
                    <tr
                      key={invoice._id}
                      className="border-b border-[var(--border)] last:border-b-0 transition hover:bg-[var(--background)]/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[var(--foreground)]">
                          {invoice.invoiceNumber}
                        </p>

                        <p className="mt-1 max-w-[220px] truncate text-xs text-[var(--muted)]">
                          {invoice.description || labelStatus(invoice.type)}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--foreground)]">
                        {projectName(invoice)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-[var(--muted)]">
                        {dateLabel(invoice.issueDate)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-[var(--muted)]">
                        {dateLabel(invoice.dueDate)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-[var(--foreground)]">
                        {money(invoice.totalAmount)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-[var(--foreground)]">
                        {money(invoice.amountDue)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            statusStyles[status] ?? statusStyles.draft
                          }`}
                        >
                          {labelStatus(status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(invoice)}
                            className="whitespace-nowrap rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void openPaymentPanel(invoice)}
                            className="whitespace-nowrap rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--architect-green)] transition hover:bg-[var(--background)]"
                          >
                            Payments
                          </button>
                          
<button
  type="button"
  onClick={() => downloadInvoicePdf(invoice)}
  className="whitespace-nowrap rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
>
  Download PDF
</button>

<button
  type="button"
  onClick={() => printInvoice(invoice)}
  className="whitespace-nowrap rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
>
  Print Invoice
</button>


                          <button
                            type="button"
                            disabled={
                              !canArchive || archiveSavingId === invoice._id
                            }
                            title={
                              canArchive
                                ? "Archive invoice"
                                : "Cancel the invoice before archiving while a balance remains"
                            }
                            onClick={() => void handleArchive(invoice)}
                            className="whitespace-nowrap rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {archiveSavingId === invoice._id
                              ? "Archiving..."
                              : "Archive"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <label htmlFor="invoicePageSize">Rows per page</label>

            <select
              id="invoicePageSize"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <span>
              Page {pagination.totalPages === 0 ? 0 : currentPage} of{" "}
              {pagination.totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              disabled={loading || !pagination.hasPreviousPage}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={loading || !pagination.hasNextPage}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[var(--border)] px-5 py-4 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>Amounts shown in Kenyan shillings (KES).</span>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="self-start font-semibold text-[var(--architect-green)] hover:underline disabled:opacity-50 sm:self-auto"
          >
            Refresh invoices
          </button>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  warning = false,
}: {
  label: string;
  value: string;
  detail: string;
  warning?: boolean;
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          warning ? "bg-red-500" : "bg-[var(--architect-green)]"
        }`}
      />

      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>

      <p className="mt-4 break-words text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
        {detail}
      </p>
    </article>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-[var(--foreground)]"
      >
        {label}
      </label>

      {children}
    </div>
  );
}
