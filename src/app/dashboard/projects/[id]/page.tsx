"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getProjectById,
  type Project,
} from "@/services/projectService";
import {
  getProjectExpenses,
  updateExpense,
  voidExpense,
  type Expense,
} from "@/services/expenseService";
import RecordExpenseForm from "@/components/expenses/RecordExpenseForm";
import EditExpenseForm from "@/components/expenses/EditExpenseForm";
import VoidExpenseForm from "@/components/expenses/VoidExpenseForm";
import ProjectWorkers from "@/components/projects/ProjectWorkers";
export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
   const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
   const [showExpenseForm, setShowExpenseForm] = useState(false);
   const [selectedExpense, setSelectedExpense] =
  useState<Expense | null>(null);

const [showVoidForm, setShowVoidForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const loadProject = async () => {
    try {
      setIsLoading(true);
      setIsLoadingExpenses(true);
      setError("");

      const [projectData, expenseData] = await Promise.all([
        getProjectById(projectId),
        getProjectExpenses(projectId),
      ]);

      setProject(projectData);

      setExpenses(expenseData.expenses);
      setTotalExpenses(expenseData.totalAmount);
    } catch (error) {
      console.error("Failed to load project:", error);

      setError("Unable to load this project.");
    } finally {
      setIsLoading(false);
      setIsLoadingExpenses(false);
    }
  };

  if (projectId) {
    loadProject();
  }
}, [projectId]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-sm text-[var(--muted)]">
            Loading project...
          </p>
        </div>
      </section>
    );
  }

  if (error || !project) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">
            Project unavailable
          </h1>

          <p className="mt-2 text-sm text-red-700">
            {error || "This project could not be found."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            className="mt-5 border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
          >
            Back to Projects
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      {/* Back navigation */}
      <Link
        href="/dashboard/projects"
        className="text-sm font-medium text-[var(--architect-green)] hover:underline"
      >
        ← Back to Projects
      </Link>

      {/* Project header */}
      <div className="mt-6 border-b border-[var(--border)] pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
              Project Overview
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
              {project.name}
            </h1>

            {project.location && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                {project.location}
              </p>
            )}
          </div>

          <span className="w-fit border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-800">
            {project.status}
          </span>
        </div>
      </div>

      {/* Project information */}
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <ProjectInfo
          label="Project Budget"
          value={`KES ${(project.budget ?? 0).toLocaleString()}`}
        />

        <ProjectInfo
          label="Start Date"
          value={
            project.startDate
              ? new Date(project.startDate).toLocaleDateString()
              : "Not set"
          }
        />

        <ProjectInfo
          label="Location"
          value={project.location || "Not provided"}
        />

        <ProjectInfo
          label="Status"
          value={project.status}
        />
      </div>

      {/* Description */}
      <section className="mt-8 border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Project Description
          </h2>
        </div>

        <div className="px-6 py-6">
          <p className="max-w-4xl text-sm leading-7 text-[var(--muted)]">
            {project.description || "No project description has been provided."}
          </p>
        </div>
      </section>

      {/* Project modules */}
      <section className="mt-8">
  <div className="mb-5">
    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
      Project Operations
    </p>

    <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
      Manage this project
    </h2>
  </div>

  {/* Expense summary */}
  <div className="grid gap-5 md:grid-cols-3">
    <ProjectInfo
      label="Total Expenses"
      value={`KES ${totalExpenses.toLocaleString()}`}
    />

    <ProjectInfo
      label="Expense Records"
      value={expenses.length.toString()}
    />

    <ProjectInfo
      label="Remaining Budget"
      value={`KES ${Math.max(
        (project.budget ?? 0) - totalExpenses,
        0
      ).toLocaleString()}`}
    />
  </div>

  {showExpenseForm && (
  <div className="mt-6">
    <RecordExpenseForm
      projectId={projectId}
      onCancel={() => setShowExpenseForm(false)}
      onSuccess={async () => {
        setShowExpenseForm(false);

        try {
          setIsLoadingExpenses(true);

          const expenseData = await getProjectExpenses(projectId);

          setExpenses(expenseData.expenses);
          setTotalExpenses(expenseData.totalAmount);
        } catch (error) {
          console.error("Failed to refresh expenses:", error);
        } finally {
          setIsLoadingExpenses(false);
        }
      }}
    />
  </div>
)}
{selectedExpense && !showVoidForm && (
  <div className="mt-6">
    <EditExpenseForm
      expense={selectedExpense}
      onCancel={() => setSelectedExpense(null)}
      onSuccess={async () => {
        setSelectedExpense(null);

        try {
          setIsLoadingExpenses(true);

          const expenseData =
            await getProjectExpenses(projectId);

          setExpenses(expenseData.expenses);
          setTotalExpenses(expenseData.totalAmount);
        } catch (error) {
          console.error(
            "Failed to refresh expenses:",
            error
          );
        } finally {
          setIsLoadingExpenses(false);
        }
      }}
    />
  </div>
)}
{selectedExpense && showVoidForm && (
  <div className="mt-6">
    <VoidExpenseForm
      expense={selectedExpense}
      onCancel={() => {
        setSelectedExpense(null);
        setShowVoidForm(false);
      }}
      onSuccess={async () => {
        setSelectedExpense(null);
        setShowVoidForm(false);

        try {
          setIsLoadingExpenses(true);

          const expenseData =
            await getProjectExpenses(projectId);

          setExpenses(expenseData.expenses);
          setTotalExpenses(expenseData.totalAmount);
        } catch (error) {
          console.error(
            "Failed to refresh expenses:",
            error
          );
        } finally {
          setIsLoadingExpenses(false);
        }
      }}
    />
  </div>
)}

  {/* Expenses */}
  <section className="mt-6 border border-[var(--border)] bg-[var(--surface)]">
    <div className="flex flex-col gap-4 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Project Expenses
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Expenses recorded against this construction project.
        </p>
      </div>
      <button
  type="button"
  onClick={() => setShowExpenseForm(true)}
  className="w-fit border border-[var(--architect-green)] bg-[var(--architect-green)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--architect-green-dark)]"
>
  Record Expense
</button>
    </div>

    <div className="p-6">
      {isLoadingExpenses ? (
        <div className="border border-dashed border-[var(--border)] p-8 text-center">
          <p className="text-sm text-[var(--muted)]">
            Loading expenses...
          </p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] p-8 text-center">
          <p className="text-sm font-medium text-[var(--foreground)]">
            No expenses recorded
          </p>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Expenses recorded for this project will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Category
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Description
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Date
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Amount
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Actions
               </th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense) => (
                <tr
                  key={expense._id}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <td className="px-4 py-4 text-sm font-medium text-[var(--foreground)]">
                    {expense.category}
                  </td>

                  <td className="px-4 py-4 text-sm text-[var(--muted)]">
                    {expense.description || "—"}
                  </td>

                  <td className="px-4 py-4 text-sm text-[var(--muted)]">
                    {expense.expenseDate
                      ? new Date(
                          expense.expenseDate
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-4 py-4 text-right text-sm font-semibold text-[var(--foreground)]">
                    KES {expense.amount.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-center">
                    {expense.isVoided ? (
                      <span className="border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold uppercase text-red-700">
                        Voided
                      </span>
                    ) : (
                      <span className="border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold uppercase text-blue-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
  {!expense.isVoided ? (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => setSelectedExpense(expense)}
        className="border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--concrete)]"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() => {
          setSelectedExpense(expense);
          setShowVoidForm(true);
        }}
        className="border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
      >
        Void
      </button>
    </div>
  ) : (
    <span className="text-xs text-[var(--muted)]">
      No actions
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
  
<ProjectWorkers projectId={projectId} />

  {/* Other project modules */}
  <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <ModuleCard
      title="Workers"
      description="View workers assigned to this construction project."
      accent="green"
    />

    <ModuleCard
      title="Materials"
      description="Track materials received, issued and returned."
      accent="steel"
    />

    <ModuleCard
      title="Purchase Orders"
      description="Manage purchase orders associated with this project."
      accent="amber"
    />

    <ModuleCard
      title="Tasks"
      description="Track work that needs to be completed on site."
      accent="green"
    />

    <ModuleCard
      title="Daily Reports"
      description="Record daily site progress and construction activity."
      accent="steel"
    />
  </div>
</section>
</section>
  );
}
    
interface ProjectInfoProps {
  label: string;
  value: string;
}

function ProjectInfo({
  label,
  value,
}: ProjectInfoProps) {
  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-3 text-lg font-bold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

interface ModuleCardProps {
  title: string;
  description: string;
  accent: "green" | "steel" | "blue" | "amber";
}

function ModuleCard({
  title,
  description,
  accent,
}: ModuleCardProps) {
  const accentClasses = {
    green: "border-l-[var(--architect-green)]",
    steel: "border-l-[var(--steel-600)]",
    blue: "border-l-blue-500",
    amber: "border-l-amber-500",
  };

  return (
    <div
      className={`border border-[var(--border)] border-l-4 bg-[var(--surface)] p-5 ${accentClasses[accent]}`}
    >
      <h3 className="font-semibold text-[var(--foreground)]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--steel-500)]">
        Coming next
      </p>
    </div>
  );
}