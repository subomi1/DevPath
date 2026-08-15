import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Building2,
  FileText,
  BookOpen,
  Megaphone,
  Settings,
  Loader2,
  AlertCircle,
  Users,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react'
import { AppShell } from '../../layouts/AppShell'
import { useAdminDashboard } from '../../hooks/useAdminDashboard'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  hr: 'HR',
  manager: 'Manager',
  developer: 'Developer',
}

const QUICK_LINKS = [
  {
    to: '/admin/users',
    label: 'Users & Roles',
    description: 'Manage accounts & permissions',
    icon: ShieldCheck,
  },
  {
    to: '/admin/departments',
    label: 'Departments & Teams',
    description: 'Org structure & team rosters',
    icon: Building2,
  },
  {
    to: '/admin/templates',
    label: 'Onboarding Templates',
    description: 'Standardized role workflows',
    icon: FileText,
  },
  {
    to: '/admin/knowledge-base',
    label: 'Knowledge Base',
    description: 'Documentation & resources',
    icon: BookOpen,
  },
  {
    to: '/admin/announcements',
    label: 'Announcements',
    description: 'Company-wide updates',
    icon: Megaphone,
  },
  {
    to: '/admin/settings',
    label: 'System Settings',
    description: 'Global app configurations',
    icon: Settings,
  },
]

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard()

  if (isLoading) {
    return (
      <AppShell title="Dashboard">
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
          <div className="flex flex-col items-center space-y-3 text-ink-muted">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-xs font-medium">Loading system metrics...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error || !data) {
    return (
      <AppShell title="Dashboard">
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
          <div className="bg-danger/10 border border-danger/30 rounded-2xl p-6 sm:p-8 max-w-md text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-danger/20 text-danger rounded-xl flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <h2 className="font-display font-bold text-ink text-base">
              Failed to load dashboard
            </h2>
            <p className="text-xs text-ink-muted">
              We couldn't retrieve the administrative metrics. Please try refreshing the page.
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  const roleEntries = Object.entries(data.users_by_role)
  const maxCount = Math.max(...roleEntries.map(([, count]) => count), 1)

  return (
    <AppShell title="Dashboard">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto w-full min-h-[calc(100vh-4rem)] space-y-6">
        {/* Header */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink flex items-center gap-2.5">
              <LayoutDashboard className="text-primary" size={24} />
              System Overview
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted">
              Central control panel for user access, organizational structure, and system settings.
            </p>
          </div>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Users by Role Panel */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3.5">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  <h2 className="font-display font-semibold text-ink text-base">
                    Users by Role
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-canvas text-ink-muted border border-border">
                  {data.total_users} {data.total_users === 1 ? 'user' : 'total users'}
                </span>
              </div>

              <div className="space-y-4 pt-1">
                {roleEntries.map(([role, count]) => {
                  const percentage = Math.round((count / maxCount) * 100)
                  return (
                    <div key={role} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-ink font-semibold">
                          {ROLE_LABELS[role] ?? role}
                        </span>
                        <span className="text-ink-muted">
                          {count} {count === 1 ? 'user' : 'users'}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-canvas border border-border/60 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-canvas/60 border border-border/80 rounded-xl p-3.5 text-xs text-ink-muted flex items-center justify-between">
              <span>Active Organization Roles</span>
              <span className="font-bold text-ink">{roleEntries.length} Roles</span>
            </div>
          </div>

          {/* Quick Management Links Panel */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-border/80 pb-3.5">
              <h2 className="font-display font-semibold text-ink text-base">
                Quick Actions & Navigation
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Jump directly to essential system management tools.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUICK_LINKS.map(({ to, label, description, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group relative border border-border hover:border-primary/50 bg-surface hover:bg-canvas/50 rounded-xl p-3.5 sm:p-4 flex items-start gap-3 transition-all shadow-2xs hover:shadow-xs hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs sm:text-sm font-semibold text-ink truncate group-hover:text-primary transition-colors">
                        {label}
                      </p>
                      <ArrowRight
                        size={14}
                        className="text-ink-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0"
                      />
                    </div>
                    <p className="text-[11px] text-ink-muted truncate">
                      {description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}