import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  Compass,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useDeveloperJourneyDetail } from "../../hooks/useDeveloperJourneyDetail";
import { HexNode } from "../../components/ui/HexNode";

export default function DeveloperDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useDeveloperJourneyDetail(id);

  if (isLoading) {
    return (
      <AppShell title="Developer Detail">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
          <div className="h-6 w-36 bg-surface border border-border rounded-lg animate-pulse" />
          <div className="h-32 bg-surface border border-border rounded-2xl animate-pulse" />
          <div className="h-40 bg-surface border border-border rounded-2xl animate-pulse" />
          <div className="h-64 bg-surface border border-border rounded-2xl animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell title="Developer Detail">
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="font-display font-semibold text-ink text-base">
                Couldn't load developer profile
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted">
                We encountered an issue fetching this developer's journey data. Please check the ID or try again.
              </p>
            </div>
            <Link
              to="/manager/dashboard"
              className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const { developer, journey } = data;

  const verificationQueue = journey
    ? journey.phases
        .flatMap((phase) =>
          phase.tasks.map((task) => ({ ...task, phaseName: phase.name }))
        )
        .filter(
          (task) =>
            task.status === "completed" &&
            task.verification_type === "manager_verified"
        )
    : [];

  return (
    <AppShell title={developer.full_name}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
        {/* Top Navigation */}
        <div>
          <Link
            to="/manager/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-ink-muted hover:text-ink transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Team Overview
          </Link>
        </div>

        {/* Developer Hero Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary text-xl font-bold shrink-0 shadow-xs">
              {developer.full_name.charAt(0)}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-xl font-bold text-ink truncate">
                  {developer.full_name}
                </h1>
                <span className="bg-canvas border border-border text-[11px] font-semibold text-ink-muted px-2.5 py-0.5 rounded-full shrink-0">
                  Developer
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <Briefcase size={13} className="text-ink-muted/70" />
                  {developer.job_role || "Software Engineer"}
                </span>
                <span className="hidden sm:inline text-border">·</span>
                <span className="flex items-center gap-1.5 truncate">
                  <Mail size={13} className="text-ink-muted/70" />
                  {developer.email}
                </span>
              </div>
            </div>
          </div>

          {journey && (
            <div className="flex items-center gap-4 bg-canvas/60 border border-border/80 rounded-2xl p-3.5 sm:p-4 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                  Overall Journey
                </p>
                <p className="text-xs text-ink-muted">Onboarding Progress</p>
              </div>
              <div className="flex items-center gap-2 border-l border-border/80 pl-4">
                <span className="font-display text-2xl font-bold text-primary">
                  {journey.overall_progress}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Verification Queue Section */}
        {verificationQueue.length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600">
                <ShieldCheck size={18} />
                <h2 className="font-display font-semibold text-ink text-base">
                  Pending Manager Verifications
                </h2>
              </div>
              <span className="bg-amber-500/10 text-amber-700 border border-amber-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {verificationQueue.length} awaiting
              </span>
            </div>

            <div className="divide-y divide-amber-500/10 bg-surface/80 border border-amber-500/20 rounded-xl overflow-hidden">
              {verificationQueue.map((task) => (
                <div
                  key={task.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-surface transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-ink truncate">
                      {task.title}
                    </p>
                    <p className="text-[11px] text-ink-muted font-medium">
                      Phase: {task.phaseName}
                    </p>
                  </div>
                  <Link
                    to="/manager/approvals"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg shadow-xs transition-colors shrink-0"
                  >
                    Review Task
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Journey Timeline */}
        {!journey ? (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-canvas border border-border rounded-2xl flex items-center justify-center text-ink-muted mx-auto">
              <Compass size={24} />
            </div>
            <h3 className="font-display font-semibold text-ink text-base">
              No Journey Assigned
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
              This developer currently does not have an active onboarding journey assigned to their profile.
            </p>
          </div>
        ) : (
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                Onboarding Phases & Task Roadmap
              </h2>
            </div>

            <div className="space-y-6">
              {journey.phases.map((phase, pIdx) => (
                <div
                  key={phase.id}
                  className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {pIdx + 1}
                      </span>
                      <h3 className="font-display text-sm sm:text-base font-bold text-ink">
                        {phase.name}
                      </h3>
                    </div>
                    <span className="text-xs font-medium text-ink-muted bg-canvas border border-border px-2.5 py-0.5 rounded-md">
                      {phase.tasks.length} Tasks
                    </span>
                  </div>

                  {/* Task Nodes Timeline */}
                  <div className="relative pl-2 sm:pl-4 space-y-4 before:absolute before:left-[21px] sm:before:left-[29px] before:top-4 before:bottom-4 before:w-0.5 before:bg-border/60">
                    {phase.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="relative flex items-center gap-4 group"
                      >
                        <div className="relative z-10 shrink-0 bg-surface rounded-full">
                          <HexNode status={task.status} size={32} />
                        </div>

                        <div className="flex-1 bg-canvas/60 border border-border/80 rounded-xl p-3.5 flex items-center justify-between gap-4 group-hover:border-border transition-colors">
                          <div className="space-y-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-ink truncate">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusPill status={task.status} />
                              {task.verification_type ===
                                "manager_verified" && (
                                <span className="text-[10px] text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-semibold">
                                  Requires Verification
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, { label: string; style: string }> = {
    completed: {
      label: "Completed",
      style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    in_progress: {
      label: "In Progress",
      style: "bg-primary/10 text-primary border-primary/20",
    },
    pending: {
      label: "Pending",
      style: "bg-surface text-ink-muted border-border",
    },
    blocked: {
      label: "Blocked",
      style: "bg-danger/10 text-danger border-danger/20",
    },
  };

  const item = styles[status] ?? {
    label: status.replace("_", " "),
    style: "bg-surface text-ink-muted border-border",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider capitalize ${item.style}`}
    >
      {item.label}
    </span>
  );
}