import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Users,
  ChevronRight,
  X,
  TrendingUp,
  UserCheck,
  Briefcase,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useManagerDashboard } from "../../hooks/useManagerDashboard";

export default function TeamPage() {
  const { data, isLoading } = useManagerDashboard();
  const [search, setSearch] = useState("");

  const roster = data?.roster ?? [];
  const filtered = roster.filter((dev) =>
    dev.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const avgProgress = roster.length
    ? Math.round(
        roster.reduce((acc, dev) => acc + (dev.overall_progress || 0), 0) /
          roster.length
      )
    : 0;

  return (
    <AppShell title="My Team">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)] space-y-6">
        {/* Header & Overview Bar */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink flex items-center gap-2.5">
              <Users className="text-primary" size={24} />
              Team Roster
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted">
              Track onboarding progression and performance metrics across your direct reports.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-canvas border border-border/80 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <UserCheck size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Total Team
                </p>
                <p className="text-sm font-bold text-ink">{roster.length} Developers</p>
              </div>
            </div>

            <div className="bg-canvas border border-border/80 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Avg Progress
                </p>
                <p className="text-sm font-bold text-ink">{avgProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar & Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team members by name..."
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-9 py-2.5 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink-muted/60 shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <span className="text-xs font-semibold text-ink-muted hidden sm:inline-block">
            Showing {filtered.length} of {roster.length}
          </span>
        </div>

        {/* Roster Table Content */}
        {isLoading ? (
          <div className="bg-surface border border-border rounded-2xl p-4 divide-y divide-border/60 shadow-xs">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="py-4 flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-canvas rounded-xl" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-canvas rounded-md" />
                    <div className="w-20 h-3 bg-canvas rounded-md" />
                  </div>
                </div>
                <div className="w-32 h-2 bg-canvas rounded-full" />
                <div className="w-20 h-8 bg-canvas rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-xs flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users size={24} />
            </div>
            <h3 className="font-display font-semibold text-ink text-base mb-1">
              No developers found
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
              {search
                ? `No team members matched "${search}". Try clearing or refining your query.`
                : "There are currently no developers assigned to your manager dashboard."}
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-canvas/50 text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                    <th className="px-6 py-3.5">Developer</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5 min-w-[200px]">Onboarding Progress</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((dev) => (
                    <tr
                      key={dev.id}
                      className="hover:bg-canvas/40 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary text-sm font-bold shrink-0 shadow-xs">
                            {dev.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-ink text-sm group-hover:text-primary transition-colors">
                              {dev.full_name}
                            </p>
                            <p className="text-xs text-ink-muted md:hidden">
                              {dev.job_role}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-ink-muted">
                        <span className="inline-flex items-center gap-1.5 bg-canvas border border-border px-2.5 py-1 rounded-lg">
                          <Briefcase size={13} className="text-ink-muted/70" />
                          {dev.job_role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5 max-w-xs">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-ink">
                              {dev.overall_progress}%
                            </span>
                            <span className="text-[10px] text-ink-muted font-medium">
                              {dev.overall_progress === 100 ? "Completed" : "In Progress"}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-canvas border border-border/60 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(0, dev.overall_progress))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/manager/team/${dev.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-xl transition-all shadow-xs"
                        >
                          View Profile
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}