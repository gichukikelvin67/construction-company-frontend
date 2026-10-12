
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Unable to load suppliers."
      );
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

  const updateField = (
    field: keyof SupplierFormData,
    value: string
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          `Unable to ${editingId ? "update" : "register"} supplier.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (supplier: Supplier) => {
    const nextStatus = !supplier.isActive;
    const action = nextStatus ? "reactivate" : "deactivate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${supplier.name}?`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setStatusUpdatingId(supplier._id);

    try {
      const updated = await setSupplierActive(supplier._id, nextStatus);

      setSuppliers((current) =>
        current.map((item) =>
          item._id === updated._id ? updated : item
        )
      );

      setSuccess(
        `${supplier.name} ${nextStatus ? "reactivated" : "deactivated"} successfully.`
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          `Unable to ${action} supplier.`
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--concrete)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--architect-green)]">
              Procurement
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
              Suppliers
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Manage supplier contacts and maintain reliable records for
              purchasing and inventory operations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setError("");
              setSuccess("");
              document
                .getElementById("supplier-form")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-fit border border-[var(--architect-green)] bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            + Add Supplier
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Suppliers", value: suppliers.length },
            { label: "Active Suppliers", value: activeCount },
            { label: "Inactive Suppliers", value: inactiveCount },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <p className="text-sm text-[var(--muted)]">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
                {loading ? "—" : item.value}
              </p>
            </div>
          ))}
        </section>

        <section
          id="supplier-form"
          className="border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <div className="border-b border-[var(--border)] pb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {editingId ? "Edit Supplier" : "Register Supplier"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {editingId
                ? "Update this supplier's contact information."
                : "Add a supplier to your company's records."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Supplier Name *
                </label>
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  minLength={2}
                  maxLength={150}
                  required
                  placeholder="e.g. Nairobi Building Supplies"
                  className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  minLength={7}
                  maxLength={20}
                  required
                  placeholder="e.g. 0712 345 678"
                  className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email || ""}
                  onChange={(event) => updateField("email", event.target.value)}
                  maxLength={150}
                  placeholder="supplier@example.com"
                  className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Contact Person
                </label>
                <input
                  value={form.contactPerson || ""}
                  onChange={(event) =>
                    updateField("contactPerson", event.target.value)
                  }
                  maxLength={150}
                  placeholder="Sales representative"
                  className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--foreground)]">
                Address
              </label>
              <input
                value={form.address || ""}
                onChange={(event) => updateField("address", event.target.value)}
                maxLength={300}
                placeholder="Business address or location"
                className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--foreground)]">
                Notes
              </label>
              <textarea
                value={form.notes || ""}
                onChange={(event) => updateField("notes", event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Payment terms, products supplied, delivery arrangements..."
                className="mt-2 w-full resize-y border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] disabled:opacity-50"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="border border-[var(--architect-green)] bg-[var(--architect-green)] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Register Supplier"}
              </button>
            </div>
          </form>
        </section>

        <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Supplier Directory
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Search and manage your supplier records.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search suppliers..."
                aria-label="Search suppliers"
                className="w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "all" | "active" | "inactive"
                  )
                }
                aria-label="Filter suppliers by status"
                className="border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              >
                <option value="active">Active suppliers</option>
                <option value="inactive">Inactive suppliers</option>
                <option value="all">All suppliers</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-[var(--muted)]">
              Loading suppliers...
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="border-b border-[var(--border)] py-12 text-center">
              <p className="font-medium text-[var(--foreground)]">
                No suppliers found
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Try another search or register a new supplier.
              </p>
              {(search || statusFilter !== "active") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("active");
                  }}
                  className="mt-4 text-sm font-semibold text-[var(--architect-green)] underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {filteredSuppliers.map((supplier) => (
                <article
                  key={supplier._id}
                  className="border border-[var(--border)] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-[var(--foreground)]">
                          {supplier.name}
                        </h3>
                        <span
                          className={
                            supplier.isActive
                              ? "border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
                              : "border border-[var(--border)] bg-[var(--concrete)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]"
                          }
                        >
                          {supplier.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-x-8 gap-y-2 text-sm text-[var(--muted)] sm:grid-cols-2">
                        <p>
                          <span className="font-medium text-[var(--foreground)]">
                            Phone:
                          </span>{" "}
                          {supplier.phone || "Not provided"}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--foreground)]">
                            Email:
                          </span>{" "}
                          {supplier.email || "Not provided"}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--foreground)]">
                            Contact:
                          </span>{" "}
                          {supplier.contactPerson || "Not provided"}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--foreground)]">
                            Address:
                          </span>{" "}
                          {supplier.address || "Not provided"}
                        </p>
                      </div>

                      {supplier.notes && (
                        <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--muted)]">
                          {supplier.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(supplier)}
                        className="border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--concrete)]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={statusUpdatingId === supplier._id}
                        onClick={() => void handleStatusChange(supplier)}
                        className="border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--concrete)] disabled:opacity-50"
                      >
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
