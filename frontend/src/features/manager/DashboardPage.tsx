import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  ClipboardCheck,
  ChevronRight,
  Sparkles,
  AlertCircle,
  ArrowUpRight,
  UserCheck,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useManagerDashboard } from "../../hooks/useManagerDashboard";

export default function ManagerDashboardPage() {
  const { data, isLoading, error } = useManagerDashboard();

  if (isLoading) {
    return (
      <AppShell title="Dashboard">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="h-24 bg-surface border border-border rounded-2xl animate-pulse" />

          {/* Stat Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-surface border border-border rounded-2xl animate-pulse"
              />
            ))}
          </div>

          {/* Roster Skeleton */}
          <div className="h-96 bg-surface border border-border rounded-2xl animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell title="Dashboard">
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="font-display font-semibold text-ink text-base">
                Unable to load dashboard
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted">
                We couldn't fetch your manager overview. Please verify your connection and try again.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Dashboard">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto w-full space-y-6 min-h-[calc(100vh-4rem)]">
        {/* Page Header */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">
                Team Overview
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted">
              Monitor onboarding progression, address blockers, and review developer task approvals.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-ink-muted bg-canvas border border-border px-3 py-1.5 rounded-xl">
              {data.assigned_developers_count} Direct Reports
            </span>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Assigned Developers"
            value={data.assigned_developers_count}
            subtext="Active in program"
            variant="primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Average Progress"
            value={`${data.average_progress}%`}
            subtext="Team completion rate"
            variant="emerald"
          />
          <StatCard
            icon={AlertTriangle}
            label="Overdue Tasks"
            value={data.overdue_tasks_count}
            subtext={
              data.overdue_tasks_count > 0
                ? "Requires immediate attention"
                : "No overdue items"
            }
            variant={data.overdue_tasks_count > 0 ? "danger" : "neutral"}
          />
          <StatCard
            icon={ClipboardCheck}
            label="Pending Approvals"
            value={data.pending_approvals_count}
            subtext="Awaiting review"
            variant="amber"
          />
        </div>

        {/* Team Roster List (Fills Vertical Space) */}
        <div className="bg-surface border border-border rounded-2xl shadow-xs flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center gap-2">
              <UserCheck size={18} className="text-primary" />
              <h2 className="font-display font-semibold text-ink text-base">
                Developer Roster
              </h2>
            </div>
            <span className="text-xs text-ink-muted font-medium bg-canvas border border-border px-2.5 py-0.5 rounded-md">
              {data.roster.length} members
            </span>
          </div>

          {data.roster.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-canvas border border-border rounded-2xl flex items-center justify-center text-ink-muted">
                <Users size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink">
                  No developers assigned yet
                </p>
                <p className="text-xs text-ink-muted max-w-sm">
                  When developers are assigned to your team, their onboarding progress and status will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/60 flex-1 overflow-y-auto">
              {data.roster.map((dev) => (
                <Link
                  key={dev.id}
                  to={`/manager/team/${dev.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-canvas/50 transition-all duration-150 gap-4 group"
                >
                  {/* Member Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary text-sm font-bold shrink-0 group-hover:scale-105 transition-transform">
                      {dev.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink group-hover:text-primary transition-colors truncate">
                          {dev.full_name}
                        </p>
                        <ArrowUpRight
                          size={14}
                          className="text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        />
                      </div>
                      <p className="text-xs text-ink-muted truncate">
                        {dev.job_role || "Developer"}
                      </p>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="flex items-center gap-4 shrink-0 w-44 sm:w-56">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[11px] text-ink-muted font-medium">
                          Progress
                        </span>
                        <span className="font-semibold text-ink">
                          {dev.overall_progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-canvas border border-border/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            dev.overall_progress === 100
                              ? "bg-emerald-500"
                              : dev.overall_progress > 50
                              ? "bg-primary"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${dev.overall_progress}%` }}
                        />
                      </div>
                    </div>

                    <ChevronDownRightIcon />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

/* StatCard Helper Component */
function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  variant = "neutral",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext: string;
  variant?: "primary" | "emerald" | "danger" | "amber" | "neutral";
}) {
  const variantStyles = {
    primary: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    neutral: "bg-canvas text-ink-muted border-border",
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4 hover:border-primary/30 transition-all">
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider truncate">
          {label}
        </p>
        <p
          className={`text-2xl font-bold font-display ${
            variant === "danger" ? "text-danger" : "text-ink"
          }`}
        >
          {value}
        </p>
        <p className="text-[11px] text-ink-muted/80 truncate">{subtext}</p>
      </div>

      <div
        className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${variantStyles[variant]}`}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}

/* Arrow Icon Helper */
function ChevronDownRightIcon() {
  return (
    <div className="w-8 h-8 rounded-xl bg-canvas border border-border/60 flex items-center justify-center text-ink-muted group-hover:text-ink group-hover:bg-surface transition-colors shrink-0">
      <ChevronRight size={16} />
    </div>
  );
}