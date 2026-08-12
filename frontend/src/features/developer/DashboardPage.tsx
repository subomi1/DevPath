import { useDeveloperDashboard } from '../../hooks/useDashboard'
import { useAuth } from '../../hooks/useAuth'
import { CheckSquare, Calendar, KeyRound, MessageSquare, CalendarPlus } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, error } = useDeveloperDashboard()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-ink-muted">Loading...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-danger">Something went wrong loading your dashboard.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas p-6">
      {/* Hero row */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Welcome back, {user?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-ink-muted text-sm mt-1">
            {data.overall_progress === 0 ? "Let's get started" : `${data.overall_progress}% complete`}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Overall Progress</p>
          <div
            className="w-20 h-20 flex items-center justify-center border-4 border-primary rounded-full"
          >
            <span className="font-display text-xl font-semibold text-primary">
              {data.overall_progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={<CheckSquare size={18} />} label="Today's Tasks" value={data.today_tasks_count} />
        <StatCard icon={<Calendar size={18} />} label="Upcoming Events" value={0} />
        <StatCard icon={<KeyRound size={18} />} label="Open Access Requests" value={data.open_access_requests_count} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="col-span-2 bg-surface border border-border rounded-lg p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Today's Tasks</h2>
          {data.today_tasks.length === 0 ? (
            <p className="text-sm text-ink-muted">No tasks due today.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {data.today_tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm text-ink">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-muted">
                    <PriorityDot priority={task.priority} />
                    <span>{task.estimated_minutes}m</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-lg p-5">
            <h2 className="font-display font-semibold text-ink mb-3">Assigned Mentor</h2>
            {data.mentor.full_name ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {data.mentor.full_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{data.mentor.full_name}</p>
                  <div className="flex gap-2 mt-1">
                    <button className="flex items-center gap-1 text-xs border border-border rounded px-2 py-1 text-ink">
                      <MessageSquare size={12} /> Message
                    </button>
                    <button className="flex items-center gap-1 text-xs bg-primary text-white rounded px-2 py-1">
                      <CalendarPlus size={12} /> Schedule
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">No mentor assigned yet.</p>
            )}
          </div>

          <div className="bg-surface border border-border rounded-lg p-5">
            <h2 className="font-display font-semibold text-ink mb-3">Recent Announcements</h2>
            {data.recent_announcements.length === 0 ? (
              <p className="text-sm text-ink-muted">No announcements yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.recent_announcements.map((a) => (
                  <li key={a.id} className="flex items-start gap-2">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${a.is_read ? 'bg-border' : 'bg-primary'}`} />
                    <span className="text-sm text-ink">{a.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="text-xl font-semibold text-ink mt-1">{value}</p>
      </div>
      <div className="text-ink-muted">{icon}</div>
    </div>
  )
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: 'bg-danger',
    medium: 'bg-primary',
    low: 'bg-ink-muted',
  }
  return (
    <span className="flex items-center gap-1">
      <span className={`w-1.5 h-1.5 rounded-full ${colors[priority] ?? 'bg-ink-muted'}`} />
      <span className="capitalize">{priority}</span>
    </span>
  )
}