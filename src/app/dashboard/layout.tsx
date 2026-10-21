
"use client";

import type { ReactNode, ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Activity,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  HardHat,
  Home,
  LayoutDashboard,
  Menu,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  X,
  CheckCheck,
  Building2,
  ChevronRight,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: ComponentType<{
     size?: number;
      strokeWidth?: number ;
      className?:string;
    }>;
}

const navigationGroups: {
  title: string;
  items: NavigationItem[];
}[] = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Projects", href: "/dashboard/projects", icon: BriefcaseBusiness },
      { label: "Workers", href: "/dashboard/workers", icon: HardHat },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Inventory", href: "/dashboard/inventory", icon: Package },
      { label: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
      {
        label: "Purchase Orders",
        href: "/dashboard/purchase-orders",
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: "Finance & Records",
    items: [
      { label: "Expenses", href: "/dashboard/expenses", icon: Wallet },
      { label: "Invoices", href: "/dashboard/invoices", icon: Receipt },
      {
        label: "Audit Logs",
        href: "/dashboard/audit-logs",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Users", href: "/dashboard/users", icon: Users },
      {
        label: "Contact Enquiries",
        href: "/dashboard/enquiries",
        icon: FileText,
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--concrete)]">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/[0.07] bg-[#111918] transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.07] px-5">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
              <Building2 size={21} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.23em] text-white">
                Aesthetics
              </p>
              <p className="mt-1 text-[10px] tracking-wide text-slate-400">
                Construction management
              </p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>
        
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="group mx-3 mt-4 flex items-center gap-3 rounded-xl border border-white/[0.08] px-3 py-2.5 text-[13px] font-medium text-slate-300 transition-colors hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
        >
          <Home
            size={17}
            strokeWidth={1.7}
            className="text-slate-400 transition-colors group-hover:text-white"
          />
          <span className="flex-1">Home</span>
          <ArrowUpRight size={14} className="text-slate-500" />
        </Link>


        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.19em] text-slate-500">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-emerald-400/10 text-emerald-200"
                          : "text-slate-400 hover:bg-white/[0.045] hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-emerald-300" />
                      )}

                      <Icon
                        size={17}
                        strokeWidth={isActive ? 2 : 1.7}
                        className={
                          isActive
                            ? "text-emerald-300"
                            : "text-slate-500 transition-colors group-hover:text-slate-200"
                        }
                      />

                      <span className="flex-1">{item.label}</span>

                      {isActive && (
                        <ChevronRight size={14} className="text-emerald-300/70" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="shrink-0 border-t border-white/[0.07] p-4">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/50 text-slate-300">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200">
                  Operations centre
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Aesthetics workspace
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="min-w-0 lg:pl-[270px]">
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl">
          <div className="flex h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--foreground)] transition hover:border-[var(--architect-green)] lg:hidden"
              >
                <Menu size={19} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  <Activity size={13} />
                  <span>Management workspace</span>
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">
                  {getPageTitle(pathname)}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-[var(--muted)]">
                  Workspace
                </span>
              </div>

              <NotificationButton />
            </div>
          </div>
        </header>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string) {
  const page = navigationGroups
    .flatMap((group) => group.items)
    .filter(
      (item) =>
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  if (page) return page.label;

  if (pathname === "/dashboard/settings") return "Settings";

  return "Construction operations";
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

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className={`relative flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition ${
          open
            ? "border-[var(--architect-green)] bg-[var(--background)]"
            : "border-[var(--border)] hover:border-[var(--architect-green)]"
        }`}
      >
        <Bell size={17} className="text-[var(--foreground)]" />
        <span className="hidden text-[var(--foreground)] sm:inline">
          Notifications
        </span>

        {unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--architect-green)] px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  Notifications
                </h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {unreadCount} unread messages
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await markAllAsRead();
                    } catch (error) {
                      console.error(
                        "Failed to mark all notifications as read:",
                        error
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--architect-green)] hover:underline"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {loading && (
                <div className="p-8 text-center text-sm text-[var(--muted)]">
                  Loading notifications...
                </div>
              )}

              {!loading && error && (
                <div className="p-6 text-center text-sm text-red-500">
                  {error}
                </div>
              )}

              {!loading && !error && notifications.length === 0 && (
                <div className="flex flex-col items-center px-5 py-10 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--background)] text-[var(--muted)]">
                    <Bell size={20} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                    All caught up
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    New notifications will appear here.
                  </p>
                </div>
              )}

              {!loading &&
                !error &&
                notifications.map((notification) => (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() => {
                      if (!notification.isRead) {
                        void handleNotificationClick(notification._id);
                      }
                    }}
                    className={`flex w-full gap-3 border-b border-[var(--border)] p-4 text-left transition hover:bg-[var(--background)] ${
                      !notification.isRead
                        ? "bg-[var(--background)]"
                        : ""
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        notification.isRead
                          ? "bg-transparent"
                          : "bg-[var(--architect-green)]"
                      }`}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[var(--foreground)]">
                        {notification.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
                        {notification.message}
                      </span>
                      <span className="mt-2 block text-[10px] text-[var(--muted)]">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </span>

                    {notification.isRead && (
                      <ArrowUpRight
                        size={14}
                        className="shrink-0 text-[var(--muted)]"
                      />
                    )}
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
