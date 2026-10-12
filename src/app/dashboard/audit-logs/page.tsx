
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAuditLogs,
  type AuditLog,
} from "@/services/auditLogService";

const actionOptions = [
  "create",
  "update",
  "delete",
  "approve",
  "reject",
  "cancel",
  "receive",
  "login",
  "logout",
  "activate",
  "deactivate",
];

const formatLabel = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const actionStyle = (action: string) => {
  switch (action) {
    case "approve":
    case "activate":
    case "receive":
      return "bg-emerald-100 text-emerald-800";
    case "reject":
    case "cancel":
    case "deactivate":
    case "delete":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setLogs(await getAuditLogs());
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load audit logs."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const resources = useMemo(
    () => [...new Set(logs.map((log) => log.resource))].sort(),
    [logs]
  );

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return logs.filter((log) => {
      const userName =
        typeof log.user === "object" ? log.user.name : "";

      const userEmail =
        typeof log.user === "object" ? log.user.email : "";

      const matchesSearch =
        !term ||
        log.description.toLowerCase().includes(term) ||
        log.resource.toLowerCase().includes(term) ||
        userName.toLowerCase().includes(term) ||
        userEmail.toLowerCase().includes(term) ||
        (log.resourceId ?? "").toLowerCase().includes(term);

      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;

      const matchesResource =
        resourceFilter === "all" || log.resource === resourceFilter;

      return matchesSearch && matchesAction && matchesResource;
    });
  }, [logs, search, actionFilter, resourceFilter]);

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--architect-green)]">
            Security &amp; accountability
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[var(--foreground)]">
            Audit Logs
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Review recorded account, purchase-order, and operational events.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadLogs()}
          disabled={loading}
          className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--concrete)] disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh logs"}
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
        >
          <p>{error}</p>
          <p className="mt-1 text-xs">
            Check that you are signed in as an administrator and the backend is running.
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">Loaded events</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            {logs.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">Approvals</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            {logs.filter((log) => log.action === "approve").length}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">Receipts</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            {logs.filter((log) => log.action === "receive").length}
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search descriptions, users, IDs..."
            className="rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
          />

          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
          >
            <option value="all">All actions</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {formatLabel(action)}
              </option>
            ))}
          </select>

          <select
            value={resourceFilter}
            onChange={(event) => setResourceFilter(event.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
          >
            <option value="all">All resources</option>
            {resources.map((resource) => (
              <option key={resource} value={resource}>
                {formatLabel(resource)}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="px-3 py-4 font-medium">Date &amp; time</th>
                <th className="px-3 py-4 font-medium">User</th>
                <th className="px-3 py-4 font-medium">Action</th>
                <th className="px-3 py-4 font-medium">Resource</th>
                <th className="px-3 py-4 font-medium">Description</th>
                <th className="px-3 py-4 text-right font-medium">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-[var(--muted)]"
                  >
                    Loading audit history...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-[var(--muted)]"
                  >
                    No matching audit events found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const userName =
                    typeof log.user === "object"
                      ? log.user.name
                      : "User unavailable";

                  const userRole =
                    typeof log.user === "object"
                      ? formatLabel(log.user.role)
                      : "";

                  return (
                    <tr key={log._id} className="text-[var(--foreground)]">
                      <td className="whitespace-nowrap px-3 py-4">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-semibold">{userName}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {userRole}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${actionStyle(log.action)}`}
                        >
                          {formatLabel(log.action)}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {formatLabel(log.resource)}
                      </td>
                      <td className="max-w-sm px-3 py-4">
                        <p className="line-clamp-2">{log.description}</p>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold hover:bg-[var(--concrete)]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-[var(--muted)]">
          Showing {filteredLogs.length} of {logs.length} loaded events. The backend currently returns at most 100 records.
        </p>
      </section>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
          <section className="my-4 w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Audit event details
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {selectedLog.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--concrete)]"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--muted)]">Action</dt>
                <dd className="mt-1 font-semibold text-[var(--foreground)]">
                  {formatLabel(selectedLog.action)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Resource</dt>
                <dd className="mt-1 font-semibold text-[var(--foreground)]">
                  {formatLabel(selectedLog.resource)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Date &amp; time</dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">User</dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">
                  {typeof selectedLog.user === "object"
                    ? `${selectedLog.user.name} (${selectedLog.user.email})`
                    : "User unavailable"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[var(--muted)]">Resource ID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-[var(--foreground)]">
                  {selectedLog.resourceId ?? "Not recorded"}
                </dd>
              </div>
              {selectedLog.ipAddress && (
                <div>
                  <dt className="text-xs text-[var(--muted)]">IP address</dt>
                  <dd className="mt-1 text-sm text-[var(--foreground)]">
                    {selectedLog.ipAddress}
                  </dd>
                </div>
              )}
              {selectedLog.userAgent && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-[var(--muted)]">User agent</dt>
                  <dd className="mt-1 break-all text-xs text-[var(--foreground)]">
                    {selectedLog.userAgent}
                  </dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-xs text-[var(--muted)]">Metadata</dt>
                <dd className="mt-2 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--concrete)] p-4">
                  <pre className="whitespace-pre-wrap break-words text-xs text-[var(--foreground)]">
                    {selectedLog.metadata
                      ? JSON.stringify(selectedLog.metadata, null, 2)
                      : "No additional metadata recorded."}
                  </pre>
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
