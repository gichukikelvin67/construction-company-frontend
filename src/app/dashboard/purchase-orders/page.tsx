
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  draft: "bg-slate-100 text-slate-700",
  pending_approval: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-700",
  partially_received: "bg-orange-100 text-orange-800",
  received: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-200 text-gray-700",
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

    return sum +
      (Number.isFinite(quantity) && Number.isFinite(unitCost)
        ? quantity * unitCost
        : 0);
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

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
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
      setError("Each material can only appear once. Update its existing row.");
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
      }

      if (action === "approve") {
        await approvePurchaseOrder(order._id);
      }

      if (action === "reject") {
        const reason = window.prompt("Enter the rejection reason:");
        if (!reason || reason.trim().length < 5) {
          setError("Enter a rejection reason of at least 5 characters.");
          return;
        }
        await rejectPurchaseOrder(order._id, reason.trim());
      }

      if (action === "cancel") {
        const reason = window.prompt("Enter the cancellation reason:");
        if (!reason || reason.trim().length < 5) {
          setError("Enter a cancellation reason of at least 5 characters.");
          return;
        }
        await cancelPurchaseOrder(order._id, reason.trim());
      }

      if (action === "receive") {
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
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--architect-green)]">
            PROCUREMENT
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Purchase Orders
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Manage supplier orders, approvals and material receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm((value) => !value);
          }}
          className="rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {showForm ? "Close form" : "+ Create purchase order"}
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {success}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Total orders", value: totals.all },
          { label: "Awaiting approval", value: totals.pending },
          { label: "Awaiting receipt", value: totals.approved },
          { label: "Fully received", value: totals.received },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
          >
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {showForm && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              New purchase order
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Choose the supplier, project and materials to order.
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
                Supplier
                <select
                  required
                  value={supplierId}
                  onChange={(event) => setSupplierId(event.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
                Project
                <select
                  required
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
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

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-[var(--foreground)]">
                  Materials
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setLines((current) => [
                      ...current,
                      { materialId: "", quantity: "1", unitCost: "0" },
                    ])
                  }
                  className="text-sm font-semibold text-[var(--architect-green)]"
                >
                  + Add material
                </button>
              </div>

              {lines.map((line, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl border border-[var(--border)] p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]"
                >
                  <label className="space-y-1 text-xs font-medium text-[var(--muted)]">
                    Material
                    <select
                      required
                      value={line.materialId}
                      onChange={(event) =>
                        updateLine(index, "materialId", event.target.value)
                      }
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
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

                  <label className="space-y-1 text-xs font-medium text-[var(--muted)]">
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
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-medium text-[var(--muted)]">
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
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
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
                    className="self-end rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm text-red-600 disabled:opacity-30"
                    aria-label={`Remove material row ${index + 1}`}
                  >
                    Remove
                  </button>

                  <p className="text-sm text-[var(--muted)] sm:col-span-2 lg:col-span-4">
                    Line total:{" "}
                    {formatMoney(
                      Math.max(0, Number(line.quantity) || 0) *
                        Math.max(0, Number(line.unitCost) || 0)
                    )}
                  </p>
                </div>
              ))}
            </div>

            <label className="block space-y-2 text-sm font-medium text-[var(--foreground)]">
              Notes (optional)
              <textarea
                rows={3}
                maxLength={1000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Delivery instructions or additional details..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
              />
            </label>

            <div className="flex flex-col justify-between gap-4 rounded-xl bg-[var(--background)] p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-[var(--muted)]">Estimated total</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {formatMoney(estimatedTotal)}
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[var(--architect-green)] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create purchase order"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">
              Order directory
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {filteredOrders.length} order(s) found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, supplier or project..."
              className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm sm:w-64"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as PurchaseOrderStatus | "all"
                )
              }
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
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
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)]"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--muted)]">
            Loading purchase orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-[var(--foreground)]">
              No purchase orders found
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Create an order or change your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[var(--background)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Supplier / Project</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredOrders.map((order) => {
                  const busy = busyOrderId === order._id;
                  const canReceive =
                    order.status === "approved" ||
                    order.status === "partially_received";

                  return (
                    <tr key={order._id} className="align-top">
                      <td className="px-5 py-4 font-semibold text-[var(--foreground)]">
                        {order.poNumber}
                        <p className="mt-1 text-xs font-normal text-[var(--muted)]">
                          {order.items.length} material(s)
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-[var(--foreground)]">
                          {getSupplierName(order.supplier)}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {getProjectName(order.project)}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-medium text-[var(--foreground)]">
                        {formatMoney(order.totalAmount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status]}`}
                        >
                          {statusLabel[order.status]}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-[var(--muted)]">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-KE"
                            )
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {order.status === "draft" && (
                            <button
                              disabled={busy}
                              onClick={() => void runAction(order, "submit")}
                              className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold disabled:opacity-50"
                            >
                              Submit
                            </button>
                          )}

                          {order.status === "pending_approval" && (
                            <>
                              <button
                                disabled={busy}
                                onClick={() => void runAction(order, "approve")}
                                className="rounded-lg bg-[var(--architect-green)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => void runAction(order, "reject")}
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {canReceive && (
                            <button
                              disabled={busy}
                              onClick={() => void runAction(order, "receive")}
                              className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              Receive
                            </button>
                          )}

                          {!["received", "cancelled"].includes(order.status) && (
                            <button
                              disabled={busy}
                              onClick={() => void runAction(order, "cancel")}
                              className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted)] disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}

                          {busy && (
                            <span className="self-center text-xs text-[var(--muted)]">
                              Working...
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
