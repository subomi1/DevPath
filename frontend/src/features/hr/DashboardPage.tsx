import { Link } from "react-router-dom";
import {
  UserPlus,
  Clock,
  CheckCircle2,
  TrendingUp,
  Building2,
  AlertCircle,
  Users,
  Sparkles,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useHRDashboard } from "../../hooks/useHRDashboard";

export default function HRDashboardPage() {
  const { data, isLoading, error } = useHRDashboard();

  if (isLoading) {
    return (
      <AppShell title="Dashboard">
        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)] space-y-6">
          <div className="h-24 bg-surface border border-border rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 bg-surface border border-border rounded-2xl animate-pulse"
              />
            ))}
          </div>
          <div className="h-64 bg-surface border border-border rounded-2xl animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell title="Dashboard">
        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-ink text-base">
                Failed to Load Dashboard
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted">
                We encountered an issue retrieving your HR metrics. Please try refreshing the page.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs"
            >
              Retry
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Dashboard">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto w-full min-h-[calc(100vh-4rem)] space-y-6">
        
        {/* Header Section */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink flex items-center gap-2.5">
              Onboarding Overview
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted">
              Manage developer invitations, track active onboardings, and review company metrics.
            </p>
          </div>
          <Link
            to="/hr/invite"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-all shadow-xs shrink-0"
          >
            <UserPlus size={16} />
            Invite Developer
          </Link>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<TrendingUp size={20} />}
            iconBg="bg-primary/10 text-primary border-primary/20"
            label="Active Onboardings"
            value={data.active_onboardings_count}
            subtitle="Currently in pipeline"
          />
          <StatCard
            icon={<Clock size={20} />}
            iconBg="bg-amber-500/10 text-amber-600 border-amber-500/20"
            label="Pending Activations"
            value={data.pending_activations_count}
            subtitle="Awaiting setup"
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            iconBg="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            label="Completed This Month"
            value={data.completed_this_month_count}
            subtitle="Successfully onboarded"
          />
        </div>

        {/* In-Progress Onboardings List Card */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs flex flex-col">
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-border flex items-center justify-between gap-4 bg-canvas/30">
            <div className="flex items-center gap-2.5">
              <Users size={18} className="text-primary" />
              <h2 className="font-display font-semibold text-ink text-sm sm:text-base">
                In-Progress Onboardings
              </h2>
            </div>
            <span className="text-xs font-semibold bg-canvas border border-border px-2.5 py-1 rounded-lg text-ink-muted">
              {data.onboardings.length} Active
            </span>
          </div>

          {data.onboardings.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-display font-semibold text-ink text-base mb-1">
                No Active Onboardings
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
                There are no developers currently going through the onboarding process. Use the button above to issue a new invite.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {data.onboardings.map((row) => (
                <div
                  key={row.developer_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 sm:px-6 sm:py-4 gap-4 hover:bg-canvas/40 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary text-sm font-bold shrink-0 shadow-xs">
                      {row.full_name?.charAt(0) ?? "D"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate group-hover:text-primary transition-colors">
                        {row.full_name}
                      </p>
                      <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                        <Building2 size={12} className="text-ink-muted/70" />
                        {row.department ?? "Unassigned Department"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:w-64">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-ink-muted">Overall Progress</span>
                        <span className="text-ink">{row.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-canvas border border-border/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, row.progress))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
      <div className="space-y-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          {label}
        </p>
        <p className="text-2xl font-bold font-display text-ink">{value}</p>
        {subtitle && (
          <p className="text-[11px] text-ink-muted/80 truncate">{subtitle}</p>
        )}
      </div>
      <div className={`w-11 h-11 border rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}