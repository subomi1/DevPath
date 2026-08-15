import { useState, useEffect, type FormEvent } from "react";
import {
  Mail,
  CalendarPlus,
  X,
  Target,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import {
  useMyMentorship,
  useRequestMeeting,
} from "../../hooks/useMentorship";

export default function MentorPage() {
  const { data, isLoading } = useMyMentorship();
  const requestMeeting = useRequestMeeting();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [note, setNote] = useState("");

  // Handle Escape key listener for modal closure
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await requestMeeting.mutateAsync(note);
    setNote("");
    setDrawerOpen(false);
  };

  if (isLoading) {
    return (
      <AppShell title="My Mentor">
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 text-ink-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading mentor profile...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!data?.mentor?.full_name) {
    return (
      <AppShell title="My Mentor">
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="bg-surface border border-border rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 bg-canvas border border-border rounded-2xl flex items-center justify-center mx-auto text-ink-muted">
              <UserCheck size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="font-display font-semibold text-ink text-lg">
                No Mentor Assigned
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto">
                You don't have a dedicated mentor assigned to your onboarding path yet. Reach out to your HR lead or team manager for assistance.
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="My Mentor">
      <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Mentor Profile Hero Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary text-xl font-bold shrink-0 shadow-xs">
              {data.mentor.full_name.charAt(0)}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-ink truncate tracking-tight">
                  {data.mentor.full_name}
                </h1>
                <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0">
                  Mentor
                </span>
              </div>
              {data.mentor.email && (
                <a
                  href={`mailto:${data.mentor.email}`}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-ink-muted hover:text-primary transition-colors truncate"
                >
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate">{data.mentor.email}</span>
                </a>
              )}
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 shrink-0 transition-all shadow-xs active:scale-[0.98]"
          >
            <CalendarPlus size={16} /> Request Meeting
          </button>
        </div>

        {/* Goals Section */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-primary" />
              <h2 className="font-display font-semibold text-ink text-base">
                Mentorship Goals
              </h2>
            </div>
            <span className="text-xs text-ink-muted font-medium bg-canvas border border-border/80 px-2.5 py-0.5 rounded-md">
              {data.goals?.length || 0} active
            </span>
          </div>

          {!data.goals || data.goals.length === 0 ? (
            <p className="text-xs sm:text-sm text-ink-muted italic py-2">
              No goals set yet. Discuss target milestones during your next 1-on-1 meeting.
            </p>
          ) : (
            <div className="grid gap-3">
              {data.goals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-canvas/50 border border-border/80 rounded-xl p-3.5 flex items-start gap-3 hover:border-primary/40 transition-colors"
                >
                  <CheckCircle2
                    size={16}
                    className="text-primary shrink-0 mt-0.5"
                  />
                  <p className="text-xs sm:text-sm text-ink leading-relaxed">
                    {goal.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meetings History Section */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <h2 className="font-display font-semibold text-ink text-base">
                Meetings & Syncs
              </h2>
            </div>
          </div>

          {!data.meetings || data.meetings.length === 0 ? (
            <p className="text-xs sm:text-sm text-ink-muted italic py-2">
              No scheduled meetings yet. Click "Request Meeting" above to get started.
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {data.meetings.map((m) => (
                <div
                  key={m.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MeetingStatusPill status={m.status} />
                    </div>

                    {m.scheduled_at ? (
                      <p className="text-xs text-ink-muted flex items-center gap-1.5 pt-0.5">
                        <Clock size={13} />
                        {new Date(m.scheduled_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    ) : m.preferred_time_note ? (
                      <p className="text-xs text-ink-muted truncate pt-0.5">
                        Note: "{m.preferred_time_note}"
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meeting Request Drawer Modal */}
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
            aria-labelledby="drawer-meeting-title"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2
                id="drawer-meeting-title"
                className="font-display font-semibold text-ink text-base"
              >
                Request a Meeting
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-ink-muted hover:text-ink p-1.5 rounded-lg hover:bg-canvas transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Request Form */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                  Preferred Schedule / Topic Notes
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="e.g. Free Tuesday or Thursday afternoons. Want to review onboarding task #3 and career goals."
                  className="w-full bg-canvas border border-border rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="mt-auto pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={requestMeeting.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl py-3 px-4 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs active:scale-[0.99]"
                >
                  {requestMeeting.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    "Send Request"
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

/* Helper Status Badge component */
function MeetingStatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    scheduled: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    requested: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    completed: "bg-primary/10 text-primary border-primary/20",
    cancelled: "bg-danger/10 text-danger border-danger/20",
  };

  const badgeStyle = styles[status] ?? "bg-canvas text-ink-muted border-border";

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-md border text-[11px] font-semibold capitalize ${badgeStyle}`}
    >
      {status}
    </span>
  );
}