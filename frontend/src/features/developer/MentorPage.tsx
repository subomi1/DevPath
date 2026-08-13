import { useState, type FormEvent } from 'react'
import { Mail, CalendarPlus, X } from 'lucide-react'
import { AppShell } from '../../layouts/AppShell'
import { useMyMentorship, useRequestMeeting } from '../../hooks/useMentorship'

export default function MentorPage() {
  const { data, isLoading } = useMyMentorship()
  const requestMeeting = useRequestMeeting()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [note, setNote] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await requestMeeting.mutateAsync(note)
    setNote('')
    setDrawerOpen(false)
  }

  if (isLoading) {
    return (
      <AppShell title="My Mentor">
        <div className="p-6 text-sm text-ink-muted">Loading...</div>
      </AppShell>
    )
  }

  if (!data?.mentor.full_name) {
    return (
      <AppShell title="My Mentor">
        <div className="p-6 text-sm text-ink-muted">You don't have a mentor assigned yet.</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="My Mentor">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto flex flex-col gap-6">
        {/* Mentor profile card */}
        <div className="bg-surface border border-border rounded-lg p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center text-white text-lg font-semibold shrink-0">
            {data.mentor.full_name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-lg font-semibold text-ink">{data.mentor.full_name}</h1>
            {data.mentor.email && (
              <p className="flex items-center gap-1.5 text-sm text-ink-muted mt-1">
                <Mail size={14} /> {data.mentor.email}
              </p>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 bg-primary text-white text-sm font-medium rounded-lg px-4 py-2 shrink-0"
          >
            <CalendarPlus size={16} /> Request a meeting
          </button>
        </div>

        {/* Goals */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <h2 className="font-display font-semibold text-ink mb-3">Goals</h2>
          {data.goals.length === 0 ? (
            <p className="text-sm text-ink-muted">No goals set yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {data.goals.map((goal) => (
                <li key={goal.id} className="text-sm text-ink border-l-2 border-primary pl-3">
                  {goal.content}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Meetings */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <h2 className="font-display font-semibold text-ink mb-3">Meetings</h2>
          {data.meetings.length === 0 ? (
            <p className="text-sm text-ink-muted">No meetings yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {data.meetings.map((m) => (
                <li key={m.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm text-ink capitalize">{m.status}</p>
                    {m.scheduled_at && (
                      <p className="text-xs text-ink-muted">{new Date(m.scheduled_at).toLocaleString()}</p>
                    )}
                    {!m.scheduled_at && m.preferred_time_note && (
                      <p className="text-xs text-ink-muted">{m.preferred_time_note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-ink/40 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed top-0 right-0 h-screen w-full max-w-lg bg-surface z-50 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-ink">Request a meeting</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-ink-muted">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Preferred time</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. Any time Tuesday or Wednesday afternoon works well"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={requestMeeting.isPending}
                className="bg-primary text-white text-sm font-medium rounded-lg py-2.5 disabled:opacity-60"
              >
                {requestMeeting.isPending ? 'Sending...' : 'Send request'}
              </button>
            </form>
          </div>
        </>
      )}
    </AppShell>
  )
}