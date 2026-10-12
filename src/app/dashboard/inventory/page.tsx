"use client";

import { useEffect, useState } from "react";

import {
  createStockMovement,
  getLowStockMaterials,
  getMaterialMovements,
  getMaterialStock,
  getMaterials,
  CreateMaterialData,
  createMaterial,
  type Material,
  type StockMovement,
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
  const [success, setSuccess] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [lowStockMaterialIds, setLowStockMaterialIds] =
    useState<Set<string>>(new Set());

  const [stockLevels, setStockLevels] = useState<Record<string, number>>(
    {}
  );

  const [movementHistory, setMovementHistory] = useState<StockMovement[]>(
  []
);

const [movementHistoryFilter, setMovementHistoryFilter] = useState<
  "all" | "receipt" | "issue" | "return" | "adjustment"
>("all");
const [materialName, setMaterialName] = useState("");
const [materialCode, setMaterialCode] = useState("");
const [materialDescription, setMaterialDescription] = useState("");
const [materialUnit, setMaterialUnit] =
  useState<CreateMaterialData["unit"]>("piece");
const [materialMinimumStock, setMaterialMinimumStock] = useState("");
const [isCreatingMaterial, setIsCreatingMaterial] = useState(false);
const filteredMovementHistory = movementHistory.filter(
  (movement) =>
    movementHistoryFilter === "all" ||
    movement.type === movementHistoryFilter
);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
const [stockFilter, setStockFilter] = useState<
  "all" | "in-stock" | "low-stock"
>("all");
  const [movementType, setMovementType] = useState<
    "receipt" | "issue" | "return" | "adjustment"
  >("receipt");

  const [adjustmentDirection, setAdjustmentDirection] = useState<
    "increase" | "decrease"
  >("increase");

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

  useEffect(() => {
    const loadMovementHistory = async () => {
      if (!selectedMaterialId) {
        setMovementHistory([]);
        return;
      }

      try {
        const history = await getMaterialMovements(
          selectedMaterialId
        );

        setMovementHistory(history.movements);
      } catch (error) {
        console.error(
          "Failed to load movement history:",
          error
        );

        setMovementHistory([]);
      }
    };

    loadMovementHistory();
  }, [selectedMaterialId]);

  const handleCreateMovement = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");

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
      (movementType === "issue" ||
        movementType === "return") &&
      !selectedProjectId
    ) {
      setError(
        `Select a project for a ${movementType}.`
      );
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
          movementType === "issue" ||
          movementType === "return"
            ? selectedProjectId
            : undefined,

        type: movementType,

        adjustmentDirection:
          movementType === "adjustment"
            ? adjustmentDirection
            : undefined,

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

      // Refresh movement history after creating a movement
      const updatedHistory =
        await getMaterialMovements(
          selectedMaterialId
        );

      setMovementHistory(updatedHistory.movements);

      setQuantity("");
      setUnitCost("");
      setReferenceNumber("");
      setNotes("");
      setSelectedSupplierId("");
      setSelectedProjectId("");
      setAdjustmentDirection("increase");

      setSuccess("Stock movement recorded successfully.");
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

      {/* PAGE HEADER */}

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

      {/* ERROR */}

      {error && (
        <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
  <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
      ✓
    </span>

    <span>{success}</span>

    <button
      type="button"
      onClick={() => setSuccess("")}
      className="ml-auto text-emerald-400/70 transition hover:text-emerald-300"
      aria-label="Dismiss success message"
    >
      ×
    </button>
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

          {/* PROJECT */}

          {(movementType === "issue" ||
            movementType === "return") && (
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

          {/* ADJUSTMENT DIRECTION */}

          {movementType === "adjustment" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                Adjustment Direction
              </label>

              <select
                value={adjustmentDirection}
                onChange={(event) =>
                  setAdjustmentDirection(
                    event.target.value as
                      | "increase"
                      | "decrease"
                  )
                }
                className="w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
              >
                <option value="increase">
                  Increase Stock
                </option>

                <option value="decrease">
                  Decrease Stock
                </option>
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
      {/* ADD MATERIAL */}

<section className="mt-8 border border-[var(--border)] bg-[var(--surface)] p-6">
  <div className="border-b border-[var(--border)] pb-4">
    <h2 className="text-lg font-semibold text-[var(--foreground)]">
      Add Material
    </h2>

    <p className="mt-1 text-sm text-[var(--muted)]">
      Add any construction material you need to track in your inventory.
    </p>
  </div>

  <form
    onSubmit={async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      const minimumStock = Number(materialMinimumStock);

      if (!materialName.trim()) {
        setError("Material name is required.");
        return;
      }

      if (materialMinimumStock === "" || Number.isNaN(minimumStock)) {
        setError("Minimum stock is required.");
        return;
      }

      if (minimumStock < 0) {
        setError("Minimum stock cannot be negative.");
        return;
      }

      try {
        setIsCreatingMaterial(true);

        const material = await createMaterial({
          name: materialName.trim(),
          code: materialCode.trim() || undefined,
          description: materialDescription.trim() || undefined,
          unit: materialUnit,
          minimumStock,
        });

        setMaterials((current) => [material, ...current]);

        setMaterialName("");
        setMaterialCode("");
        setMaterialDescription("");
        setMaterialUnit("piece");
        setMaterialMinimumStock("");

        setSuccess(`Material "${material.name}" created successfully.`);
      } catch (error: any) {
        console.error("Create material error:", error);

        setError(
          error?.response?.data?.message ||
            "Unable to create material. Please try again."
        );
      } finally {
        setIsCreatingMaterial(false);
      }
    }}
    className="mt-6 space-y-5"
  >
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Material Name
        </label>

        <input
          type="text"
          value={materialName}
          onChange={(event) => setMaterialName(event.target.value)}
          placeholder="e.g. Cement, Steel Bar, Paint, Timber"
          maxLength={150}
          required
          className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Material Code
          <span className="ml-1 text-[var(--muted)]">(Optional)</span>
        </label>

        <input
          type="text"
          value={materialCode}
          onChange={(event) => setMaterialCode(event.target.value)}
          placeholder="e.g. CEM-001"
          maxLength={50}
          className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
        />
      </div>
    </div>

    <div>
      <label className="text-sm font-medium text-[var(--foreground)]">
        Description
        <span className="ml-1 text-[var(--muted)]">(Optional)</span>
      </label>

      <textarea
        value={materialDescription}
        onChange={(event) => setMaterialDescription(event.target.value)}
        placeholder="Add a short description of this material..."
        maxLength={300}
        rows={3}
        className="mt-2 w-full resize-none border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
      />
    </div>

    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Unit
        </label>

        <select
          value={materialUnit}
          onChange={(event) =>
            setMaterialUnit(
              event.target.value as CreateMaterialData["unit"]
            )
          }
          className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
        >
          <option value="kg">Kilogram (kg)</option>
          <option value="gram">Gram (g)</option>
          <option value="ton">Tonne (ton)</option>
          <option value="bag">Bag</option>
          <option value="piece">Piece</option>
          <option value="bar">Bar</option>
          <option value="roll">Roll</option>
          <option value="sheet">Sheet</option>
          <option value="bundle">Bundle</option>
          <option value="pair">Pair</option>
          <option value="set">Set</option>
          <option value="packet">Packet</option>
          <option value="box">Box</option>
          <option value="carton">Carton</option>
          <option value="drum">Drum</option>
          <option value="litre">Litre</option>
          <option value="millilitre">Millilitre</option>
          <option value="metre">Metre</option>
          <option value="millimetre">Millimetre</option>
          <option value="square_metre">Square metre (m²)</option>
          <option value="cubic_metre">Cubic metre (m³)</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Minimum Stock
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={materialMinimumStock}
          onChange={(event) =>
            setMaterialMinimumStock(event.target.value)
          }
          placeholder="e.g. 10"
          required
          className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
        />
      </div>
    </div>

    {error && (
      <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )}

    {success && (
      <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        {success}
      </div>
    )}

    <div className="flex justify-end">
      <button
        type="submit"
        disabled={isCreatingMaterial}
        className="border border-[var(--foreground)] bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreatingMaterial ? "Creating..." : "Add Material"}
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
          <div className="mt-6 grid gap-4 md:grid-cols-2">
  <div>
    <label className="text-sm font-medium text-[var(--foreground)]">
      Search Materials
    </label>

    <input
      type="text"
      value={materialSearch}
      onChange={(event) =>
        setMaterialSearch(event.target.value)
      }
      placeholder="Search by material name or code..."
      className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none"
    />
  </div>

  <div>
    <label className="text-sm font-medium text-[var(--foreground)]">
      Stock Status
    </label>

    <select
      value={stockFilter}
      onChange={(event) =>
        setStockFilter(
          event.target.value as
            | "all"
            | "in-stock"
            | "low-stock"
        )
      }
      className="mt-2 w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none"
    >
      <option value="all">All Materials</option>
      <option value="in-stock">In Stock</option>
      <option value="low-stock">Low Stock</option>
    </select>
  </div>
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
  (() => {
    const filteredMaterials = materials
      .filter((material) => {
        const search = materialSearch.trim().toLowerCase();

        if (!search) {
          return true;
        }

        return (
          material.name.toLowerCase().includes(search) ||
          material.code?.toLowerCase().includes(search)
        );
      })
      .filter((material) => {
        const isLowStock = lowStockMaterialIds.has(material._id);

        if (stockFilter === "low-stock") {
          return isLowStock;
        }

        if (stockFilter === "in-stock") {
          return !isLowStock;
        }

        return true;
      });

    if (filteredMaterials.length === 0) {
      return (
        <div className="border border-dashed border-[var(--border)] p-8 text-center">
          <p className="text-sm font-medium text-[var(--foreground)]">
            No matching materials
          </p>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Try adjusting your search or stock status filter.
          </p>

          <button
            type="button"
            onClick={() => {
              setMaterialSearch("");
              setStockFilter("all");
            }}
            className="mt-4 border border-[var(--architect-green)] px-4 py-2 text-sm font-semibold text-[var(--architect-green)] transition-colors hover:bg-[var(--architect-green)] hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredMaterials.map((material) => {
          const isLowStock = lowStockMaterialIds.has(material._id);

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
                  {isLowStock ? "Low Stock" : "In Stock"}
                </span>
              </div>

              <div className="mt-4 grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    Current Stock
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                    {stockLevels[material._id] ?? 0} {material.unit}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    Minimum Stock
                  </p>

                  <p className="mt-1 font-semibold text-[var(--foreground)]">
                    {material.minimumStock} {material.unit}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  })()
)}

        </div>

      </section>

      {/* MOVEMENT HISTORY */}

      <section className="mt-8 border border-[var(--border)] bg-[var(--surface)] p-6">

        <div className="border-b border-[var(--border)] pb-4">

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Stock Movement History
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            View the movement history for the selected material.
          </p>
          <div className="mt-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
  Movement type
</label>
  <select
    value={movementHistoryFilter}
    onChange={(e) =>
      setMovementHistoryFilter(
        e.target.value as
          | "all"
          | "receipt"
          | "issue"
          | "return"
          | "adjustment"
      )
    }
    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
  >
    <option value="all">All movements</option>
    <option value="receipt">Receipts</option>
    <option value="issue">Issues</option>
    <option value="return">Returns</option>
    <option value="adjustment">Adjustments</option>
  </select>
</div>

        </div>

        {!selectedMaterialId ? (

          <div className="py-8 text-center text-sm text-[var(--muted)]">
            Select a material above to view its movement history.
          </div>

        ) : movementHistory.filter(
    (movement) =>
      movementHistoryFilter === "all" ||
      movement.type === movementHistoryFilter
  ).length === 0 ? (

          <div className="py-8 text-center text-sm text-[var(--muted)]">
            No {movementHistoryFilter === "all" ? "" : movementHistoryFilter} movements found for this material.
          </div>

        ) : (
   
          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[800px] text-left text-sm">

              <thead>
                <tr className="border-b border-[var(--border)]">

                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    Date
                  </th>

                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    Type
                  </th>

                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    Quantity
                  </th>

                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    Stock Change
                  </th>

                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    Reference
                  </th>

                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    Notes
                  </th>

                </tr>
              </thead>

              <tbody>

                {movementHistory
                .filter(
                        (movement)=>
                          movementHistoryFilter ==="all"||
                        movement.type===movementHistoryFilter
                      )
                      .map((movement)=>(

                  <tr
                    key={movement._id}
                    className="border-b border-[var(--border)] last:border-b-0"
                  >

                    <td className="px-4 py-3 text-[var(--muted)]">
                      {new Date(
                        movement.movementDate
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3">

                      <span className="font-medium capitalize text-[var(--foreground)]">

                        {movement.type}

                        {movement.type === "adjustment" &&
                          movement.adjustmentDirection && (
                            <span className="ml-1 text-xs text-[var(--muted)]">
                              ({movement.adjustmentDirection})
                            </span>
                          )}

                      </span>

                    </td>

                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                      {movement.quantity}
                    </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                     {movement.stockBefore} → {movement.stockAfter}
                     </td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {movement.referenceNumber || "—"}
                    </td>

                    <td className="px-4 py-3 text-[var(--muted)]">
                      {movement.notes || "—"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </section>
  );
}