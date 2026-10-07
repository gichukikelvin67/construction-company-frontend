
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

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

            <NotificationButton />
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

function NotificationButton() {
  const [open, setOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationClick = async (
    notificationId: string
  ) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--architect-green)]"
        aria-label="Open notifications"
      >
        Notifications

        {unreadCount > 0 && (
          <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--architect-green)] px-1.5 py-0.5 text-xs font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Notifications
              </h3>

              <p className="text-xs text-[var(--muted)]">
                {unreadCount} unread
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-medium text-[var(--architect-green)] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                Loading notifications...
              </div>
            )}

            {!loading && error && (
              <div className="px-4 py-8 text-center text-sm text-red-500">
                {error}
              </div>
            )}

            {!loading &&
              !error &&
              notifications.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    No notifications
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    You're all caught up.
                  </p>
                </div>
              )}

            {!loading &&
              !error &&
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() =>
                    handleNotificationClick(
                      notification._id
                    )
                  }
                  className={`w-full border-b border-[var(--border)] px-4 py-3 text-left transition hover:bg-[var(--concrete)] ${
                    !notification.isRead
                      ? "bg-[var(--concrete)]"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notification.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--architect-green)]" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-[11px] text-[var(--steel-500)]">
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
