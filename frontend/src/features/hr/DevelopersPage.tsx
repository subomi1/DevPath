import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, Users, Loader2, Sparkles } from 'lucide-react'
import { AppShell } from '../../layouts/AppShell'
import { useDevelopers } from '../../hooks/useDevelopers'

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  active: {
    label: 'Active',
    style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  pending_activation: {
    label: 'Pending Activation',
    style: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  pending_invitation: {
    label: 'Pending Invitation',
    style: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  suspended: {
    label: 'Suspended',
    style: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  },
  archived: {
    label: 'Archived',
    style: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  },
}

function StatusPill({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.replace('_', ' '),
    style: 'bg-canvas text-ink-muted border-border',
  }

  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg border capitalize shadow-2xs ${config.style}`}
    >
      {config.label}
    </span>
  )
}

export default function DevelopersPage() {
  const [search, setSearch] = useState('')
  const { data: developers, isLoading } = useDevelopers(search || undefined)

  return (
    <AppShell title="Developers">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full min-h-[calc(100vh-4rem)] space-y-6">
        {/* Page Header */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink flex items-center gap-2.5">
              <Users className="text-primary" size={24} />
              Developers Directory
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted">
              Manage developer profiles, team assignments, and onboarding statuses.
            </p>
          </div>

          <Link
            to="/hr/invite"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <UserPlus size={16} />
            Invite Developer
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/80 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search developers by name or email..."
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink-muted/60 shadow-xs"
            />
          </div>

          {developers && (
            <span className="text-xs font-semibold text-ink-muted self-end sm:self-center">
              Showing {developers.length} developer{developers.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {/* Table Container */}
        <div className="bg-surface border border-border rounded-2xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-ink-muted space-y-3">
              <Loader2 size={24} className="animate-spin text-primary" />
              <p className="text-xs font-medium">Loading developers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-canvas/60 border-b border-border/80 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                    <th className="px-5 py-3.5">Developer</th>
                    <th className="px-5 py-3.5">Job Role</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Start Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {developers?.map((dev) => (
                    <tr
                      key={dev.id}
                      className="hover:bg-canvas/40 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            {dev.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-ink truncate">
                              {dev.full_name}
                            </p>
                            <p className="text-xs text-ink-muted truncate">
                              {dev.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-ink/80">
                        {dev.job_role || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={dev.status} />
                      </td>
                      <td className="px-5 py-4 font-medium text-ink-muted">
                        {dev.start_date || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {developers?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
                  <div className="w-12 h-12 bg-canvas border border-border rounded-2xl flex items-center justify-center text-ink-muted shadow-2xs">
                    <Sparkles size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-ink">
                      No developers found
                    </h3>
                    <p className="text-xs text-ink-muted max-w-sm">
                      {search
                        ? `No results matching "${search}". Try adjusting your search query.`
                        : 'Get started by sending an invitation to your first developer.'}
                    </p>
                  </div>
                  {!search && (
                    <Link
                      to="/hr/invite"
                      className="inline-flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer mt-2"
                    >
                      <UserPlus size={14} />
                      Invite First Developer
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}