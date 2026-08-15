import { useState } from "react";
import {
  ShieldAlert,
  KeyRound,
  Check,
  RotateCcw,
  XCircle,
  Clock,
  X,
  Loader2,
  CheckCircle2,
  User,
  Inbox,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import {
  usePendingTaskVerifications,
  useVerifyTask,
  useSendBackTask,
  useApproveAccessRequest,
  useRejectAccessRequest,
} from "../../hooks/useApprovals";
import { useAccessRequests } from "../../hooks/useAccessRequests";

export default function ApprovalsPage() {
  const { data: tasks, isLoading: tasksLoading } = usePendingTaskVerifications();
  const { data: accessRequests, isLoading: requestsLoading } = useAccessRequests();

  const verifyTask = useVerifyTask();
  const sendBackTask = useSendBackTask();
  const approveRequest = useApproveAccessRequest();
  const rejectRequest = useRejectAccessRequest();

  const [activeTab, setActiveTab] = useState<"all" | "tasks" | "access">("all");
  const [reasonFor, setReasonFor] = useState<{
    type: "task" | "access";
    id: string;
    title: string;
  } | null>(null);
  const [reason, setReason] = useState("");

  const pendingAccessRequests =
    accessRequests?.filter(
      (r) => r.status === "submitted" || r.status === "under_review"
    ) ?? [];

  const taskCount = tasks?.length ?? 0;
  const requestCount = pendingAccessRequests.length;
  const totalPending = taskCount + requestCount;
  const isLoading = tasksLoading || requestsLoading;

  const handleSendBack = async () => {
    if (!reasonFor || reasonFor.type !== "task") return;
    await sendBackTask.mutateAsync({ taskId: reasonFor.id, reason });
    setReasonFor(null);
    setReason("");
  };

  const handleReject = async () => {
    if (!reasonFor || reasonFor.type !== "access") return;
    await rejectRequest.mutateAsync({ requestId: reasonFor.id, reason });
    setReasonFor(null);
    setReason("");
  };

  const isSubmittingReason = sendBackTask.isPending || rejectRequest.isPending;

  return (
    <AppShell title="Approvals">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto w-full space-y-6 min-h-[calc(100vh-4rem)]">
        
        {/* Page Header */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">
                Pending Approvals
              </h1>
              {totalPending > 0 && (
                <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Clock size={12} /> {totalPending} pending
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-ink-muted">
              Review task completions and resource access requests submitted by your team members.
            </p>
          </div>

          {/* Segmented Tab Controls */}
          {totalPending > 0 && (
            <div className="flex items-center bg-canvas border border-border p-1 rounded-xl self-start sm:self-center shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "all"
                    ? "bg-surface text-ink shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                All ({totalPending})
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "tasks"
                    ? "bg-surface text-ink shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Tasks ({taskCount})
              </button>
              <button
                onClick={() => setActiveTab("access")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "access"
                    ? "bg-surface text-ink shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Access ({requestCount})
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-44 bg-surface border border-border rounded-2xl animate-pulse" />
            <div className="h-44 bg-surface border border-border rounded-2xl animate-pulse" />
          </div>
        ) : totalPending === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-xs space-y-3 my-auto flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-ink text-base">
                All caught up!
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
                There are currently no pending task verifications or access requests awaiting your review.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 flex-1">
            
            {/* Task Verifications Section */}
            {(activeTab === "all" || activeTab === "tasks") && taskCount > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <ShieldAlert size={18} className="text-primary" />
                  <h2 className="font-display font-semibold text-ink text-base">
                    Task Verifications
                  </h2>
                  <span className="text-xs text-ink-muted font-medium bg-surface border border-border px-2 py-0.5 rounded-md ml-auto">
                    {taskCount}
                  </span>
                </div>

                {/* Grid Layout for Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks?.map((task) => (
                    <div
                      key={task.id}
                      className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-border/80 transition-all"
                    >
                      <div className="space-y-3">
                        {/* Requester Header */}
                        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary text-xs font-bold shrink-0">
                              {task.developer_name?.charAt(0) ?? "D"}
                            </div>
                            <span className="text-xs font-semibold text-ink truncate">
                              {task.developer_name}
                            </span>
                          </div>
                          <span className="bg-canvas border border-border px-2 py-0.5 rounded-md text-[11px] font-semibold text-ink-muted capitalize shrink-0">
                            {task.category}
                          </span>
                        </div>

                        {/* Task Title Box */}
                        <div className="bg-canvas/60 border border-border/60 rounded-xl p-3">
                          <p className="text-xs sm:text-sm font-medium text-ink leading-relaxed break-words">
                            {task.title}
                          </p>
                        </div>
                      </div>

                      {/* Touch-Friendly Action Footer */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                        <button
                          onClick={() =>
                            setReasonFor({
                              type: "task",
                              id: task.id,
                              title: task.title,
                            })
                          }
                          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold border border-border bg-surface hover:bg-canvas text-ink py-2.5 rounded-xl transition-all shadow-xs"
                        >
                          <RotateCcw size={13} className="text-ink-muted" />
                          Send Back
                        </button>
                        <button
                          disabled={verifyTask.isPending}
                          onClick={() => verifyTask.mutate(task.id)}
                          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50"
                        >
                          {verifyTask.isPending ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Check size={13} />
                          )}
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Access Requests Section */}
            {(activeTab === "all" || activeTab === "access") && requestCount > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <KeyRound size={18} className="text-amber-500" />
                  <h2 className="font-display font-semibold text-ink text-base">
                    Access Requests
                  </h2>
                  <span className="text-xs text-ink-muted font-medium bg-surface border border-border px-2 py-0.5 rounded-md ml-auto">
                    {requestCount}
                  </span>
                </div>

                {/* Grid Layout for Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingAccessRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-border/80 transition-all"
                    >
                      <div className="space-y-3">
                        {/* Requester Header */}
                        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-600 text-xs font-bold shrink-0">
                              {req.developer_name?.charAt(0) ?? "D"}
                            </div>
                            <span className="text-xs font-semibold text-ink truncate">
                              {req.developer_name}
                            </span>
                          </div>
                          <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0">
                            Access Request
                          </span>
                        </div>

                        {/* Resource & Justification Box */}
                        <div className="bg-canvas/60 border border-border/60 rounded-xl p-3 space-y-2">
                          <p className="text-xs sm:text-sm font-semibold text-ink break-words">
                            {req.resource_display}
                          </p>
                          {req.justification && (
                            <p className="text-xs text-ink-muted italic break-words border-l-2 border-border pl-2.5 py-0.5">
                              "{req.justification}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Touch-Friendly Action Footer */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                        <button
                          onClick={() =>
                            setReasonFor({
                              type: "access",
                              id: req.id,
                              title: req.resource_display,
                            })
                          }
                          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold border border-danger/30 text-danger hover:bg-danger/10 py-2.5 rounded-xl transition-all shadow-xs"
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                        <button
                          disabled={approveRequest.isPending}
                          onClick={() => approveRequest.mutate(req.id)}
                          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50"
                        >
                          {approveRequest.isPending ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Check size={13} />
                          )}
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Reason Dialog Modal */}
      {reasonFor && (
        <>
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs z-40 animate-in fade-in duration-150"
            onClick={() => setReasonFor(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-lg space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display font-semibold text-ink text-base">
                  {reasonFor.type === "task"
                    ? "Send back task for revision"
                    : "Reject access request"}
                </h3>
                <button
                  onClick={() => setReasonFor(null)}
                  className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-ink-muted">Item:</p>
                <p className="text-xs font-semibold text-ink bg-canvas border border-border/80 p-2.5 rounded-xl break-words max-h-32 overflow-y-auto">
                  {reasonFor.title}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink block">
                  Provide Feedback / Reason:
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full bg-canvas border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-ink-muted"
                  placeholder="Explain what needs to be updated or why this request is denied..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => setReasonFor(null)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink px-3 py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmittingReason}
                  onClick={
                    reasonFor.type === "task" ? handleSendBack : handleReject
                  }
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-danger hover:bg-danger/90 text-white px-4 py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmittingReason && (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                  Confirm Action
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}