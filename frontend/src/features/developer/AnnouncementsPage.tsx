import { useState } from 'react'
import { AppShell } from '../../layouts/AppShell'
import { useAnnouncements, useMarkAnnouncementRead } from '../../hooks/useAnnouncements'
import type { AnnouncementCategory } from '../../types/announcement'

const CATEGORIES: { value: AnnouncementCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'office', label: 'Office' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'training', label: 'Training' },
]

export default function AnnouncementsPage() {
  const [filter, setFilter] = useState<AnnouncementCategory | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: announcements, isLoading } = useAnnouncements(filter === 'all' ? undefined : filter)
  const markRead = useMarkAnnouncementRead()

  const handleToggle = async (id: string, isRead: boolean) => {
    setExpandedId(expandedId === id ? null : id)
    if (!isRead) {
      await markRead(id)
    }
  }

  return (
    <AppShell title="Announcements">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <h1 className="font-display text-xl font-semibold text-ink mb-4">Announcements</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border ${
                filter === cat.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-ink-muted border-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-sm text-ink-muted">Loading...</p>}
        {!isLoading && announcements?.length === 0 && (
          <p className="text-sm text-ink-muted">No announcements yet.</p>
        )}

        <div className="flex flex-col gap-3">
          {announcements?.map((a) => {
            const isExpanded = expandedId === a.id
            return (
              <div
                key={a.id}
                className={`bg-surface border border-border rounded-lg overflow-hidden ${
                  !a.is_read ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <button
                  onClick={() => handleToggle(a.id, a.is_read)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className={`text-sm ${!a.is_read ? 'font-semibold text-ink' : 'font-medium text-ink'}`}>
                      {a.title}
                    </p>
                    <p className="text-xs text-ink-muted mt-1">
                      {a.author_name} · {new Date(a.published_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-ink-muted capitalize shrink-0">{a.category}</span>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 text-sm text-ink whitespace-pre-wrap border-t border-border pt-4">
                    {a.body}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}