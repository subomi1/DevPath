import { useState } from "react";
import {
  GraduationCap,
  ChevronDown,
  Calendar,
  StickyNote,
  Target,
  Sparkles,
  Loader2,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useMyMentees } from "../../hooks/useMentorship";
import type { MentorMeeting, MentorNote } from "../../types/mentorship";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const MEETING_STATUS_CONFIG: Record<string, { label: string; style: string }> =
  {
    requested: {
      label: "Requested",
      style: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    scheduled: {
      label: "Scheduled",
      style: "bg-primary/10 text-primary border-primary/20",
    },
    completed: {
      label: "Completed",
      style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    cancelled: {
      label: "Cancelled",
      style: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    },
  };

function MeetingStatusPill({ status }: { status: string }) {
  const config = MEETING_STATUS_CONFIG[status] ?? {
    label: status,
    style: "bg-canvas text-ink-muted border-border",
  };
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-lg border capitalize ${config.style}`}
    >
      {config.label}
    </span>
  );
}

function MenteeCard({
  mentee,
  meetings,
  notes,
}: {
  mentee: { id: string; full_name: string; email: string };
  meetings: MentorMeeting[];
  notes: MentorNote[];
}) {
  const [expanded, setExpanded] = useState(false);
  const upcomingCount = meetings.filter(
    (m) => m.status === "requested" || m.status === "scheduled",
  ).length;

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-xs overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center text-sm font-bold shrink-0">
            {mentee.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-ink truncate">
              {mentee.full_name}
            </p>
            <p className="text-xs text-ink-muted truncate">{mentee.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {upcomingCount > 0 && (
            <span className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg px-2 py-1">
              {upcomingCount} upcoming
            </span>
          )}
          <ChevronDown
            size={18}
            className={`text-ink-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/80 px-4 sm:px-5 py-4 space-y-5 animate-in fade-in duration-150">
          {/* Meetings */}
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2.5">
              <Calendar size={13} /> Meetings
            </h4>
            {meetings.length === 0 ? (
              <p className="text-xs text-ink-muted">No meetings yet.</p>
            ) : (
              <div className="space-y-2">
                {meetings.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 bg-canvas border border-border/60 rounded-xl px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-ink truncate">
                        {m.scheduled_at
                          ? new Date(m.scheduled_at).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "Not yet scheduled"}
                      </p>
                      {m.preferred_time_note && (
                        <p className="text-[11px] text-ink-muted truncate mt-0.5">
                          {m.preferred_time_note}
                        </p>
                      )}
                    </div>
                    <MeetingStatusPill status={m.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2.5">
              <StickyNote size={13} /> Notes
            </h4>
            {notes.length === 0 ? (
              <p className="text-xs text-ink-muted">No notes yet.</p>
            ) : (
              <div className="space-y-2">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="bg-canvas border border-border/60 rounded-xl px-3.5 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {n.is_goal ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                          <Target size={12} /> Goal — visible to mentee
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-ink-muted">
                          Private note
                        </span>
                      )}
                      <span className="text-[11px] text-ink-muted shrink-0">
                        {new Date(n.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-ink">{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MentorMentees() {
  const { data, isLoading } = useMyMentees();
  const { user } = useAuth();

  if (!user?.is_mentor) {
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  }

  return (
    <AppShell title="My Mentees">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full min-h-[calc(100vh-4rem)] space-y-6">
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink flex items-center gap-2.5">
            <GraduationCap className="text-primary" size={24} />
            My Mentees
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Everyone you're currently mentoring, their meetings, and your notes.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-muted space-y-3">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-xs font-medium">Loading your mentees...</p>
          </div>
        ) : !data || data.mentees.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl flex flex-col items-center justify-center py-16 px-4 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-canvas border border-border rounded-2xl flex items-center justify-center text-ink-muted">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink">No mentees yet</h3>
              <p className="text-xs text-ink-muted max-w-sm">
                You'll see them here once someone is assigned to you as their
                mentor.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {data.mentees.map((mentee) => (
              <MenteeCard
                key={mentee.id}
                mentee={mentee}
                meetings={data.meetings.filter(
                  (m) => m.developer === mentee.id,
                )}
                notes={data.notes.filter((n) => n.developer === mentee.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
