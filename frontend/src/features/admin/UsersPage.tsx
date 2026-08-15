import { useState } from "react";
import {
  Search,
  ShieldCheck,
  Loader2,
  Sparkles,
  UserX,
  Archive,
  ChevronDown,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import {
  useAllUsers,
  useChangeRole,
  useSuspendUser,
  useArchiveUser,
} from "../../hooks/useUsers";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "hr", label: "HR" },
  { value: "manager", label: "Manager" },
  { value: "developer", label: "Developer" },
];

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  active: {
    label: "Active",
    style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  pending_activation: {
    label: "Pending Activation",
    style: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  pending_invitation: {
    label: "Pending Invitation",
    style: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  suspended: {
    label: "Suspended",
    style: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  archived: {
    label: "Archived",
    style: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },
};

function StatusPill({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.replace("_", " "),
    style: "bg-canvas text-ink-muted border-border",
  };

  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg border capitalize shadow-2xs ${config.style}`}
    >
      {config.label}
    </span>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useAllUsers(search || undefined);
  const changeRole = useChangeRole();
  const suspendUser = useSuspendUser();
  const archiveUser = useArchiveUser();

  const handleRoleChange = (
    userId: string,
    userName: string,
    newRole: string,
  ) => {
    if (confirm(`Change ${userName}'s role to ${newRole.toUpperCase()}?`)) {
      changeRole.mutate({ userId, role: newRole });
    }
  };

  const handleSuspend = (userId: string, userName: string) => {
    if (
      confirm(
        `Are you sure you want to suspend ${userName}? They will lose access to the system.`,
      )
    ) {
      suspendUser.mutate(userId);
    }
  };

  const handleArchive = (userId: string, userName: string) => {
    if (
      confirm(
        `Are you sure you want to archive ${userName}? This action cannot be easily undone.`,
      )
    ) {
      archiveUser.mutate(userId);
    }
  };

  return (
    <AppShell title="Users & Roles">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto w-full min-h-[calc(100vh-4rem)] space-y-6">
        {/* Header */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink flex items-center gap-2.5">
              <ShieldCheck className="text-primary" size={24} />
              Users & Roles Management
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted">
              Manage accounts, assign organization roles, and update access
              permissions across AppZone.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/80 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink-muted/60 shadow-xs"
            />
          </div>

          {users && (
            <span className="text-xs font-semibold text-ink-muted self-end sm:self-center">
              Showing {users.length} account{users.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {/* Table Container */}
        {/* Users Container */}
        <div className="bg-surface border border-border rounded-2xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-ink-muted space-y-3">
              <Loader2 size={24} className="animate-spin text-primary" />
              <p className="text-xs font-medium">Loading user directory...</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-canvas/60 border-b border-border/80 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                      <th className="px-5 py-3.5">User Profile</th>
                      <th className="px-5 py-3.5">Role</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {users?.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-canvas/40 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                              {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-ink truncate">
                                {u.full_name}
                              </p>
                              <p className="text-xs text-ink-muted truncate">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative inline-block">
                            <select
                              value={u.role}
                              disabled={changeRole.isPending}
                              onChange={(e) =>
                                handleRoleChange(
                                  u.id,
                                  u.full_name,
                                  e.target.value,
                                )
                              }
                              className="appearance-none bg-canvas border border-border/80 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-ink capitalize focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                            >
                              {ROLES.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={14}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill status={u.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.status !== "suspended" &&
                              u.status !== "archived" && (
                                <button
                                  onClick={() =>
                                    handleSuspend(u.id, u.full_name)
                                  }
                                  disabled={suspendUser.isPending}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                                  title="Suspend user account"
                                >
                                  <UserX size={13} /> Suspend
                                </button>
                              )}
                            {u.status !== "archived" && (
                              <button
                                onClick={() => handleArchive(u.id, u.full_name)}
                                disabled={archiveUser.isPending}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                                title="Archive user account"
                              >
                                <Archive size={13} /> Archive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-border/60">
                {users?.map((u) => (
                  <div key={u.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                        {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink truncate">
                          {u.full_name}
                        </p>
                        <p className="text-xs text-ink-muted truncate">
                          {u.email}
                        </p>
                      </div>
                      <StatusPill status={u.status} />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="relative inline-block">
                        <select
                          value={u.role}
                          disabled={changeRole.isPending}
                          onChange={(e) =>
                            handleRoleChange(u.id, u.full_name, e.target.value)
                          }
                          className="appearance-none bg-canvas border border-border/80 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-ink capitalize focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {u.status !== "suspended" &&
                          u.status !== "archived" && (
                            <button
                              onClick={() => handleSuspend(u.id, u.full_name)}
                              disabled={suspendUser.isPending}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 disabled:opacity-50"
                            >
                              <UserX size={13} />
                            </button>
                          )}
                        {u.status !== "archived" && (
                          <button
                            onClick={() => handleArchive(u.id, u.full_name)}
                            disabled={archiveUser.isPending}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-lg px-2.5 py-1.5 disabled:opacity-50"
                          >
                            <Archive size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {users?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
                  <div className="w-12 h-12 bg-canvas border border-border rounded-2xl flex items-center justify-center text-ink-muted shadow-2xs">
                    <Sparkles size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-ink">
                      No user accounts found
                    </h3>
                    <p className="text-xs text-ink-muted max-w-sm">
                      {search
                        ? `No users matched "${search}". Try adjusting your query.`
                        : "There are no active users registered in the system."}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
