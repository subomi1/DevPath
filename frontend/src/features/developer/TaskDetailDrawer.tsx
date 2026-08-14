import { useEffect } from "react";
import {
  X,
  Clock,
  Calendar,
  Tag,
  Flag,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Lock,
  Loader2,
} from "lucide-react";
import type { JourneyTask } from "../../types/journey";
import { useCompleteTask, useSubmitTask } from "../../hooks/useJourney";

export function TaskDetailDrawer({
  task,
  onClose,
}: {
  task: JourneyTask;
  onClose: () => void;
}) {
  const completeTask = useCompleteTask();
  const submitTask = useSubmitTask();

  const isActionable =
    task.status === "current" ||
    task.status === "upcoming" ||
    task.status === "sent_back";

  const isAwaitingVerification =
    task.status === "completed" &&
    task.verification_type === "manager_verified";

  const isPending = completeTask.isPending || submitTask.isPending;

  // Handle Escape Key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleAction = async () => {
    try {
      if (task.verification_type === "self") {
        await completeTask.mutateAsync(task.id);
      } else if (task.verification_type === "manager_verified") {
        await submitTask.mutateAsync(task.id);
      }
      onClose();
    } catch (err) {
      // Error handling managed by mutation hook or toast feedback
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className="fixed top-0 right-0 h-screen w-full max-w-lg bg-surface z-50 flex flex-col shadow-2xl border-l border-border animate-in slide-in-from-right duration-250 ease-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2
            id="drawer-title"
            className="font-display font-semibold text-ink text-base"
          >
            Task Details
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink p-1.5 rounded-lg hover:bg-canvas transition-colors"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Task Title & Description */}
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-ink tracking-tight leading-snug">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-ink-muted leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="bg-canvas/50 border border-border/80 rounded-2xl p-4 grid grid-cols-2 gap-4">
            {task.category && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={13} /> Category
                </span>
                <p className="text-xs font-medium text-ink truncate">
                  {task.category}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                <Flag size={13} /> Priority
              </span>
              <p className="text-xs font-medium text-ink capitalize">
                {task.priority || "Normal"}
              </p>
            </div>

            {task.due_date && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={13} /> Due Date
                </span>
                <p className="text-xs font-medium text-ink">
                  {task.due_date}
                </p>
              </div>
            )}

            {task.estimated_minutes && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={13} /> Est. Time
                </span>
                <p className="text-xs font-medium text-ink">
                  {task.estimated_minutes} min
                </p>
              </div>
            )}
          </div>

          {/* Conditional Status Banners */}
          {task.status === "sent_back" && task.verification_note && (
            <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-danger font-semibold text-xs uppercase tracking-wider">
                <AlertCircle size={15} /> Sent Back
              </div>
              <p className="text-xs text-ink/90 leading-relaxed">
                {task.verification_note}
              </p>
            </div>
          )}

          {isAwaitingVerification && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3 text-primary">
              <Clock3 size={18} className="shrink-0" />
              <p className="text-xs sm:text-sm font-medium">
                Awaiting manager verification.
              </p>
            </div>
          )}

          {task.status === "verified" && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-600">
              <CheckCircle2 size={18} className="shrink-0" />
              <p className="text-xs sm:text-sm font-medium">
                Verified
                {task.verified_at
                  ? ` on ${new Date(task.verified_at).toLocaleDateString()}`
                  : ""}
                .
              </p>
            </div>
          )}

          {task.status === "locked" && (
            <div className="bg-canvas border border-border/80 rounded-2xl p-4 flex items-center gap-3 text-ink-muted">
              <Lock size={18} className="shrink-0" />
              <p className="text-xs sm:text-sm font-medium">
                Complete earlier tasks to unlock this one.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isActionable && (
          <div className="p-4 sm:p-6 border-t border-border bg-surface shrink-0">
            <button
              onClick={handleAction}
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs active:scale-[0.99]"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : task.verification_type === "self" ? (
                "Mark Complete"
              ) : task.status === "sent_back" ? (
                "Resubmit for Verification"
              ) : (
                "Submit for Verification"
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}