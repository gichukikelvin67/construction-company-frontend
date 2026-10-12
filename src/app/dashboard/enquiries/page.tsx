
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type EnquiryStatus =
  | "new"
  | "in_progress"
  | "responded"
  | "closed";

type EnquiryType = "general" | "demo" | "pricing" | "enterprise";

interface ContactEnquiry {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  enquiryType: EnquiryType;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
}

const statuses: EnquiryStatus[] = [
  "new",
  "in_progress",
  "responded",
  "closed",
];

const statusLabels: Record<EnquiryStatus, string> = {
  new: "New",
  in_progress: "In progress",
  responded: "Responded",
  closed: "Closed",
};

const typeLabels: Record<EnquiryType, string> = {
  general: "General",
  demo: "Product demo",
  pricing: "Pricing",
  enterprise: "Enterprise",
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<ContactEnquiry | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const loadEnquiries = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.get("/contact-enquiries/manage");
      setEnquiries(response.data.data ?? []);
    } catch (err) {
      console.error("Failed to load contact enquiries:", err);
      setError("Unable to load enquiries. Please sign in and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEnquiries();
  }, [loadEnquiries]);

  const filteredEnquiries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const matchesStatus =
        statusFilter === "all" || enquiry.status === statusFilter;

      const matchesSearch =
        !query ||
        [
          enquiry.fullName,
          enquiry.email,
          enquiry.companyName ?? "",
          enquiry.phone ?? "",
          enquiry.message,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [enquiries, search, statusFilter]);

  const counts = useMemo(() => ({
    all: enquiries.length,
    new: enquiries.filter((item) => item.status === "new").length,
    in_progress: enquiries.filter((item) => item.status === "in_progress").length,
    responded: enquiries.filter((item) => item.status === "responded").length,
    closed: enquiries.filter((item) => item.status === "closed").length,
  }), [enquiries]);

  const updateStatus = async (
    enquiry: ContactEnquiry,
    status: EnquiryStatus
  ) => {
    if (enquiry.status === status) return;

    setUpdatingId(enquiry._id);
    setError("");
    setNotice("");

    try {
      const response = await api.patch(
        `/contact-enquiries/manage/${enquiry._id}/status`,
        { status }
      );

      const updated: ContactEnquiry = response.data.data;

      setEnquiries((current) =>
        current.map((item) =>
          item._id === updated._id ? updated : item
        )
      );

      setSelected((current) =>
        current?._id === updated._id ? updated : current
      );

      setNotice("Enquiry status updated.");
    } catch (err) {
      console.error("Failed to update enquiry:", err);
      setError("Unable to update this enquiry. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--architect-green)]">
            Customer relations
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            Contact enquiries
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Review website enquiries and track follow-up progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadEnquiries()}
          disabled={isLoading}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--concrete)] disabled:opacity-60"
        >
          {isLoading ? "Refreshing..." : "Refresh enquiries"}
        </button>
      </header>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {notice}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {([
          ["all", "All enquiries"],
          ["new", "New"],
          ["in_progress", "In progress"],
          ["responded", "Responded"],
          ["closed", "Closed"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`rounded-xl border p-5 text-left transition ${
              statusFilter === key
                ? "border-[var(--architect-green)] bg-[var(--architect-green)]/5"
                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--architect-green)]/50"
            }`}
          >
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
              {counts[key]}
            </p>
          </button>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, company or message..."
            className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
            aria-label="Filter by enquiry status"
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className="p-8 text-sm text-[var(--muted)]">Loading enquiries...</p>
        ) : filteredEnquiries.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="font-semibold text-[var(--foreground)]">
              No enquiries found
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Try another search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[var(--concrete)] text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Enquiry type</th>
                  <th className="px-5 py-4 font-semibold">Received</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry._id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--foreground)]">
                        {enquiry.fullName}
                      </p>
                      <p className="mt-1 text-[var(--muted)]">{enquiry.email}</p>
                      {enquiry.companyName && (
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {enquiry.companyName}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[var(--foreground)]">
                      {typeLabels[enquiry.enquiryType]}
                    </td>
                    <td className="px-5 py-4 text-[var(--muted)]">
                      {new Date(enquiry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        aria-label={`Status for ${enquiry.fullName}`}
                        value={enquiry.status}
                        disabled={updatingId === enquiry._id}
                        onChange={(event) =>
                          void updateStatus(
                            enquiry,
                            event.target.value as EnquiryStatus
                          )
                        }
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] disabled:opacity-60"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelected(enquiry)}
                        className="font-semibold text-[var(--architect-green)] hover:underline"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-dialog-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--surface)] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--architect-green)]">
                  Enquiry details
                </p>
                <h2 id="enquiry-dialog-title" className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                  {selected.fullName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close enquiry details"
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--concrete)]"
              >
                Close
              </button>
            </div>

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--muted)]">Email</dt>
                <dd className="mt-1 break-words text-sm text-[var(--foreground)]">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Phone</dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">{selected.phone || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Company</dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">{selected.companyName || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Enquiry type</dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">{typeLabels[selected.enquiryType]}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Received</dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">{new Date(selected.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Last updated</dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">{new Date(selected.updatedAt).toLocaleString()}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Message</h3>
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-[var(--concrete)] p-4 text-sm leading-7 text-[var(--foreground)]">
                {selected.message}
              </p>
            </div>

            <div className="mt-6">
              <label htmlFor="selected-status" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                Update status
              </label>
              <select
                id="selected-status"
                value={selected.status}
                disabled={updatingId === selected._id}
                onChange={(event) =>
                  void updateStatus(
                    selected,
                    event.target.value as EnquiryStatus
                  )
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
