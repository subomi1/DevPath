import { X } from 'lucide-react'
import type { JourneyTask } from '../../types/journey'
import { useCompleteTask, useSubmitTask } from '../../hooks/useJourney'

export function TaskDetailDrawer({ task, onClose }: { task: JourneyTask; onClose: () => void }) {
  const completeTask = useCompleteTask()
  const submitTask = useSubmitTask()

  const isActionable = task.status === 'current' || task.status === 'upcoming' || task.status === 'sent_back'
  const isAwaitingVerification = task.status === 'completed' && task.verification_type === 'manager_verified'

  const handleAction = async () => {
    if (task.verification_type === 'self') {
      await completeTask.mutateAsync(task.id)
    } else if (task.verification_type === 'manager_verified') {
      await submitTask.mutateAsync(task.id)
    }
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-screen w-full max-w-lg bg-surface z-50 flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-ink">Task Details</h2>
          <button onClick={onClose} className="text-ink-muted">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <h3 className="font-display text-lg font-semibold text-ink">{task.title}</h3>

          {task.description && (
            <p className="text-sm text-ink-muted">{task.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {task.category && (
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wide">Category</p>
                <p className="text-ink mt-0.5">{task.category}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wide">Priority</p>
              <p className="text-ink mt-0.5 capitalize">{task.priority}</p>
            </div>
            {task.due_date && (
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wide">Due date</p>
                <p className="text-ink mt-0.5">{task.due_date}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wide">Est. time</p>
              <p className="text-ink mt-0.5">{task.estimated_minutes} min</p>
            </div>
          </div>

          {task.status === 'sent_back' && task.verification_note && (
            <div className="bg-danger/10 border border-danger rounded-lg p-3">
              <p className="text-xs font-medium text-danger mb-1">Sent back</p>
              <p className="text-sm text-ink">{task.verification_note}</p>
            </div>
          )}

          {isAwaitingVerification && (
            <div className="bg-primary/10 border border-primary rounded-lg p-3 text-sm text-primary">
              Awaiting manager verification.
            </div>
          )}

          {task.status === 'verified' && (
            <div className="bg-success/10 border border-success rounded-lg p-3 text-sm text-success">
              Verified{task.verified_at ? ` on ${new Date(task.verified_at).toLocaleDateString()}` : ''}.
            </div>
          )}

          {task.status === 'locked' && (
            <p className="text-sm text-ink-muted">Complete earlier tasks to unlock this one.</p>
          )}
        </div>

        {isActionable && (
          <div className="px-6 py-4 border-t border-border">
            <button
              onClick={handleAction}
              disabled={completeTask.isPending || submitTask.isPending}
              className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {completeTask.isPending || submitTask.isPending
                ? 'Saving...'
                : task.verification_type === 'self'
                ? 'Mark complete'
                : task.status === 'sent_back'
                ? 'Resubmit for verification'
                : 'Submit for verification'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}