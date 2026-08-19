import { useEffect, useRef } from 'react'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type Notification,
} from '../../hooks/useNotifications'

function timeAgo(dateString: string) {
  const mins = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const CATEGORY_LABEL: Record<Notification['category'], string> = {
  task: 'Task',
  access_request: 'Access Request',
  announcement: 'Announcement',
  mentorship: 'Mentorship',
}

export function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { data: notifications, isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const hasUnread = notifications?.some((n) => !n.is_read)

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 max-h-[28rem] overflow-y-auto bg-surface border border-border rounded-xl shadow-lg z-40"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-surface">
        <h3 className="font-display text-sm font-semibold text-ink">Notifications</h3>
        {hasUnread && (
          <button
            onClick={() => markAllRead.mutate()}
            className="text-xs font-medium text-primary hover:text-primary-ink transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="px-4 py-8 text-center text-sm text-ink-muted">Loading...</div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-ink-muted">You're all caught up.</div>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li
              key={n.id}
              onClick={() => !n.is_read && markRead.mutate(n.id)}
              className={`px-4 py-3 border-b border-border last:border-b-0 cursor-pointer hover:bg-canvas transition-colors ${
                !n.is_read ? 'border-l-2 border-l-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-ink-muted uppercase tracking-wide">
                  {CATEGORY_LABEL[n.category]}
                </span>
                <span className="text-[11px] text-ink-muted shrink-0">{timeAgo(n.created_at)}</span>
              </div>
              <p className={`text-sm mt-0.5 ${!n.is_read ? 'font-semibold text-ink' : 'text-ink-muted'}`}>
                {n.title}
              </p>
              {n.body && <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{n.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}