import { Link } from "react-router-dom";
import { useDeveloperDashboard } from "../../hooks/useDashboard";
import { useAuth } from "../../hooks/useAuth";
import { AppShell } from "../../layouts/AppShell";
import {
  CheckSquare,
  Calendar,
  KeyRound,
  MessageSquare,
  CalendarPlus,
  Clock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Bell,
  Mail,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, error } = useDeveloperDashboard();
  const { user } = useAuth();

  const firstName = user?.full_name?.split(" ")[0] || "Developer";

  if (isLoading) {
    return (
      <AppShell title="Dashboard">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Hero Skeleton */}
          <div className="h-32 bg-surface border border-border rounded-2xl animate-pulse" />
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-surface border border-border rounded-2xl animate-pulse"
              />
            ))}
          </div>
          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-surface border border-border rounded-2xl animate-pulse" />
            <div className="h-80 bg-surface border border-border rounded-2xl animate-pulse" />
          </div>
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
                Failed to load dashboard
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted">
                Something went wrong while fetching your onboarding overview. Please try refreshing.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl"
            >
              Reload Page
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Dashboard">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto w-full space-y-6 min-h-[calc(100vh-4rem)]">
        {/* Hero Banner Row */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              {data.overall_progress === 0
                ? "Ready to kickstart your developer journey? Check your daily tasks below."
                : `You're making great progress! ${data.overall_progress}% of your onboarding checklist is complete.`}
            </p>
          </div>

          {/* Circular Progress Meter */}
          <div className="flex items-center gap-4 bg-canvas/60 border border-border/80 rounded-2xl p-4 sm:p-5 shrink-0 z-10 self-stretch sm:self-auto justify-center">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-border"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary transition-all duration-1000 ease-out"
                  strokeDasharray={`${data.overall_progress}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-display text-sm sm:text-base font-bold text-ink">
                {data.overall_progress}%
              </span>
            </div>
            <div className="text-left space-y-0.5">
              <p className="text-xs font-semibold text-ink uppercase tracking-wider">
                Overall
              </p>
              <p className="text-xs text-ink-muted">Progress</p>
            </div>
          </div>
        </div>

        {/* Quick Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={CheckSquare}
            label="Today's Tasks"
            value={data.today_tasks_count}
            subtext="Items pending review"
            color="primary"
          />
          <StatCard
            icon={Calendar}
            label="Upcoming Events"
            value={0}
            subtext="Syncs & meetings"
            color="emerald"
          />
          <StatCard
            icon={KeyRound}
            label="Open Access Requests"
            value={data.open_access_requests_count}
            subtext="Pending provisioning"
            color="amber"
          />
        </div>

        {/* Main Split Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
          {/* Left Column: Today's Tasks */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare size={18} className="text-primary" />
                  <h2 className="font-display font-semibold text-ink text-base">
                    Today's Priority Tasks
                  </h2>
                </div>
                <span className="text-xs text-ink-muted font-medium bg-canvas border border-border px-2.5 py-0.5 rounded-md">
                  {data.today_tasks.length} items
                </span>
              </div>

              {data.today_tasks.length === 0 ? (
                <div className="bg-canvas/50 border border-border/80 rounded-xl p-8 text-center space-y-2 my-2">
                  <CheckCircle2 size={24} className="text-primary mx-auto" />
                  <p className="text-xs sm:text-sm font-semibold text-ink">
                    All clear for today!
                  </p>
                  <p className="text-xs text-ink-muted max-w-xs mx-auto">
                    You have no outstanding onboarding tasks scheduled for today.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {data.today_tasks.map((task) => (
                    <div
                      key={task.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-canvas/30 rounded-xl px-2 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border shrink-0 cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium text-ink truncate">
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-xs">
                        <PriorityPill priority={task.priority} />
                        <span className="flex items-center gap-1 text-ink-muted bg-canvas border border-border/60 px-2 py-0.5 rounded-md text-[11px]">
                          <Clock size={11} /> {task.estimated_minutes}m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-6 border-t border-border flex justify-end">
              <Link
                to="/developer/checklist"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                View full onboarding checklist
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: Mentor & Announcements */}
          <div className="flex flex-col gap-6">
            {/* Mentor Card */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-ink text-sm uppercase tracking-wider">
                  Assigned Mentor
                </h2>
              </div>

              {data.mentor.full_name ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary text-base font-bold shrink-0">
                      {data.mentor.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">
                        {data.mentor.full_name}
                      </p>
                      <p className="text-xs text-ink-muted">
                        Senior Developer Lead
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/developer/mentor"
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-canvas border border-border hover:bg-border/40 text-ink py-2 rounded-xl transition-all"
                    >
                      <MessageSquare size={13} /> Message
                    </Link>
                    <Link
                      to="/developer/mentor"
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white py-2 rounded-xl transition-all shadow-xs"
                    >
                      <CalendarPlus size={13} /> Schedule
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-canvas/50 border border-border/80 rounded-xl p-4 text-center">
                  <p className="text-xs text-ink-muted">
                    No mentor assigned to your profile yet.
                  </p>
                </div>
              )}
            </div>

            {/* Recent Announcements */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-primary" />
                    <h2 className="font-display font-semibold text-ink text-sm uppercase tracking-wider">
                      Announcements
                    </h2>
                  </div>
                </div>

                {data.recent_announcements.length === 0 ? (
                  <p className="text-xs text-ink-muted italic py-2">
                    No recent announcements posted.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {data.recent_announcements.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-start gap-2.5 group cursor-pointer"
                      >
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                            a.is_read ? "bg-border" : "bg-primary"
                          }`}
                        />
                        <span className="text-xs sm:text-sm text-ink group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {a.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-3 border-t border-border">
                <Link
                  to="/developer/announcements"
                  className="inline-flex items-center justify-between w-full text-xs font-semibold text-ink-muted hover:text-primary transition-colors"
                >
                  <span>All announcements</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* Stat Card Helper Component */
function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  subtext: string;
  color: "primary" | "emerald" | "amber";
}) {
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4 hover:border-primary/40 transition-colors">
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="text-2xl font-bold font-display text-ink">{value}</p>
        <p className="text-[11px] text-ink-muted/80 truncate">{subtext}</p>
      </div>

      <div
        className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${colorMap[color]}`}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}

/* Priority Badge Component */
function PriorityPill({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: "bg-danger/10 text-danger border-danger/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    low: "bg-canvas text-ink-muted border-border",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${
        styles[priority] ?? styles.low
      }`}
    >
      {priority}
    </span>
  );
}