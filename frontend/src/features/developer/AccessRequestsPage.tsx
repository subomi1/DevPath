import { useState, useEffect, type FormEvent } from "react";
import {
  Plus,
  X,
  Check,
  AlertCircle,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import {
  useAccessRequests,
  useCreateAccessRequest,
} from "../../hooks/useAccessRequests";
import type { AccessRequestStatus } from "../../types/accessRequest";

const RESOURCE_OPTIONS = [
  { value: "github", label: "GitHub" },
  { value: "azure_devops", label: "Azure DevOps" },
  { value: "sql_server", label: "SQL Server" },
  { value: "vpn", label: "VPN" },
  { value: "internal_apis", label: "Internal APIs" },
  { value: "test_environment", label: "Test Environment" },
  { value: "other", label: "Other" },
];

const STEPPER_STAGES: { key: AccessRequestStatus; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Review" },
  { key: "approved", label: "Approved" },
  { key: "completed", label: "Provisioned" },
];

function StatusStepper({
  status,
  log,
}: {
  status: AccessRequestStatus;
  log: { status: string }[];
}) {
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/20">
        <AlertCircle size={13} />
        Rejected
      </span>
    );
  }

  const reachedStatuses = new Set(log.map((l) => l.status));
  const currentIndex = STEPPER_STAGES.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {STEPPER_STAGES.map((stage, i) => {
        const isReached = reachedStatuses.has(stage.key) || i <= currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={stage.key} className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isCurrent
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : isReached
                    ? "bg-primary text-white"
                    : "bg-canvas border border-border text-ink-muted/50"
                }`}
              >
                {isReached && !isCurrent ? (
                  <Check size={11} strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`hidden md:inline text-xs font-medium ${
                  isCurrent
                    ? "text-primary font-semibold"
                    : isReached
                    ? "text-ink"
                    : "text-ink-muted/60"
                }`}
              >
                {stage.label}
              </span>
            </div>

            {i < STEPPER_STAGES.length - 1 && (
              <div
                className={`w-3 sm:w-6 h-0.5 rounded-full transition-colors ${
                  i < currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AccessRequestsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: requests, isLoading } = useAccessRequests();
  const createRequest = useCreateAccessRequest();

  const [resource, setResource] = useState("github");
  const [otherLabel, setOtherLabel] = useState("");
  const [justification, setJustification] = useState("");

  // Handle Escape Key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createRequest.mutateAsync({
      resource,
      resource_other_label: resource === "other" ? otherLabel : undefined,
      justification,
    });
    setJustification("");
    setOtherLabel("");
    setDrawerOpen(false);
  };

  return (
    <AppShell title="Access Requests">
      <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">
              Access Requests
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Manage and track your system permissions and provisioning.
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 shrink-0 transition-all duration-150 shadow-xs active:scale-[0.98]"
          >
            <Plus size={16} /> Request Access
          </button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-xs">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-canvas animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : requests?.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-display font-semibold text-ink text-base">
              No access requests yet
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
              Need access to repos, databases, or internal APIs? Submit a request to get started.
            </p>
            <button
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline pt-2"
            >
              <Plus size={14} /> Request initial access
            </button>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl divide-y divide-border/60 shadow-xs overflow-hidden">
            {requests?.map((req) => (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-canvas/40 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 bg-canvas border border-border/80 rounded-xl text-ink-muted shrink-0 mt-0.5 sm:mt-0">
                    <KeyRound size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      {req.resource_display}
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Requested on {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  <StatusStepper status={req.status} log={req.status_log} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-40 animate-in fade-in duration-200"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed top-0 right-0 h-screen w-full max-w-lg bg-surface z-50 flex flex-col shadow-2xl border-l border-border animate-in slide-in-from-right duration-250 ease-out"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-access-title"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2
                id="drawer-access-title"
                className="font-display font-semibold text-ink text-base"
              >
                Request Access
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-ink-muted hover:text-ink p-1.5 rounded-lg hover:bg-canvas transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                  Resource / Tool
                </label>
                <select
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                  className="w-full bg-canvas border border-border rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {RESOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {resource === "other" && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                    Specify Resource Name
                  </label>
                  <input
                    type="text"
                    value={otherLabel}
                    onChange={(e) => setOtherLabel(e.target.value)}
                    placeholder="e.g. Figma Workspace, Metabase"
                    required
                    className="w-full bg-canvas border border-border rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                  Business Justification
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain why you need access to this resource..."
                  required
                  rows={4}
                  className="w-full bg-canvas border border-border rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="mt-auto pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={createRequest.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl py-3 px-4 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs active:scale-[0.99]"
                >
                  {createRequest.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AppShell>
  );
}