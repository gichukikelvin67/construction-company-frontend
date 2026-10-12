
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createUser,
  getUsers,
  toggleUserStatus,
  updateUserProfile,
  updateUserRole,
  type CompanyUser,
  type CreateUserData,
  type UserRole,
} from "@/services/userService";

const roles: { value: Exclude<UserRole, "admin">; label: string }[] = [
  { value: "project_manager", label: "Project Manager" },
  { value: "site_supervisor", label: "Site Supervisor" },
  { value: "accountant", label: "Accountant" },
  { value: "storekeeper", label: "Storekeeper" },
];

const roleLabel = (role: UserRole) =>
  role === "admin"
    ? "Administrator"
    : roles.find((item) => item.value === role)?.label ?? role;

export default function UsersPage() {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);

  const [form, setForm] = useState<CreateUserData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "accountant",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "accountant" as Exclude<UserRole, "admin">,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setUsers(await getUsers());
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone.includes(term);

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const openCreateForm = () => {
    resetMessages();
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "accountant",
    });
    setShowForm(true);
  };

  const openEditForm = (user: CompanyUser) => {
    resetMessages();
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role:
        user.role === "admin" ? "accountant" : user.role,
    });
    setShowForm(true);
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    setSaving(true);

    try {
      await createUser({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });

      setSuccess("User account created successfully.");
      setShowForm(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "accountant",
      });
      await loadUsers();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create user."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingUser) return;

    resetMessages();
    setSaving(true);

    try {
      await updateUserProfile(editingUser._id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
      });

      if (
        editingUser.role !== "admin" &&
        editingUser.role !== editForm.role
      ) {
        await updateUserRole(editingUser._id, editForm.role);
      }

      setSuccess("User profile updated successfully.");
      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update user."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: CompanyUser) => {
    const action = user.isActive ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${user.name}'s account?`
      )
    ) {
      return;
    }

    resetMessages();

    try {
      await toggleUserStatus(user._id);
      setSuccess(
        `${user.name}'s account has been ${user.isActive ? "deactivated" : "activated"}.`
      );
      await loadUsers();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update account status."
      );
    }
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--architect-green)]">
            Administration
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[var(--foreground)]">
            Users
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Manage team accounts, permissions, and account access.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-xl bg-[var(--architect-green)] px-5 py-3 font-semibold text-white transition hover:opacity-90"
        >
          + Add user
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {success}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">Total users</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            {users.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">Active accounts</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            {users.filter((user) => user.isActive).length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">Accountants</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            {users.filter((user) => user.role === "accountant").length}
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, or phone..."
            className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--architect-green)]"
          />

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
          >
            <option value="all">All roles</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
            <option value="admin">Administrator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
          >
            <option value="all">All account statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="px-3 py-4 font-medium">Team member</th>
                <th className="px-3 py-4 font-medium">Phone</th>
                <th className="px-3 py-4 font-medium">Role</th>
                <th className="px-3 py-4 font-medium">Status</th>
                <th className="px-3 py-4 font-medium">Email verified</th>
                <th className="px-3 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-[var(--muted)]"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-[var(--muted)]"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="text-[var(--foreground)]">
                    <td className="px-3 py-4">
                      <p className="font-semibold">{user.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-3 py-4">{user.phone || "—"}</td>
                    <td className="px-3 py-4">{roleLabel(user.role)}</td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          user.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      {user.emailVerified ? "Verified" : "Not verified"}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(user)}
                          className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold hover:bg-[var(--concrete)]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={user.role === "admin"}
                          onClick={() => void handleToggleStatus(user)}
                          className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold hover:bg-[var(--concrete)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-[var(--muted)]">
          Showing {filteredUsers.length} of {users.length} users.
        </p>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
          <section className="my-4 w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  {editingUser ? "Edit team member" : "Create user account"}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {editingUser
                    ? "Update profile details and permissions."
                    : "Create a secure account for your team member."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--concrete)]"
                aria-label="Close form"
              >
                ✕
              </button>
            </div>

            {editingUser ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
                    Full name
                    <input
                      required
                      minLength={2}
                      maxLength={150}
                      value={editForm.name}
                      onChange={(event) =>
                        setEditForm({ ...editForm, name: event.target.value })
                      }
                      className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
                    Email
                    <input
                      required
                      type="email"
                      maxLength={150}
                      value={editForm.email}
                      onChange={(event) =>
                        setEditForm({ ...editForm, email: event.target.value })
                      }
                      className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
                    Phone
                    <input
                      required
                      minLength={7}
                      maxLength={20}
                      value={editForm.phone}
                      onChange={(event) =>
                        setEditForm({ ...editForm, phone: event.target.value })
                      }
                      className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
                    Role
                    <select
                      disabled={editingUser.role === "admin"}
                      value={editForm.role}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          role: event.target.value as Exclude<UserRole, "admin">,
                        })
                      }
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 disabled:opacity-50"
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
                    Full name
                    <input
                      required
                      minLength={2}
                      maxLength={150}
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                      className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
                    Email
                    <input
                      required
                      type="email"
                      maxLength={150}
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                      className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
                    Phone
                    <input
                      required
                      minLength={7}
                      maxLength={20}
                      value={form.phone}
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value })
                      }
                      className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-[var(--foreground)]">
                    Temporary password
                    <input
                      required
                      type="password"
                      minLength={8}
                      maxLength={100}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(event) =>
                        setForm({ ...form, password: event.target.value })
                      }
                      className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3"
                    />
                    <span className="block text-xs font-normal text-[var(--muted)]">
                      Use at least 8 characters. Share it securely and ask the user to change it when possible.
                    </span>
                  </label>

                  <label className="space-y-2 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
                    Role
                    <select
                      required
                      value={form.role}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          role: event.target.value as Exclude<UserRole, "admin">,
                        })
                      }
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "Creating..." : "Create account"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
