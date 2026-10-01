import type { ReactNode } from "react";
import Link from "next/link";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--concrete)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--border)] bg-[var(--steel-950)] lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-[var(--steel-800)] px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--architect-green-light)]">
              Aesthetics
            </p>

            <p className="mt-2 text-xs text-[var(--steel-500)]">
              Construction Management
            </p>
          </div>

          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              <SidebarItem
                label="Dashboard"
                href="/dashboard"
                active
              />

              <SidebarItem
                label="Projects"
                href="/dashboard/projects"
              />

              <SidebarItem
                label="Workers"
                href="/dashboard/workers"
              />

              <SidebarItem
                label="Inventory"
                href="/dashboard/inventory"
              />

              <SidebarItem
                label="Suppliers"
                href="/dashboard/suppliers"
              />

              <SidebarItem
                label="Purchase Orders"
                href="/dashboard/purchase-orders"
              />

              <SidebarItem
                label="Expenses"
                href="/dashboard/expenses"
              />

              <SidebarItem
                label="Invoices"
                href="/dashboard/invoices"
              />
            </div>
          </nav>

          <div className="border-t border-[var(--steel-800)] p-4">
            <SidebarItem
              label="Settings"
              href="/dashboard/settings"
            />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex h-16 items-center justify-between px-6 lg:px-8">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Construction Operations
              </p>

              <p className="text-xs text-[var(--muted)]">
                Aesthetics Management Platform
              </p>
            </div>

            <button
              type="button"
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--architect-green)]"
            >
              Notifications
            </button>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
interface SidebarItemProps {
  label: string;
  href: string;
  active?: boolean;
}

function SidebarItem({
  label,
  href,
  active = false,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-[var(--architect-green)] text-white"
          : "text-[var(--steel-300)] hover:bg-[var(--steel-800)] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}