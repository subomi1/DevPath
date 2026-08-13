import { useState, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { AppShell } from '../../layouts/AppShell'
import { useAccessRequests, useCreateAccessRequest } from '../../hooks/useAccessRequests'
import type { AccessRequestStatus } from '../../types/accessRequest'

const RESOURCE_OPTIONS = [
  { value: 'github', label: 'GitHub' },
  { value: 'azure_devops', label: 'Azure DevOps' },
  { value: 'sql_server', label: 'SQL Server' },
  { value: 'vpn', label: 'VPN' },
  { value: 'internal_apis', label: 'Internal APIs' },
  { value: 'test_environment', label: 'Test Environment' },
  { value: 'other', label: 'Other' },
]

const STEPPER_STAGES: AccessRequestStatus[] = ['submitted', 'under_review', 'approved', 'completed']

function StatusStepper({ status, log }: { status: AccessRequestStatus; log: { status: string }[] }) {
  if (status === 'rejected') {
    return <span className="text-xs text-danger font-medium">Rejected</span>
  }

  const reachedStatuses = new Set(log.map((l) => l.status))
  const currentIndex = STEPPER_STAGES.indexOf(status)

  return (
    <div className="flex items-center gap-1">
      {STEPPER_STAGES.map((stage, i) => (
        <div key={stage} className="flex items-center">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              reachedStatuses.has(stage)
                ? i <= currentIndex ? 'bg-primary' : 'bg-border'
                : 'bg-border'
            }`}
          />
          {i < STEPPER_STAGES.length - 1 && <div className="w-4 h-0.5 bg-border" />}
        </div>
      ))}
    </div>
  )
}

export default function AccessRequestsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data: requests, isLoading } = useAccessRequests()
  const createRequest = useCreateAccessRequest()

  const [resource, setResource] = useState('github')
  const [otherLabel, setOtherLabel] = useState('')
  const [justification, setJustification] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await createRequest.mutateAsync({
      resource,
      resource_other_label: resource === 'other' ? otherLabel : undefined,
      justification,
    })
    setJustification('')
    setOtherLabel('')
    setDrawerOpen(false)
  }

  return (
    <AppShell title="Access Requests">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">Access Requests</h1>
            <p className="text-sm text-ink-muted mt-1">Manage and track your system permissions and provisioning.</p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 bg-primary text-white text-sm font-medium rounded-lg px-4 py-2 shrink-0"
          >
            <Plus size={16} /> Request access
          </button>
        </div>

        {isLoading && <p className="text-sm text-ink-muted">Loading...</p>}

        {!isLoading && requests?.length === 0 && (
          <p className="text-sm text-ink-muted">No access requests yet.</p>
        )}

        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          {requests?.map((req) => (
            <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-ink">{req.resource_display}</p>
                <p className="text-xs text-ink-muted">{new Date(req.created_at).toLocaleDateString()}</p>
              </div>
              <StatusStepper status={req.status} log={req.status_log} />
            </div>
          ))}
        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-ink/40 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed top-0 right-0 h-screen w-full max-w-lg bg-surface z-50 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-ink">Request access</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-ink-muted">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Resource</label>
                <select
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                >
                  {RESOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {resource === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Specify resource</label>
                  <input
                    type="text"
                    value={otherLabel}
                    onChange={(e) => setOtherLabel(e.target.value)}
                    required
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Justification</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  required
                  rows={4}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={createRequest.isPending}
                className="bg-primary text-white text-sm font-medium rounded-lg py-2.5 disabled:opacity-60"
              >
                {createRequest.isPending ? 'Submitting...' : 'Submit request'}
              </button>
            </form>
          </div>
        </>
      )}
    </AppShell>
  )
}