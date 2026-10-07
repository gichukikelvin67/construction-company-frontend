"use client";

import { useEffect, useState } from "react";

import {
  createStockMovement,
  getLowStockMaterials,
  getMaterialStock,
  getMaterials,
  type Material,
} from "@/services/stockService";

import {
  getSuppliers,
  type Supplier,
} from "@/services/supplierService";

import {
  getProjects,
  type Project,
} from "@/services/projectService";

export default function InventoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [lowStockMaterialIds, setLowStockMaterialIds] =
    useState<Set<string>>(new Set());

  const [stockLevels, setStockLevels] = useState<Record<string, number>>(
    {}
  );

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [selectedMaterialId, setSelectedMaterialId] = useState("");

  const [movementType, setMovementType] = useState<
    "receipt" | "issue" | "return" | "adjustment"
  >("receipt");

  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [movementDate, setMovementDate] = useState(
    new Date().toISOString()
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [
          materialData,
          lowStockData,
          supplierData,
          projectData,
        ] = await Promise.all([
          getMaterials(),
          getLowStockMaterials(),
          getSuppliers(),
          getProjects(),
        ]);

        setMaterials(materialData);
        setSuppliers(supplierData);
        setProjects(projectData);

        const lowStockIds = new Set(
          lowStockData.materials.map((item) => item.material.id)
        );

        setLowStockMaterialIds(lowStockIds);

        const stockResults = await Promise.all(
          materialData.map(async (material) => {
            const stock = await getMaterialStock(material._id);

            return {
              materialId: material._id,
              currentStock: stock.currentStock,
            };
          })
        );

        const stockMap = Object.fromEntries(
          stockResults.map((item) => [
            item.materialId,
            item.currentStock,
          ])
        );

        setStockLevels(stockMap);
      } catch (error) {
        console.error("Failed to load inventory:", error);
        setError("Unable to load inventory information.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInventory();
  }, []);

  const handleCreateMovement = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !selectedMaterialId ||
      !quantity ||
      Number(quantity) <= 0
    ) {
      setError("Select a material and enter a valid quantity.");
      return;
    }

    if (
      movementType === "receipt" &&
      !selectedSupplierId
    ) {
      setError("Select a supplier for a receipt.");
      return;
    }

    if (
      movementType === "issue" &&
      !selectedProjectId
    ) {
      setError("Select a project for an issue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await createStockMovement({
        materialId: selectedMaterialId,

        supplierId:
          movementType === "receipt"
            ? selectedSupplierId
            : undefined,

        projectId:
          movementType === "issue"
            ? selectedProjectId
            : undefined,

        type: movementType,

        quantity: Number(quantity),

        unitCost: unitCost
          ? Number(unitCost)
          : undefined,

        referenceNumber:
          referenceNumber || undefined,

        notes: notes || undefined,

        movementDate,
      });

      const updatedStock = await getMaterialStock(
        selectedMaterialId
      );

      setStockLevels((current) => ({
        ...current,
        [selectedMaterialId]:
          updatedStock.currentStock,
      }));

      const updatedLowStock =
        await getLowStockMaterials();

      setLowStockMaterialIds(
        new Set(
          updatedLowStock.materials.map(
            (item) => item.material.id
          )
        )
      );

      setQuantity("");
      setUnitCost("");
      setReferenceNumber("");
      setNotes("");
      setSelectedSupplierId("");
      setSelectedProjectId("");

      alert("Stock movement recorded successfully.");
    } catch (error) {
      console.error(
        "Failed to create stock movement:",
        error
      );

      setError("Unable to record stock movement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="border-b border-[var(--border)] pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
          Inventory
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
          Materials & Stock
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Monitor construction materials and identify stock that
          needs attention.
        </p>
      </div>

      {error && (
        <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* RECORD STOCK MOVEMENT */}

      <section className="mt-8 border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Record Stock Movement
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Record materials received, issued, returned, or adjusted.
          </p>
        </div>

        <form
          onSubmit={handleCreateMovement}
          className="mt-6 grid gap-5 md:grid-cols-2"
        >
          {/* MATERIAL */}

          <div>
            <label className="text-sm font-medium text-[var(--foreground)]">
              Material
            </label>

            <select
              value={selectedMaterialId}
              onChange={(event) =>
                setSelectedMaterialId(event.target.value)
              }
              className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none"
              required
            >
              <option value="">Select material</option>

              {materials.map((material) => (
                <option
                  key={material._id}
                  value={material._id}
                >
                  {material.name}
                  {material.code
                    ? ` (${material.code})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* MOVEMENT TYPE */}

          <div>
            <label className="text-sm font-medium text-[var(--foreground)]">
              Movement Type
            </label>

            <select
              value={movementType}
              onChange={(event) =>
                setMovementType(
                  event.target.value as
                    | "receipt"
                    | "issue"
                    | "return"
                    | "adjustment"
                )
              }
              className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none"
            >
              <option value="receipt">Receipt</option>
              <option value="issue">Issue</option>
              <option value="return">Return</option>
              <option value="adjustment">
                Adjustment
              </option>
            </select>
          </div>

          {/* SUPPLIER */}

          {movementType === "receipt" && (
            <div>
              <label className="text-sm font-medium text-[var(--foreground)]">
                Supplier
              </label>

              <select
                value={selectedSupplierId}
                onChange={(event) =>
                  setSelectedSupplierId(event.target.value)
                }
                className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none"
                required
              >
                <option value="">
                  Select supplier
                </option>

                {suppliers.map((supplier) => (
                  <option
                    key={supplier._id}
                    value={supplier._id}
                  >
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* PROJECT FOR ISSUE */}

          {movementType === "issue" && (
            <div>
              <label className="text-sm font-medium text-[var(--foreground)]">
                Project
              </label>

              <select
                value={selectedProjectId}
                onChange={(event) =>
                  setSelectedProjectId(event.target.value)
                }
                className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none"
                required
              >
                <option value="">
                  Select project
                </option>

                {projects.map((project) => (
                  <option
                    key={project._id}
                    value={project._id}
                  >
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* QUANTITY */}

          <div>
            <label className="text-sm font-medium text-[var(--foreground)]">
              Quantity
            </label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              placeholder="Enter quantity"
              className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none"
              required
            />
          </div>

          {/* UNIT COST */}

          <div>
            <label className="text-sm font-medium text-[var(--foreground)]">
              Unit Cost
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={(event) =>
                setUnitCost(event.target.value)
              }
              placeholder="Optional"
              className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none"
            />
          </div>

          {/* REFERENCE */}

          <div>
            <label className="text-sm font-medium text-[var(--foreground)]">
              Reference Number
            </label>

            <input
              type="text"
              value={referenceNumber}
              onChange={(event) =>
                setReferenceNumber(event.target.value)
              }
              placeholder="e.g. GRN-001"
              className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none"
            />
          </div>

          {/* DATE */}

          <div>
            <label className="text-sm font-medium text-[var(--foreground)]">
              Movement Date
            </label>

            <input
              type="date"
              value={movementDate.split("T")[0]}
              onChange={(event) =>
                setMovementDate(
                  new Date(
                    `${event.target.value}T00:00:00.000Z`
                  ).toISOString()
                )
              }
              className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none"
              required
            />
          </div>

          {/* NOTES */}

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Optional notes about this movement"
              rows={3}
              className="mt-2 w-full resize-none border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none"
            />
          </div>

          {/* SUBMIT */}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="border border-[var(--architect-green)] bg-[var(--architect-green)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Recording..."
                : "Record Movement"}
            </button>
          </div>
        </form>
      </section>

      {/* MATERIALS INVENTORY */}

      <section className="mt-8 border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Materials Inventory
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              All active construction materials and their minimum
              stock requirements.
            </p>
          </div>

          <span className="border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            {lowStockMaterialIds.size} ALERTS
          </span>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="border border-dashed border-[var(--border)] p-8 text-center">
              <p className="text-sm text-[var(--muted)]">
                Loading inventory...
              </p>
            </div>
          ) : materials.length === 0 ? (
            <div className="border border-dashed border-[var(--border)] p-8 text-center">
              <p className="text-sm font-medium text-[var(--foreground)]">
                No materials found
              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Create materials to begin tracking your inventory.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => {
                const isLowStock =
                  lowStockMaterialIds.has(material._id);

                return (
                  <div
                    key={material._id}
                    className="border border-[var(--border)] p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)]">
                          {material.name}
                        </h3>

                        {material.code && (
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            Code: {material.code}
                          </p>
                        )}
                      </div>

                      <span
                        className={
                          isLowStock
                            ? "w-fit border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase text-red-700"
                            : "w-fit border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold uppercase text-green-700"
                        }
                      >
                        {isLowStock
                          ? "Low Stock"
                          : "In Stock"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                          Current Stock
                        </p>

                        <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                          {stockLevels[material._id] ?? 0}{" "}
                          {material.unit}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                          Minimum Stock
                        </p>

                        <p className="mt-1 font-semibold text-[var(--foreground)]">
                          {material.minimumStock}{" "}
                          {material.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}