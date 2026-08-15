import { useState } from "react";
import { AppShell } from "../../layouts/AppShell";
import { useJourney } from "../../hooks/useJourney";
import { HexNode } from "../../components/ui/HexNode";
import { TaskDetailDrawer } from "./TaskDetailDrawer";
import type { JourneyTask } from "../../types/journey";
import {
  LayoutList,
  GitBranch,
  Loader2,
  AlertCircle,
  ChevronRight,
  Lock,
} from "lucide-react";

export default function JourneyPage() {
  const { data: journey, isLoading, error } = useJourney();
  const [view, setView] = useState<"timeline" | "checklist">("timeline");
  const [selectedTask, setSelectedTask] = useState<JourneyTask | null>(null);

  if (isLoading) {
    return (
      <AppShell title="My Journey">
        <div className="min-h-[80vh] flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 text-ink-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading your journey...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !journey) {
    return (
      <AppShell title="My Journey">
        <div className="min-h-[80vh] flex items-center justify-center p-6">
          <div className="bg-surface border border-danger/20 rounded-2xl p-6 max-w-md text-center shadow-xs">
            <div className="w-12 h-12 bg-danger/10 text-danger rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-display font-semibold text-ink text-base">
              Couldn't load your journey
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              There was a problem loading your onboarding trajectory. Please try again.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const overallProgress = Math.min(
    Math.max(journey.overall_progress || 0, 0),
    100
  );

  return (
    <AppShell title="My Journey">
      <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        
        {/* Header with Progress & View Toggle */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1 w-full sm:w-auto">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">
              Your Onboarding Journey
            </h1>
            <div className="flex items-center gap-3 max-w-md">
              <div className="flex-1 bg-canvas border border-border/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-primary shrink-0">
                {overallProgress}% Complete
              </span>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex bg-canvas border border-border rounded-xl p-1 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setView("timeline")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === "timeline"
                  ? "bg-surface text-primary shadow-xs font-semibold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <GitBranch size={14} /> Timeline
            </button>
            <button
              onClick={() => setView("checklist")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === "checklist"
                  ? "bg-surface text-primary shadow-xs font-semibold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <LayoutList size={14} /> Checklist
            </button>
          </div>
        </div>

        {/* View Mode Content */}
        {view === "timeline" ? (
          <div className="space-y-8">
            {journey.phases.map((phase) => (
              <div key={phase.id} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-bold text-ink tracking-tight">
                    {phase.name}
                  </h2>
                  <span className="text-xs text-ink-muted bg-canvas border border-border/60 px-2 py-0.5 rounded-md font-medium">
                    {phase.tasks.length} {phase.tasks.length === 1 ? "task" : "tasks"}
                  </span>
                </div>

                <div className="space-y-3 relative pl-1">
                  {phase.tasks.map((task, i) => (
                    <div
                      key={task.id}
                      className="flex items-stretch gap-3 sm:gap-4 relative group"
                    >
                      {/* Vertical Timeline Line */}
                      {i < phase.tasks.length - 1 && (
                        <div className="absolute left-[1.125rem] top-10 w-0.5 h-[calc(100%-0.5rem)] bg-border group-hover:bg-primary/30 transition-colors z-0" />
                      )}

                      {/* Hex Node Interactive Icon */}
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="relative z-10 shrink-0 self-start pt-1 focus:outline-none"
                      >
                        <HexNode status={task.status} />
                      </button>

                      {/* Task Card */}
                      <button
                        onClick={() => setSelectedTask(task)}
                        className={`flex-1 text-left bg-surface border border-border rounded-xl p-3.5 sm:p-4 hover:border-primary/50 hover:shadow-xs transition-all flex items-center justify-between gap-4 group/card ${
                          task.status === "locked" ? "opacity-75 bg-canvas/30" : ""
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <p
                            className={`text-sm font-medium transition-colors ${
                              task.status === "locked"
                                ? "text-ink-muted"
                                : "text-ink group-hover/card:text-primary"
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <StatusPill status={task.status} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-ink-muted/60 shrink-0">
                          {task.status === "locked" && <Lock size={14} />}
                          <ChevronRight
                            size={16}
                            className="group-hover/card:text-primary group-hover/card:translate-x-0.5 transition-all"
                          />
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Checklist View */
          <div className="bg-surface border border-border rounded-2xl divide-y divide-border/60 shadow-xs overflow-hidden">
            {journey.phases.flatMap((phase) =>
              phase.tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-canvas/50 transition-colors group ${
                    task.status === "locked" ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <HexNode status={task.status} size={28} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {phase.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusPill status={task.status} />
                    <ChevronRight
                      size={16}
                      className="text-ink-muted/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Detail Drawer Modal */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </AppShell>
  );
}

/* Helper Status Pill */
function StatusPill({ status }: { status: string }) {
  const formatted = status.replace("_", " ");

  const styles: Record<string, string> = {
    completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    in_progress: "bg-primary/10 text-primary border-primary/20",
    pending_review: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    locked: "bg-canvas text-ink-muted border-border/60",
  };

  const badgeStyle = styles[status] ?? styles.locked;

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-medium capitalize ${badgeStyle}`}
    >
      {formatted}
    </span>
  );
}