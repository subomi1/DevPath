import { useState } from 'react'
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  X,
  Clock,
  Calendar,
  CheckCircle2,
  UserCheck,
  Zap,
  Loader2,
  Tag,
  AlertCircle,
  Pencil,
  FileText,
  Layers,
} from 'lucide-react'
import {
  useTemplateBuilderDetail,
  useUpdateTemplate,
  useCreatePhase,
  useUpdatePhase,
  useDeletePhase,
  useReorderPhases,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useReorderTasks,
} from '../../hooks/useTemplateBuilder'
import type { BuilderTask } from '../../types/templateBuilder'

const PRIORITIES = ['low', 'medium', 'high'] as const
const VERIFICATION_TYPES = [
  { value: 'self', label: 'Self Verification', icon: CheckCircle2 },
  { value: 'manager_verified', label: 'Manager Verified', icon: UserCheck },
  { value: 'automatic', label: 'Automatic System', icon: Zap },
]

export function TemplateBuilderDetail({ templateId }: { templateId: string }) {
  const { data: template, isLoading } = useTemplateBuilderDetail(templateId)
  const updateTemplate = useUpdateTemplate()
  const createPhase = useCreatePhase()
  const updatePhase = useUpdatePhase()
  const deletePhase = useDeletePhase()
  const reorderPhases = useReorderPhases()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const reorderTasks = useReorderTasks()

  const [editingTask, setEditingTask] = useState<BuilderTask | null>(null)
  const [newPhaseOpen, setNewPhaseOpen] = useState(false)
  const [newPhaseName, setNewPhaseName] = useState('')

  if (isLoading || !template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-ink-muted space-y-2">
        <Loader2 size={24} className="animate-spin text-primary" />
        <p className="text-xs font-medium">Loading template details...</p>
      </div>
    )
  }

  const movePhase = (index: number, direction: -1 | 1) => {
    const phases = template.phases
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= phases.length) return
    reorderPhases.mutate([
      { id: phases[index].id, order: targetIndex + 1 },
      { id: phases[targetIndex].id, order: index + 1 },
    ])
  }

  const moveTask = (
    phaseTasks: BuilderTask[],
    index: number,
    direction: -1 | 1
  ) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= phaseTasks.length) return
    reorderTasks.mutate([
      { id: phaseTasks[index].id, order: targetIndex + 1 },
      { id: phaseTasks[targetIndex].id, order: index + 1 },
    ])
  }

  const handleAddPhase = async () => {
    if (!newPhaseName.trim()) return
    await createPhase.mutateAsync({
      template: templateId,
      name: newPhaseName.trim(),
      order: template.phases.length + 1,
    })
    setNewPhaseName('')
    setNewPhaseOpen(false)
  }

  const handleAddTask = (phaseId: string, taskCount: number) => {
    createTask.mutate({
      phase: phaseId,
      title: 'New onboarding task',
      description: '',
      category: 'General',
      priority: 'medium',
      due_offset_days: 1,
      estimated_minutes: 30,
      verification_type: 'self',
      order: taskCount + 1,
    })
  }

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      case 'low':
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Template Metadata Header */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <FileText size={14} /> Template Settings
        </div>
        <div className="space-y-1">
          <input
            defaultValue={template.name}
            onBlur={(e) =>
              e.target.value.trim() !== template.name &&
              updateTemplate.mutate({
                id: templateId,
                data: { name: e.target.value.trim() },
              })
            }
            placeholder="Template Title"
            className="font-display text-xl sm:text-2xl font-bold text-ink border border-transparent hover:border-border/80 focus:border-primary bg-transparent focus:bg-canvas rounded-xl px-2 py-1 -ml-2 w-full transition-all focus:outline-hidden"
          />
          <input
            defaultValue={template.description}
            placeholder="Add a detailed description for this onboarding blueprint..."
            onBlur={(e) =>
              e.target.value !== template.description &&
              updateTemplate.mutate({
                id: templateId,
                data: { description: e.target.value },
              })
            }
            className="text-xs sm:text-sm text-ink-muted border border-transparent hover:border-border/80 focus:border-primary bg-transparent focus:bg-canvas rounded-xl px-2 py-1 -ml-2 w-full transition-all focus:outline-hidden"
          />
        </div>
      </div>

      {/* Phases List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Phases & Tasks ({template.phases.length})
            </h3>
          </div>
        </div>

        <div className="space-y-5">
          {template.phases.map((phase, phaseIndex) => (
            <div
              key={phase.id}
              className="bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-2xs transition-all hover:border-border"
            >
              {/* Phase Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-canvas/40 border-b border-border/60">
                <div className="flex flex-col shrink-0">
                  <button
                    type="button"
                    onClick={() => movePhase(phaseIndex, -1)}
                    disabled={phaseIndex === 0}
                    className="p-0.5 text-ink-muted hover:text-ink disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    title="Move Phase Up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhase(phaseIndex, 1)}
                    disabled={phaseIndex === template.phases.length - 1}
                    className="p-0.5 text-ink-muted hover:text-ink disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    title="Move Phase Down"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg shrink-0">
                    Phase {phaseIndex + 1}
                  </span>
                  <input
                    defaultValue={phase.name}
                    onBlur={(e) =>
                      e.target.value.trim() !== phase.name &&
                      updatePhase.mutate({
                        id: phase.id,
                        data: { name: e.target.value.trim() },
                      })
                    }
                    className="font-bold text-sm text-ink bg-transparent border border-transparent hover:border-border/80 focus:border-primary focus:bg-canvas rounded-lg px-2 py-1 flex-1 transition-all focus:outline-hidden truncate"
                  />
                </div>

                <span className="text-xs font-semibold text-ink-muted shrink-0 bg-surface border border-border/60 px-2.5 py-1 rounded-full">
                  {phase.tasks.length} {phase.tasks.length === 1 ? 'task' : 'tasks'}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    confirm(
                      `Delete phase "${phase.name}" and all associated tasks?`
                    ) && deletePhase.mutate(phase.id)
                  }
                  className="p-1.5 text-ink-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Delete Phase"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Tasks List */}
              <div className="p-3 space-y-2">
                {phase.tasks.length === 0 ? (
                  <div className="py-6 text-center text-xs text-ink-muted/70 bg-canvas/20 rounded-xl border border-dashed border-border/50">
                    No tasks added to this phase yet.
                  </div>
                ) : (
                  phase.tasks.map((task, taskIndex) => {
                    const verification = VERIFICATION_TYPES.find(
                      (v) => v.value === task.verification_type
                    )
                    const VerIcon = verification?.icon || CheckCircle2

                    return (
                      <div
                        key={task.id}
                        className="group flex items-center gap-3 bg-surface hover:bg-canvas/50 border border-border/70 hover:border-border rounded-xl p-3 transition-all shadow-2xs"
                      >
                        {/* Task Reorder Arrows */}
                        <div className="flex flex-col shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              moveTask(phase.tasks, taskIndex, -1)
                            }
                            disabled={taskIndex === 0}
                            className="p-0.5 text-ink-muted hover:text-ink disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ChevronUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveTask(phase.tasks, taskIndex, 1)}
                            disabled={taskIndex === phase.tasks.length - 1}
                            className="p-0.5 text-ink-muted hover:text-ink disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ChevronDown size={13} />
                          </button>
                        </div>

                        {/* Task Content */}
                        <button
                          type="button"
                          onClick={() => setEditingTask(task)}
                          className="flex-1 text-left min-w-0 cursor-pointer group/btn"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs sm:text-sm font-semibold text-ink group-hover/btn:text-primary transition-colors truncate">
                              {task.title}
                            </p>
                            <Pencil
                              size={12}
                              className="text-ink-muted/0 group-hover/btn:text-ink-muted/70 transition-opacity shrink-0"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                            {task.category && (
                              <span className="inline-flex items-center gap-1 bg-canvas border border-border/60 rounded-md px-1.5 py-0.5 font-medium">
                                <Tag size={10} />
                                {task.category}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <VerIcon size={11} className="text-primary" />
                              {verification?.label || task.verification_type}
                            </span>
                            {task.due_offset_days > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar size={11} />
                                Day {task.due_offset_days}
                              </span>
                            )}
                            {task.estimated_minutes > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <Clock size={11} />
                                {task.estimated_minutes}m
                              </span>
                            )}
                          </div>
                        </button>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border shrink-0 ${getPriorityBadgeStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        {/* Delete Task */}
                        <button
                          type="button"
                          onClick={() =>
                            confirm(`Delete task "${task.title}"?`) &&
                            deleteTask.mutate(task.id)
                          }
                          className="p-1.5 text-ink-muted/60 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  })
                )}

                <button
                  type="button"
                  onClick={() => handleAddTask(phase.id, phase.tasks.length)}
                  className="w-full text-xs font-semibold text-primary hover:bg-primary/5 border border-dashed border-primary/30 rounded-xl py-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1"
                >
                  <Plus size={14} /> Add Task
                </button>
              </div>
            </div>
          ))}

          {/* New Phase Button / Form */}
          {newPhaseOpen ? (
            <div className="bg-surface border border-primary/40 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3 animate-in fade-in duration-150">
              <input
                autoFocus
                value={newPhaseName}
                onChange={(e) => setNewPhaseName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddPhase()
                  if (e.key === 'Escape') setNewPhaseOpen(false)
                }}
                placeholder="Enter new phase name (e.g. Week 1: Onboarding)..."
                className="w-full sm:flex-1 border border-border bg-canvas rounded-xl px-3.5 py-2 text-xs sm:text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setNewPhaseOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-ink-muted hover:text-ink rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPhase}
                  disabled={!newPhaseName.trim()}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Save Phase
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setNewPhaseOpen(true)}
              className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-primary/90 bg-surface hover:bg-primary/5 border border-dashed border-border hover:border-primary/40 rounded-2xl py-3.5 transition-all cursor-pointer shadow-2xs"
            >
              <Plus size={16} /> Add New Phase
            </button>
          )}
        </div>
      </div>

      {/* Task Edit Slide-Over Drawer */}
      {editingTask && (
        <>
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-40 animate-in fade-in duration-200"
            onClick={() => setEditingTask(null)}
          />
          <div
            key={editingTask.id}
            className="fixed top-0 right-0 h-screen w-full max-w-md bg-surface z-50 flex flex-col shadow-2xl border-l border-border animate-in slide-in-from-right duration-200"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-canvas/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Pencil size={14} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ink">Edit Task</h3>
                  <p className="text-[11px] text-ink-muted">
                    Configure task rules & details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="p-1.5 text-ink-muted hover:text-ink rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Task Title
                </label>
                <input
                  defaultValue={editingTask.title}
                  onBlur={(e) =>
                    e.target.value.trim() !== editingTask.title &&
                    updateTask.mutate({
                      id: editingTask.id,
                      data: { title: e.target.value.trim() },
                    })
                  }
                  className="w-full bg-canvas border border-border rounded-xl px-3 py-2 text-xs sm:text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  defaultValue={editingTask.description}
                  onBlur={(e) =>
                    e.target.value !== editingTask.description &&
                    updateTask.mutate({
                      id: editingTask.id,
                      data: { description: e.target.value },
                    })
                  }
                  rows={4}
                  placeholder="Provide instructions or links for completing this task..."
                  className="w-full bg-canvas border border-border rounded-xl px-3 py-2 text-xs sm:text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                    Category
                  </label>
                  <input
                    defaultValue={editingTask.category}
                    placeholder="e.g. IT Setup"
                    onBlur={(e) =>
                      e.target.value !== editingTask.category &&
                      updateTask.mutate({
                        id: editingTask.id,
                        data: { category: e.target.value },
                      })
                    }
                    className="w-full bg-canvas border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                    Priority
                  </label>
                  <select
                    defaultValue={editingTask.priority}
                    onChange={(e) =>
                      updateTask.mutate({
                        id: editingTask.id,
                        data: { priority: e.target.value },
                      })
                    }
                    className="w-full bg-canvas border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all capitalize"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p} priority
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                    Due Offset (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    defaultValue={editingTask.due_offset_days}
                    onBlur={(e) =>
                      updateTask.mutate({
                        id: editingTask.id,
                        data: { due_offset_days: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-canvas border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                    Est. Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min={0}
                    defaultValue={editingTask.estimated_minutes}
                    onBlur={(e) =>
                      updateTask.mutate({
                        id: editingTask.id,
                        data: { estimated_minutes: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-canvas border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Verification Type
                </label>
                <select
                  defaultValue={editingTask.verification_type}
                  onChange={(e) =>
                    updateTask.mutate({
                      id: editingTask.id,
                      data: { verification_type: e.target.value },
                    })
                  }
                  className="w-full bg-canvas border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {VERIFICATION_TYPES.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-border/80">
                <div className="p-3 bg-canvas/60 rounded-xl border border-border/60 text-[11px] text-ink-muted flex items-start gap-2">
                  <AlertCircle size={14} className="text-primary shrink-0 mt-0.5" />
                  <span>
                    Changes made to tasks are auto-saved as you modify or leave each field.
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-border bg-canvas/40 flex justify-end">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}