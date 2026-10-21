
"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Truck,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  X,
} from "lucide-react";

import {
  createSupplier,
  getSuppliers,
  setSupplierActive,
  updateSupplier,
  type Supplier,
  type SupplierFormData,
} from "@/services/supplierService";

const emptyForm: SupplierFormData = {
  name: "",
  phone: "",
  email: "",
  address: "",
  contactPerson: "",
  notes: "",
};

const supplierImages = [
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1513467655676-561b7d489a88?auto=format&fit=crop&w=1000&q=80",
];

const inputClass =
  "mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--architect-green)] focus:ring-2 focus:ring-[var(--architect-green)]/10";

const labelClass =
  "text-sm font-medium text-[var(--foreground)]";

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof Building2;
  loading: boolean;
}) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            {loading ? "—" : value.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">{description}</p>
        </div>
        <div className="rounded-xl bg-[var(--concrete)] p-3 text-[var(--architect-green)]">
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>
    </article>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<SupplierFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Unable to load suppliers.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSuppliers();
  }, [loadSuppliers]);

  const filteredSuppliers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && supplier.isActive) ||
        (statusFilter === "inactive" && !supplier.isActive);

      const searchableText = [
        supplier.name,
        supplier.phone,
        supplier.email,
        supplier.contactPerson,
        supplier.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!term || searchableText.includes(term));
    });
  }, [suppliers, search, statusFilter]);

  const activeCount = suppliers.filter((supplier) => supplier.isActive).length;
  const inactiveCount = suppliers.length - activeCount;

  const updateField = (field: keyof SupplierFormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setForm({
      name: supplier.name,
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      contactPerson: supplier.contactPerson || "",
      notes: supplier.notes || "",
    });
    setEditingId(supplier._id);
    setError("");
    setSuccess("");
    document
      .getElementById("supplier-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload: SupplierFormData = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email?.trim() || undefined,
      address: form.address?.trim() || undefined,
      contactPerson: form.contactPerson?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    };

    setSaving(true);

    try {
      if (editingId) {
        const updated = await updateSupplier(editingId, payload);

        setSuppliers((current) =>
          current.map((supplier) =>
            supplier._id === updated._id ? updated : supplier
          )
        );

        setSuccess("Supplier updated successfully.");
      } else {
        const created = await createSupplier(payload);
        setSuppliers((current) => [created, ...current]);
        setSuccess("Supplier registered successfully.");
      }

      resetForm();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        `Unable to ${editingId ? "update" : "register"} supplier.`;
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (supplier: Supplier) => {
    const nextStatus = !supplier.isActive;
    const action = nextStatus ? "reactivate" : "deactivate";

    if (!window.confirm(`Are you sure you want to ${action} ${supplier.name}?`)) {
      return;
    }

    setError("");
    setSuccess("");
    setStatusUpdatingId(supplier._id);

    try {
      const updated = await setSupplierActive(supplier._id, nextStatus);

      setSuppliers((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );

      setSuccess(
        `${supplier.name} ${nextStatus ? "reactivated" : "deactivated"} successfully.`
      );
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || `Unable to ${action} supplier.`;
      setError(message);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const openCreateForm = () => {
    resetForm();
    setError("");
    setSuccess("");
    document
      .getElementById("supplier-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[var(--concrete)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="relative overflow-hidden rounded-2xl bg-[var(--steel-950)] p-6 text-white shadow-lg sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-white/10" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--architect-green-light)]">
                <Truck size={15} />
                Procurement &amp; Resources
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Supplier Directory
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                Build reliable supplier relationships and keep your construction
                purchasing contacts organized in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <Plus size={18} />
              Add supplier
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <p className="flex-1">{success}</p>
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label="Total suppliers"
            value={suppliers.length}
            description="All registered supplier records"
            icon={Building2}
            loading={loading}
          />
          <SummaryCard
            label="Active suppliers"
            value={activeCount}
            description="Available for ongoing operations"
            icon={UserRoundCheck}
            loading={loading}
          />
          <SummaryCard
            label="Inactive suppliers"
            value={inactiveCount}
            description="Currently deactivated records"
            icon={UserRoundX}
            loading={loading}
          />
        </section>

        <section
          id="supplier-form"
          className="scroll-mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
        >
          <div className="flex items-start gap-4 border-b border-[var(--border)] px-5 py-5 sm:px-7">
            <div className="rounded-xl bg-[var(--concrete)] p-3 text-[var(--architect-green)]">
              {editingId ? <Pencil size={21} /> : <Plus size={21} />}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {editingId ? "Edit supplier details" : "Register a supplier"}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {editingId
                  ? "Keep the supplier's contact information up to date."
                  : "Add a trusted supplier to your company's records."}
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--concrete)] disabled:opacity-50"
              >
                <X size={15} />
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="supplier-name" className={labelClass}>
                  Supplier name *
                </label>
                <input
                  id="supplier-name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  minLength={2}
                  maxLength={150}
                  required
                  placeholder="e.g. Nairobi Building Supplies"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="supplier-phone" className={labelClass}>
                  Phone number *
                </label>
                <input
                  id="supplier-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  minLength={7}
                  maxLength={20}
                  required
                  placeholder="e.g. 0712 345 678"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="supplier-email" className={labelClass}>
                  Email address
                </label>
                <input
                  id="supplier-email"
                  type="email"
                  value={form.email || ""}
                  onChange={(event) => updateField("email", event.target.value)}
                  maxLength={150}
                  placeholder="supplier@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="supplier-contact" className={labelClass}>
                  Contact person
                </label>
                <input
                  id="supplier-contact"
                  value={form.contactPerson || ""}
                  onChange={(event) =>
                    updateField("contactPerson", event.target.value)
                  }
                  maxLength={150}
                  placeholder="Sales representative"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="supplier-address" className={labelClass}>
                Business address
              </label>
              <input
                id="supplier-address"
                value={form.address || ""}
                onChange={(event) => updateField("address", event.target.value)}
                maxLength={300}
                placeholder="Business address or location"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="supplier-notes" className={labelClass}>
                Notes and supply arrangements
              </label>
              <textarea
                id="supplier-notes"
                value={form.notes || ""}
                onChange={(event) => updateField("notes", event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Payment terms, products supplied, delivery arrangements..."
                className={`${inputClass} resize-y`}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--border)] pt-5">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--concrete)] disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--architect-green)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && (
                  <RefreshCw size={16} className="animate-spin" />
                )}
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Register supplier"}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
                Your network
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                Registered suppliers
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {loading
                  ? "Retrieving supplier records..."
                  : `${filteredSuppliers.length} ${filteredSuppliers.length === 1 ? "supplier" : "suppliers"} shown`}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search suppliers..."
                  aria-label="Search suppliers"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--architect-green)]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "all" | "active" | "inactive"
                  )
                }
                aria-label="Filter suppliers by status"
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              >
                <option value="active">Active suppliers</option>
                <option value="inactive">Inactive suppliers</option>
                <option value="all">All suppliers</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                >
                  <div className="h-40 animate-pulse bg-[var(--border)]" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--border)]" />
                    <div className="h-3 w-full animate-pulse rounded bg-[var(--border)]" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-[var(--border)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--concrete)] text-[var(--muted)]">
                <Package size={25} />
              </div>
              <h3 className="mt-4 font-semibold text-[var(--foreground)]">
                No suppliers found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                {search
                  ? "No suppliers match your search. Try another name, contact, email, or location."
                  : "There are no suppliers in this view yet. Register a supplier or select another status filter."}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {(search || statusFilter !== "active") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("active");
                    }}
                    className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--concrete)]"
                  >
                    Clear filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--architect-green)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  <Plus size={16} />
                  Add supplier
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredSuppliers.map((supplier, index) => (
                <article
                  key={supplier._id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className="relative h-40 bg-[var(--steel-800)] bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${supplierImages[index % supplierImages.length]}")`,
                    }}
                    role="img"
                    aria-label="Illustrative construction and building-supply photograph"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />
                    <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-black/25 text-white backdrop-blur-sm">
                      <Building2 size={21} />
                    </div>
                    <span
                      className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${
                        supplier.isActive
                          ? "border-emerald-200/30 bg-emerald-950/70 text-emerald-100"
                          : "border-white/20 bg-black/50 text-white/80"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          supplier.isActive ? "bg-emerald-400" : "bg-white/50"
                        }`}
                      />
                      {supplier.isActive ? "Active" : "Inactive"}
                    </span>
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/65">
                        Supplier
                      </p>
                      <h3 className="mt-1 break-words text-lg font-semibold text-white">
                        {supplier.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm">
                        <Phone
                          size={16}
                          className="mt-0.5 shrink-0 text-[var(--architect-green)]"
                        />
                        <span className="break-words text-[var(--foreground)]">
                          {supplier.phone || "Phone not provided"}
                        </span>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Mail
                          size={16}
                          className="mt-0.5 shrink-0 text-[var(--architect-green)]"
                        />
                        <span className="break-all text-[var(--muted)]">
                          {supplier.email || "Email not provided"}
                        </span>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <UserRound
                          size={16}
                          className="mt-0.5 shrink-0 text-[var(--architect-green)]"
                        />
                        <span className="break-words text-[var(--muted)]">
                          {supplier.contactPerson || "Contact person not provided"}
                        </span>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-[var(--architect-green)]"
                        />
                        <span className="break-words text-[var(--muted)]">
                          {supplier.address || "Address not provided"}
                        </span>
                      </div>
                    </div>

                    {supplier.notes && (
                      <div className="mt-4 rounded-lg bg-[var(--concrete)] p-3">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          <FileText size={14} />
                          Notes
                        </p>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-[var(--foreground)]">
                          {supplier.notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap gap-2 border-t border-[var(--border)] pt-4 mt-5">
                      <button
                        type="button"
                        onClick={() => handleEdit(supplier)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--concrete)]"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={statusUpdatingId === supplier._id}
                        onClick={() => void handleStatusChange(supplier)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--concrete)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {statusUpdatingId === supplier._id ? (
                          <RefreshCw size={15} className="animate-spin" />
                        ) : supplier.isActive ? (
                          <UserRoundX size={15} />
                        ) : (
                          <UserRoundCheck size={15} />
                        )}
                        {statusUpdatingId === supplier._id
                          ? "Updating..."
                          : supplier.isActive
                            ? "Deactivate"
                            : "Reactivate"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
