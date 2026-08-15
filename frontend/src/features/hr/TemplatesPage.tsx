import { useState } from 'react'
import { X, Layers, CheckSquare, Loader2, Sparkles, Briefcase, Info, ArrowRight } from 'lucide-react'
import { AppShell } from '../../layouts/AppShell'
import { useTemplates } from '../../hooks/useHRData'
import { useTemplateDetail } from '../../hooks/useTemplateDetail'

export default function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: detail, isLoading: isDetailLoading } = useTemplateDetail(selectedId)

  return (
    <AppShell title="Onboarding Templates">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)] space-y-6">
        {/* Page Header */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink flex items-center gap-2.5">
              <Layers className="text-primary" size={24} />
              Onboarding Templates
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted">
              Standardized, reusable onboarding journeys tailored for different organization roles.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-ink-muted space-y-3">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-xs font-medium">Loading templates...</p>
          </div>
        ) : (
          /* Grid of Templates */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {templates?.map((t) => {
              const isSelected = selectedId === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`group relative text-left bg-surface border rounded-2xl p-5 sm:p-6 transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <Briefcase size={12} />
                        {t.target_role || 'General'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-base text-ink group-hover:text-primary transition-colors">
                        {t.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-ink-muted line-clamp-2 mt-1.5 leading-relaxed">
                        {t.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-medium text-ink-muted">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Layers size={13} className="text-ink-muted/80" />
                        {t.phase_count} {t.phase_count === 1 ? 'phase' : 'phases'}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <CheckSquare size={13} className="text-ink-muted/80" />
                        {t.task_count} {t.task_count === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>

                    <span className="inline-flex items-center text-primary font-semibold group-hover:translate-x-1 transition-transform">
                      View
                      <ArrowRight size={13} className="ml-1" />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && templates?.length === 0 && (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 bg-canvas border border-border rounded-2xl flex items-center justify-center text-ink-muted shadow-2xs">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink">No templates available</h3>
              <p className="text-xs text-ink-muted max-w-sm">
                There are currently no onboarding templates created. Contact an administrator to create one.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Overlay & Panel */}
      {selectedId && (
        <>
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setSelectedId(null)}
          />
          <aside className="fixed top-0 right-0 h-screen w-full max-w-md sm:max-w-lg bg-surface z-50 flex flex-col shadow-2xl border-l border-border transition-transform">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-canvas/40">
              <div className="min-w-0 pr-4">
                <h2 className="font-display font-bold text-lg text-ink truncate">
                  {detail?.name ?? 'Loading template...'}
                </h2>
                {detail?.target_role && (
                  <p className="text-xs font-semibold text-primary mt-0.5">
                    Role: {detail.target_role}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="w-8 h-8 rounded-xl border border-border hover:bg-canvas flex items-center justify-center text-ink-muted hover:text-ink transition-colors cursor-pointer shrink-0"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {!detail && isDetailLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-ink-muted space-y-3">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <p className="text-xs font-medium">Fetching journey details...</p>
                </div>
              ) : (
                <>
                  {detail?.description && (
                    <p className="text-xs sm:text-sm text-ink-muted leading-relaxed bg-canvas/60 border border-border/80 rounded-xl p-3.5">
                      {detail.description}
                    </p>
                  )}

                  <div className="space-y-6">
                    {detail?.phases.map((phase, idx) => (
                      <div
                        key={phase.id}
                        className="bg-surface border border-border rounded-xl p-4 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            {phase.name}
                          </h3>
                          <span className="text-[11px] font-semibold text-ink-muted bg-canvas px-2 py-0.5 rounded-md border border-border">
                            {phase.tasks.length} {phase.tasks.length === 1 ? 'task' : 'tasks'}
                          </span>
                        </div>

                        <ul className="divide-y divide-border/50">
                          {phase.tasks.map((task) => (
                            <li
                              key={task.id}
                              className="py-2.5 flex items-start justify-between gap-3 text-xs"
                            >
                              <span className="font-medium text-ink pt-0.5 leading-snug">
                                {task.title}
                              </span>
                              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-canvas text-ink-muted border border-border">
                                {task.verification_type.replace('_', ' ')}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Info Footer Note */}
                  <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-xl p-3.5 text-xs">
                    <Info size={16} className="shrink-0 mt-0.5 text-amber-600" />
                    <p className="leading-relaxed">
                      Need a new template or adjustments to existing workflows? Contact your HR Administrator.
                    </p>
                  </div>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </AppShell>
  )
}