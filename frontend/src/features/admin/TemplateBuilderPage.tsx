import { useState } from 'react'
import {
  Plus,
  FileText,
  Layers,
  CheckSquare,
  Briefcase,
  Loader2,
  X,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  FolderKanban,
} from 'lucide-react'
import { AppShell } from '../../layouts/AppShell'
import { useTemplateList, useCreateTemplate } from '../../hooks/useTemplateBuilder'
import { TemplateBuilderDetail } from './TemplateBuilderDetail'

export default function TemplateBuilderPage() {
  const { data: templates, isLoading } = useTemplateList()
  const createTemplate = useCreateTemplate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')

  const handleCreate = async () => {
    if (!newName.trim() || createTemplate.isPending) return
    const template = await createTemplate.mutateAsync({
      name: newName.trim(),
      target_role: newRole.trim(),
      description: '',
    })
    setNewName('')
    setNewRole('')
    setNewOpen(false)
    setSelectedId(template.id)
  }

  return (
    <AppShell title="Onboarding Templates">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-canvas/30">
        {/* Template List Sidebar */}
        <div
          className={`lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-surface flex flex-col h-full ${
            selectedId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <FolderKanban size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-ink">Templates</h2>
                <p className="text-[11px] text-ink-muted">Manage workflow blueprints</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewOpen(!newOpen)
                setNewName('')
                setNewRole('')
              }}
              className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all cursor-pointer"
              title="Create new template"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* New Template Form Drawer */}
          {newOpen && (
            <div className="p-4 bg-canvas/60 border-b border-border space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  New Template
                </span>
                <button
                  type="button"
                  onClick={() => setNewOpen(false)}
                  className="text-ink-muted hover:text-ink p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') setNewOpen(false)
                  }}
                  placeholder="Template name (e.g. Frontend Dev)"
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink-muted/60"
                />
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') setNewOpen(false)
                  }}
                  placeholder="Target role (e.g. Software Engineer)"
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink-muted/60"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNewOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!newName.trim() || createTemplate.isPending}
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  {createTemplate.isPending && (
                    <Loader2 size={12} className="animate-spin" />
                  )}
                  Create
                </button>
              </div>
            </div>
          )}

          {/* List Content Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-ink-muted space-y-2">
                <Loader2 size={20} className="animate-spin text-primary" />
                <p className="text-xs font-medium">Loading templates...</p>
              </div>
            ) : templates?.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-3">
                <div className="w-10 h-10 bg-canvas border border-border rounded-2xl mx-auto flex items-center justify-center text-ink-muted shadow-2xs">
                  <Sparkles size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-ink">No templates found</p>
                  <p className="text-[11px] text-ink-muted">
                    Create your first onboarding template to get started.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <Plus size={13} /> New Template
                </button>
              </div>
            ) : (
              templates?.map((t) => {
                const isSelected = selectedId === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-2 relative ${
                      isSelected
                        ? 'bg-primary/10 border-primary/30 text-ink shadow-2xs'
                        : 'bg-surface hover:bg-canvas/60 border-border/80 text-ink-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${isSelected ? 'text-primary' : 'text-ink group-hover:text-primary transition-colors'}`}>
                        {t.name}
                      </p>
                      <ChevronRight
                        size={14}
                        className={`shrink-0 transition-transform ${
                          isSelected ? 'text-primary translate-x-0.5' : 'text-ink-muted/40 group-hover:text-ink-muted'
                        }`}
                      />
                    </div>

                    {t.target_role && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-medium text-ink-muted bg-canvas border border-border/60 rounded-md px-1.5 py-0.5 w-fit">
                        <Briefcase size={10} />
                        <span className="truncate">{t.target_role}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-ink-muted/80 font-medium pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1">
                        <Layers size={11} className="text-primary/70" />
                        {t.phase_count} {t.phase_count === 1 ? 'phase' : 'phases'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CheckSquare size={11} className="text-emerald-500/80" />
                        {t.task_count} {t.task_count === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Builder Detail Panel */}
        <div
          className={`flex-1 overflow-y-auto bg-surface flex flex-col h-full ${
            !selectedId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Mobile Back Button Bar */}
          {selectedId && (
            <div className="lg:hidden p-3 bg-canvas/60 border-b border-border flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors p-1 cursor-pointer"
              >
                <ArrowLeft size={16} /> Back to Templates
              </button>
            </div>
          )}

          {selectedId ? (
            <TemplateBuilderDetail templateId={selectedId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-canvas border border-border rounded-3xl flex items-center justify-center text-ink-muted shadow-xs">
                <FileText size={28} className="text-primary" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-bold text-ink">No Template Selected</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Select an onboarding template from the sidebar to customize its phases and tasks, or build a new blueprint from scratch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewOpen(true)}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Plus size={16} /> Create New Template
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}