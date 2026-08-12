import { useState } from 'react'
import { AppShell } from '../../layouts/AppShell'
import { useJourney } from '../../hooks/useJourney'
import { HexNode } from '../../components/ui/HexNode'
import { TaskDetailDrawer } from './TaskDetailDrawer'
import type { JourneyTask } from '../../types/journey'
import { LayoutList, GitBranch } from 'lucide-react'

export default function JourneyPage() {
  const { data: journey, isLoading, error } = useJourney()
  const [view, setView] = useState<'timeline' | 'checklist'>('timeline')
  const [selectedTask, setSelectedTask] = useState<JourneyTask | null>(null)

  if (isLoading) {
    return (
      <AppShell title="My Journey">
        <div className="p-6 text-ink-muted text-sm">Loading...</div>
      </AppShell>
    )
  }

  if (error || !journey) {
    return (
      <AppShell title="My Journey">
        <div className="p-6 text-danger text-sm">Couldn't load your journey.</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="My Journey">
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">Your onboarding journey</h1>
            <p className="text-sm text-ink-muted mt-1 mb-2">{journey.overall_progress}% complete</p>
          </div>
          <div className="flex bg-canvas border border-border rounded-lg p-1">
            <button
              onClick={() => setView('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                view === 'timeline' ? 'bg-surface text-primary shadow-sm' : 'text-ink-muted'
              }`}
            >
              <GitBranch size={14} /> Timeline
            </button>
            <button
              onClick={() => setView('checklist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                view === 'checklist' ? 'bg-surface text-primary shadow-sm' : 'text-ink-muted'
              }`}
            >
              <LayoutList size={14} /> Checklist
            </button>
          </div>
        </div>

        {view === 'timeline' ? (
          <div className="flex flex-col gap-8">
            {journey.phases.map((phase) => (
              <div key={phase.id}>
                <h2 className="font-display text-sm font-semibold text-ink mb-4">{phase.name}</h2>
                <div className="flex flex-col gap-4 relative pl-2">
                  {phase.tasks.map((task, i) => (
                    <div key={task.id} className="flex items-start gap-4 relative">
                      {i < phase.tasks.length - 1 && (
                        <div className="absolute left-5 top-10 w-0.5 h-full bg-border" />
                      )}
                      <button onClick={() => setSelectedTask(task)} className="relative z-10">
                        <HexNode status={task.status} />
                      </button>
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="flex-1 text-left bg-surface border border-border rounded-lg px-4 py-3 hover:border-primary transition-colors"
                      >
                        <p className={`text-sm ${task.status === 'locked' ? 'text-ink-muted' : 'text-ink'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5 capitalize">{task.status.replace('_', ' ')}</p>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg divide-y divide-border">
            {journey.phases.flatMap((phase) =>
              phase.tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-canvas"
                >
                  <HexNode status={task.status} size={28} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{task.title}</p>
                    <p className="text-xs text-ink-muted">{phase.name}</p>
                  </div>
                  <span className="text-xs text-ink-muted capitalize shrink-0">
                    {task.status.replace('_', ' ')}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </AppShell>
  )
}