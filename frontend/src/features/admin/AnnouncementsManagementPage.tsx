import { useState, useMemo } from 'react'
import {
  Plus,
  X,
  Trash2,
  BarChart3,
  Edit3,
  Search,
  Megaphone,
  User,
  Calendar,
  Loader2,
  Users,
  CheckCircle2
} from 'lucide-react'
import { AppShell } from '../../layouts/AppShell'
import {
  useAnnouncements,
  useDeleteAnnouncement,
  useReadStats,
  useUpdateAnnouncement
} from '../../hooks/useAnnouncements'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../../api/client'
import type { AnnouncementCategory } from '../../types/announcement'

const CATEGORIES: { value: AnnouncementCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'office', label: 'Office' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'training', label: 'Training' },
]

type EditTarget = 'new' | { id: string; title: string; body: string; category: AnnouncementCategory }

// ---------------------------------------------------------------------------
// AnnouncementComposeForm
// ---------------------------------------------------------------------------
function AnnouncementComposeForm({
  editing,
  onSave,
  onClose,
  isSaving,
}: {
  editing: EditTarget
  onSave: (data: { title: string; body: string; category: AnnouncementCategory }) => void
  onClose: () => void
  isSaving: boolean
}) {
  const isNew = editing === 'new'
  const [title, setTitle] = useState(isNew ? '' : editing.title)
  const [body, setBody] = useState(isNew ? '' : editing.body)
  const [category, setCategory] = useState<AnnouncementCategory>(
    isNew ? 'engineering' : editing.category
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    onSave({ title, body, category })
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 h-screen w-full max-w-lg bg-surface z-50 flex flex-col shadow-2xl border-l border-border"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div>
            <h2 className="font-display font-semibold text-ink text-lg">
              {isNew ? 'New Announcement' : 'Edit Announcement'}
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              {isNew
                ? 'Create a new post to share across your organization.'
                : 'Update existing announcement details.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div>
              <label htmlFor="title-input" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                Title
              </label>
              <input
                id="title-input"
                type="text"
                placeholder="e.g. Scheduled System Maintenance"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label htmlFor="category-select" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                Category
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                className="w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="body-input" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                Announcement Body
              </label>
              <textarea
                id="body-input"
                placeholder="Write message details..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                required
                className="w-full bg-surface border border-border rounded-lg p-3.5 text-sm text-ink leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {isNew && (
              <div className="p-3 bg-canvas border border-border rounded-lg flex items-center gap-2.5 text-xs text-ink-muted">
                <Megaphone size={16} className="shrink-0 text-primary" />
                <span>This update will be broadcasted company-wide upon publishing.</span>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink bg-surface border border-border rounded-lg hover:bg-canvas transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim() || !body.trim()}
              className="px-5 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2 transition-all shadow-xs"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {isSaving ? 'Saving...' : isNew ? 'Publish Announcement' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// AnnouncementsManagementPage
// ---------------------------------------------------------------------------
export default function AnnouncementsManagementPage() {
  const [filter, setFilter] = useState<AnnouncementCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editing, setEditing] = useState<EditTarget | null>(null)
  const [statsId, setStatsId] = useState<string | null>(null)

  const { data: announcements, isLoading } = useAnnouncements(
    filter === 'all' ? undefined : filter
  )
  const deleteAnnouncement = useDeleteAnnouncement()
  const updateAnnouncement = useUpdateAnnouncement()
  const { data: stats, isLoading: statsLoading } = useReadStats(statsId)
  const queryClient = useQueryClient()

  const createAnnouncement = useMutation({
    mutationFn: async (data: { title: string; body: string; category: AnnouncementCategory }) => {
      await client.post('/announcements/', { ...data, audience_scope: 'all' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setEditing(null)
    },
  })

  const handleSave = (data: { title: string; body: string; category: AnnouncementCategory }) => {
    if (editing === 'new') {
      createAnnouncement.mutate(data)
    } else if (editing) {
      updateAnnouncement.mutate(
        { id: editing.id, data },
        { onSuccess: () => setEditing(null) }
      )
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This action cannot be undone.`)) {
      await deleteAnnouncement.mutateAsync(id)
    }
  }

  const filteredAnnouncements = useMemo(() => {
    return announcements?.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.body.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [announcements, searchQuery])

  const isSaving = createAnnouncement.isPending || updateAnnouncement.isPending

  return (
    <AppShell title="Announcements">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">
              Announcements
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              Broadcast company updates and monitor team engagement metrics.
            </p>
          </div>
          <button
            onClick={() => setEditing('new')}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-xs"
          >
            <Plus size={18} />
            <span>New Announcement</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === cat.value
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface text-ink-muted border border-border hover:bg-canvas hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-xl p-5 animate-pulse flex justify-between items-center"
              >
                <div className="space-y-2.5 w-2/3">
                  <div className="h-4 bg-border/60 rounded w-1/2" />
                  <div className="h-3 bg-border/40 rounded w-1/3" />
                </div>
                <div className="h-8 bg-border/40 rounded w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAnnouncements?.length === 0 && (
          <div className="bg-surface border border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-canvas border border-border rounded-full text-ink-muted">
              <Megaphone size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-ink">No announcements found</h3>
              <p className="text-sm text-ink-muted max-w-sm">
                {searchQuery || filter !== 'all'
                  ? 'Try clearing search filters to see more updates.'
                  : 'Get started by broadcasting your first announcement.'}
              </p>
            </div>
            {!announcements?.length && (
              <button
                onClick={() => setEditing('new')}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Plus size={16} /> Create Announcement
              </button>
            )}
          </div>
        )}

        {/* Announcements List */}
        {!isLoading && (filteredAnnouncements?.length ?? 0) > 0 && (
          <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden shadow-xs">
            {filteredAnnouncements?.map((a) => (
              <div
                key={a.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-canvas/50 transition-colors group"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 capitalize">
                      {a.category}
                    </span>
                    <h3 className="text-base font-medium text-ink truncate group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-ink-muted pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <User size={13} className="shrink-0" />
                      {a.author_name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="shrink-0" />
                      Published {new Date(a.published_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setEditing({ id: a.id, title: a.title, body: a.body, category: a.category })}
                    className="p-2 text-ink-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit Announcement"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => setStatsId(a.id)}
                    className="p-2 text-ink-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="View Read Stats"
                  >
                    <BarChart3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id, a.title)}
                    className="p-2 text-ink-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      {editing && (
        <AnnouncementComposeForm
          key={editing === 'new' ? 'new' : editing.id}
          editing={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
          isSaving={isSaving}
        />
      )}

      {/* Read Stats Modal */}
      {statsId && (
        <>
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-40"
            onClick={() => setStatsId(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-xl border border-border p-6 w-full max-w-sm shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" />
                  <h3 className="font-display font-semibold text-ink text-base">Read Statistics</h3>
                </div>
                <button
                  onClick={() => setStatsId(null)}
                  className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {statsLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-ink-muted text-sm">
                  <Loader2 size={20} className="animate-spin text-primary" />
                  <span>Calculating audience stats...</span>
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-display font-bold text-primary">
                      {stats.read_percentage}%
                    </span>
                    <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                      Completion Rate
                    </span>
                  </div>

                  <div className="h-2.5 bg-border/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${stats.read_percentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-3 bg-canvas border border-border rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                        <CheckCircle2 size={13} className="text-primary" />
                        <span>Read</span>
                      </div>
                      <p className="text-lg font-semibold text-ink">{stats.read_count}</p>
                    </div>

                    <div className="p-3 bg-canvas border border-border rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                        <Users size={13} />
                        <span>Audience</span>
                      </div>
                      <p className="text-lg font-semibold text-ink">{stats.total_audience}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-danger text-center py-4">
                  Failed to load engagement statistics.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  )
}