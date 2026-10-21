
"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  X,
  XCircle,
} from "lucide-react";

import {
  approvePurchaseOrder,
  cancelPurchaseOrder,
  createPurchaseOrder,
  getPurchaseOrders,
  receivePurchaseOrder,
  rejectPurchaseOrder,
  submitPurchaseOrder,
  type PurchaseOrder,
  type PurchaseOrderStatus,
} from "@/services/purchaseOrderService";
import { getSuppliers, type Supplier } from "@/services/supplierService";
import { getProjects, type Project } from "@/services/projectService";
import { getMaterials, type Material } from "@/services/stockService";

interface OrderLine {
  materialId: string;
  quantity: string;
  unitCost: string;
}

const statuses: Array<PurchaseOrderStatus | "all"> = [
  "all",
  "draft",
  "pending_approval",
  "approved",
  "partially_received",
  "received",
  "rejected",
  "cancelled",
];

const statusLabel: Record<PurchaseOrderStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
  partially_received: "Partially received",
  received: "Received",
  cancelled: "Cancelled",
};

const statusColors: Record<PurchaseOrderStatus, string> = {
  draft: "border-slate-200 bg-slate-100 text-slate-700",
  pending_approval: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-blue-200 bg-blue-50 text-blue-800",
  rejected: "border-red-200 bg-red-50 text-red-700",
  partially_received: "border-orange-200 bg-orange-50 text-orange-800",
  received: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-gray-200 bg-gray-100 text-gray-700",
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2,
  }).format(amount);

const getSupplierName = (supplier: PurchaseOrder["supplier"]) =>
  typeof supplier === "string" ? supplier : supplier.name;

const getProjectName = (project: PurchaseOrder["project"]) =>
  typeof project === "string" ? project : project.name;

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--architect-green)] focus:ring-2 focus:ring-[var(--architect-green)]/10";

const labelClass = "text-sm font-medium text-[var(--foreground)]";

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
  icon: typeof ClipboardList;
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

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [supplierId, setSupplierId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([
    { materialId: "", quantity: "1", unitCost: "0" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<PurchaseOrderStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [orderData, supplierData, projectData, materialData] =
        await Promise.all([
          getPurchaseOrders(),
          getSuppliers(),
          getProjects(),
          getMaterials(),
        ]);

      setOrders(orderData);
      setSuppliers(supplierData.filter((supplier) => supplier.isActive));
      setProjects(projectData);
      setMaterials(materialData.filter((material) => material.isActive));
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? String(
              (err as { response?: { data?: { message?: string } } })
                .response?.data?.message || "Unable to load purchase orders."
            )
          : "Unable to load purchase orders. Check your connection and try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesSearch =
        !query ||
        order.poNumber.toLowerCase().includes(query) ||
        getSupplierName(order.supplier).toLowerCase().includes(query) ||
        getProjectName(order.project).toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const totals = useMemo(
    () => ({
      all: orders.length,
      pending: orders.filter((order) => order.status === "pending_approval")
        .length,
      approved: orders.filter(
        (order) =>
          order.status === "approved" ||
          order.status === "partially_received"
      ).length,
      received: orders.filter((order) => order.status === "received").length,
    }),
    [orders]
  );

  const estimatedTotal = lines.reduce((sum, line) => {
    const quantity = Number(line.quantity);
    const unitCost = Number(line.unitCost);

    return (
      sum +
      (Number.isFinite(quantity) && Number.isFinite(unitCost)
        ? quantity * unitCost
        : 0)
    );
  }, 0);

  const updateLine = (
    index: number,
    field: keyof OrderLine,
    value: string
  ) => {
    setLines((current) =>
      current.map((line, i) =>
        i === index ? { ...line, [field]: value } : line
      )
    );
  };

  const resetForm = () => {
    setSupplierId("");
    setProjectId("");
    setNotes("");
    setLines([{ materialId: "", quantity: "1", unitCost: "0" }]);
    setShowForm(false);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!supplierId || !projectId) {
      setError("Select a supplier and project.");
      return;
    }

    if (
      lines.some(
        (line) =>
          !line.materialId ||
          !Number.isFinite(Number(line.quantity)) ||
          Number(line.quantity) <= 0 ||
          !Number.isFinite(Number(line.unitCost)) ||
          Number(line.unitCost) < 0
      )
    ) {
      setError("Choose a material and enter valid quantities and unit costs.");
      return;
    }

    const materialIds = lines.map((line) => line.materialId);
    if (new Set(materialIds).size !== materialIds.length) {
      setError(
        "Each material can only appear once. Update its existing row."
      );
      return;
    }

    setSaving(true);

    try {
      await createPurchaseOrder({
        supplierId,
        projectId,
        notes: notes.trim() || undefined,
        items: lines.map((line) => ({
          materialId: line.materialId,
          quantity: Number(line.quantity),
          unitCost: Number(line.unitCost),
        })),
      });

      resetForm();
      setSuccess("Purchase order created successfully.");
      await loadData();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? String(
              (err as { response?: { data?: { message?: string } } })
                .response?.data?.message || "Unable to create purchase order."
            )
          : "Unable to create purchase order.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (
    order: PurchaseOrder,
    action: "submit" | "approve" | "reject" | "cancel" | "receive"
  ) => {
    setError("");
    setSuccess("");
    setBusyOrderId(order._id);

    try {
      if (action === "submit") {
        await submitPurchaseOrder(order._id);
      } else if (action === "approve") {
        await approvePurchaseOrder(order._id);
      } else if (action === "reject") {
        const reason = window.prompt("Enter the rejection reason:");

        if (!reason || reason.trim().length < 5) {
          setError("Enter a rejection reason of at least 5 characters.");
          return;
        }

        await rejectPurchaseOrder(order._id, reason.trim());
      } else if (action === "cancel") {
        const reason = window.prompt("Enter the cancellation reason:");

        if (!reason || reason.trim().length < 5) {
          setError("Enter a cancellation reason of at least 5 characters.");
          return;
        }

        await cancelPurchaseOrder(order._id, reason.trim());
      } else if (action === "receive") {
        const outstanding = order.items
          .map((item) => {
            const materialId =
              typeof item.material === "string"
                ? item.material
                : (item.material as unknown as { _id: string })._id;

            return {
              materialId,
              remaining: item.quantity - item.receivedQuantity,
              name:
                materials.find((material) => material._id === materialId)
                  ?.name || materialId,
            };
          })
          .filter((item) => item.remaining > 0);

        const receiptItems: { materialId: string; quantity: number }[] = [];

        for (const item of outstanding) {
          const answer = window.prompt(
            `Receive quantity for ${item.name} (${item.remaining} remaining). Enter 0 to skip:`,
            String(item.remaining)
          );

          if (answer === null) {
            setError("Receipt cancelled. No quantities were submitted.");
            return;
          }

          const quantity = Number(answer);

          if (
            !Number.isFinite(quantity) ||
            quantity < 0 ||
            quantity > item.remaining
          ) {
            setError(`Enter a quantity between 0 and ${item.remaining}.`);
            return;
          }

          if (quantity > 0) {
            receiptItems.push({ materialId: item.materialId, quantity });
          }
        }

        if (receiptItems.length === 0) {
          setError("Enter at least one quantity greater than zero.");
          return;
        }

        const receiptNotes =
          window.prompt("Optional receipt notes:") || undefined;

        await receivePurchaseOrder(order._id, receiptItems, receiptNotes);
      }

      setSuccess("Purchase order updated successfully.");
      await loadData();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? String(
              (err as { response?: { data?: { message?: string } } })
                .response?.data?.message || "The requested action failed."
            )
          : "The requested action failed.";

      setError(message);
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <main className="min-h-screen space-y-8 bg-[var(--concrete)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="relative overflow-hidden rounded-2xl bg-[var(--steel-950)] p-6 text-white shadow-lg sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-white/10" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--architect-green-light)]">
                <Truck size={16} />
                Procurement management
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Purchase Orders
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                Coordinate supplier orders, approval decisions and material
                deliveries across your construction projects.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowForm((value) => !value);
                document
                  .getElementById("purchase-order-form")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? "Close form" : "Create purchase order"}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
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

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total orders"
            value={totals.all}
            description="All purchase orders"
            icon={ClipboardList}
            loading={loading}
          />
          <SummaryCard
            label="Awaiting approval"
            value={totals.pending}
            description="Orders pending a decision"
            icon={Clock3}
            loading={loading}
          />
          <SummaryCard
            label="Awaiting receipt"
            value={totals.approved}
            description="Approved orders not fully received"
            icon={Truck}
            loading={loading}
          />
          <SummaryCard
            label="Fully received"
            value={totals.received}
            description="Orders with completed receipts"
            icon={ShieldCheck}
            loading={loading}
          />
        </section>

        {showForm && (
          <section
            id="purchase-order-form"
            className="scroll-mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
          >
            <div className="flex items-start gap-4 border-b border-[var(--border)] px-5 py-5 sm:px-7">
              <div className="rounded-xl bg-[var(--concrete)] p-3 text-[var(--architect-green)]">
                <Plus size={21} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  New purchase order
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Select a supplier and project, then add the required
                  materials and quantities.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-7 p-5 sm:p-7">
              <div className="grid gap-5 md:grid-cols-2">
                <label className={labelClass}>
                  Supplier *
                  <select
                    required
                    value={supplierId}
                    onChange={(event) => setSupplierId(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClass}>
                  Project *
                  <select
                    required
                    value={projectId}
                    onChange={(event) => setProjectId(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">
                      Order materials
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Add each material once and specify the quantity and unit
                      cost.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setLines((current) => [
                        ...current,
                        { materialId: "", quantity: "1", unitCost: "0" },
                      ])
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--architect-green)] transition hover:bg-[var(--concrete)]"
                  >
                    <Plus size={16} />
                    Add material
                  </button>
                </div>

                {lines.map((line, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]">
                      <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Material
                        <select
                          required
                          value={line.materialId}
                          onChange={(event) =>
                            updateLine(index, "materialId", event.target.value)
                          }
                          className={`${inputClass} font-normal normal-case tracking-normal`}
                        >
                          <option value="">Select material</option>
                          {materials.map((material) => (
                            <option
                              key={material._id}
                              value={material._id}
                              disabled={lines.some(
                                (other, otherIndex) =>
                                  otherIndex !== index &&
                                  other.materialId === material._id
                              )}
                            >
                              {material.name} ({material.unit})
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Quantity
                        <input
                          required
                          type="number"
                          min="0.001"
                          step="any"
                          value={line.quantity}
                          onChange={(event) =>
                            updateLine(index, "quantity", event.target.value)
                          }
                          className={`${inputClass} font-normal normal-case tracking-normal`}
                        />
                      </label>

                      <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Unit cost (KES)
                        <input
                          required
                          type="number"
                          min="0"
                          step="any"
                          value={line.unitCost}
                          onChange={(event) =>
                            updateLine(index, "unitCost", event.target.value)
                          }
                          className={`${inputClass} font-normal normal-case tracking-normal`}
                        />
                      </label>

                      <button
                        type="button"
                        disabled={lines.length === 1}
                        onClick={() =>
                          setLines((current) =>
                            current.filter((_, i) => i !== index)
                          )
                        }
                        aria-label={`Remove material row ${index + 1}`}
                        className="self-end rounded-lg border border-[var(--border)] px-3 py-3 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                      <span className="text-sm text-[var(--muted)]">
                        Line total
                      </span>
                      <span className="font-semibold text-[var(--foreground)]">
                        {formatMoney(
                          Math.max(0, Number(line.quantity) || 0) *
                            Math.max(0, Number(line.unitCost) || 0)
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <label className={labelClass}>
                Notes and delivery instructions
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Delivery instructions or additional details..."
                  className={`${inputClass} resize-y`}
                />
              </label>

              <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm text-[var(--muted)]">
                    Estimated order total
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                    {formatMoney(estimatedTotal)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Calculated from the quantities and unit costs entered.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="rounded-lg border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--concrete)] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--architect-green)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving && (
                      <RefreshCw size={16} className="animate-spin" />
                    )}
                    {saving ? "Creating..." : "Create purchase order"}
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
                Order management
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                Purchase order directory
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {loading
                  ? "Retrieving purchase orders..."
                  : `${filteredOrders.length} ${filteredOrders.length === 1 ? "order" : "orders"} shown`}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search order, supplier or project..."
                  aria-label="Search purchase orders"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--architect-green)]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as PurchaseOrderStatus | "all"
                  )
                }
                aria-label="Filter purchase orders by status"
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All statuses" : statusLabel[status]}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => void loadData()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--concrete)] disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[var(--border)]" />
                  <div className="mt-5 h-4 w-full animate-pulse rounded bg-[var(--border)]" />
                  <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-[var(--border)]" />
                  <div className="mt-6 h-10 animate-pulse rounded-lg bg-[var(--border)]" />
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--concrete)] text-[var(--muted)]">
                <Package size={25} />
              </div>
              <h3 className="mt-4 font-semibold text-[var(--foreground)]">
                No purchase orders found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                Try another search or status filter, or create a new purchase
                order to get started.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {(search || statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                    }}
                    className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--concrete)]"
                  >
                    Clear filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setShowForm(true);
                    document
                      .getElementById("purchase-order-form")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--architect-green)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  <Plus size={16} />
                  Create order
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredOrders.map((order) => {
                const busy = busyOrderId === order._id;
                const canReceive =
                  order.status === "approved" ||
                  order.status === "partially_received";

                return (
                  <article
                    key={order._id}
                    className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="border-b border-[var(--border)] bg-[var(--background)] p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="rounded-xl bg-[var(--concrete)] p-3 text-[var(--architect-green)]">
                            <ClipboardList size={21} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--muted)]">
                              Purchase order
                            </p>
                            <h3 className="mt-1 break-words font-semibold text-[var(--foreground)]">
                              {order.poNumber}
                            </h3>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1.5 text-xs font-semibold ${statusColors[order.status]}`}
                        >
                          {statusLabel[order.status]}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                            Supplier
                          </p>
                          <p className="mt-1 break-words font-medium text-[var(--foreground)]">
                            {getSupplierName(order.supplier)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                            Project
                          </p>
                          <p className="mt-1 break-words text-sm text-[var(--foreground)]">
                            {getProjectName(order.project)}
                          </p>
                        </div>

                        <div className="flex items-end justify-between gap-3 border-t border-[var(--border)] pt-4">
                          <div>
                            <p className="text-xs text-[var(--muted)]">
                              Order total
                            </p>
                            <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">
                              {formatMoney(order.totalAmount)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[var(--muted)]">
                              Materials
                            </p>
                            <p className="mt-1 font-semibold text-[var(--foreground)]">
                              {order.items.length}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                          <FileText size={15} />
                          Created{" "}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                "en-KE"
                              )
                            : "Date unavailable"}
                        </div>
                      </div>

                      <div className="mt-5 border-t border-[var(--border)] pt-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Available actions
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {order.status === "draft" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void runAction(order, "submit")}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--architect-green)] px-3 py-2.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                            >
                              <ArrowDownToLine size={14} />
                              Submit
                            </button>
                          )}

                          {order.status === "pending_approval" && (
                            <>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void runAction(order, "approve")}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--architect-green)] px-3 py-2.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                              >
                                <CheckCircle2 size={14} />
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void runAction(order, "reject")}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </>
                          )}

                          {canReceive && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void runAction(order, "receive")}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 disabled:opacity-50"
                            >
                              <Truck size={14} />
                              Receive
                            </button>
                          )}

                          {!["received", "cancelled"].includes(order.status) && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void runAction(order, "cancel")}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2.5 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--concrete)] disabled:opacity-50"
                            >
                              <X size={14} />
                              Cancel
                            </button>
                          )}

                          {busy && (
                            <span className="inline-flex items-center gap-2 self-center text-xs text-[var(--muted)]">
                              <RefreshCw size={13} className="animate-spin" />
                              Processing...
                            </span>
                          )}

                          {!busy &&
                            order.status !== "draft" &&
                            order.status !== "pending_approval" &&
                            !canReceive &&
                            ["received", "cancelled", "rejected"].includes(
                              order.status
                            ) && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                <CheckCircle2 size={14} />
                                No further actions
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
