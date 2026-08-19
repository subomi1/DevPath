import { useState } from 'react'
import { Building2, ShieldCheck, Mail, Plug } from 'lucide-react'
import { AppShell } from '../../layouts/AppShell';
import { useSystemSettings, useUpdateSystemSettings } from '../../hooks/useSystemSettings'

const TABS = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'email', label: 'Email Templates', icon: Mail },
  { id: 'integrations', label: 'Integrations', icon: Plug },
] as const

type TabId = typeof TABS[number]['id']

const EMAIL_TEMPLATES = ['Invitation', 'Password Reset', 'Activation Confirmation']
const INTEGRATIONS = ['GitHub', 'Azure DevOps', 'SSO']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general')

  return (
    <AppShell title="System Settings">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
        {/* Tab sidebar */}
        <div className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-border p-4">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                  activeTab === id ? 'bg-primary/10 text-primary font-medium' : 'text-ink-muted hover:bg-canvas'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-2xl">
          {activeTab === 'general' && <GeneralPanel />}
          {activeTab === 'security' && <SecurityPanel />}
          {activeTab === 'email' && <EmailTemplatesPanel />}
          {activeTab === 'integrations' && <IntegrationsPanel />}
        </div>
      </div>
    </AppShell>
  )
}

function PanelSaveNote() {
  return (
    <p className="text-xs text-ink-muted mt-3">
      This is a preview panel — changes aren't persisted yet.
    </p>
  )
}

function GeneralPanel() {
  const { data: settings, isLoading } = useSystemSettings()
  const updateSettings = useUpdateSystemSettings()

  const [companyName, setCompanyName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('')

  // sync local editable fields once real data arrives
  if (settings && companyName === '' && !isLoading) {
    setCompanyName(settings.company_name)
    setPrimaryColor(settings.primary_color)
  }

  const handleSave = () => {
    updateSettings.mutate({ company_name: companyName, primary_color: primaryColor })
  }

  if (isLoading) {
    return <div className="bg-surface border border-border rounded-lg p-6 text-sm text-ink-muted">Loading...</div>
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="font-display font-semibold text-ink mb-4">General</h2>
      <div className="flex flex-col gap-4 max-w-sm">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Company Name</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Logo</label>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-bold">AZ</div>
            <button className="text-sm border border-border rounded-lg px-3 py-1.5 text-ink-muted" disabled>
              Upload new logo
            </button>
          </div>
          <p className="text-xs text-ink-muted mt-1">Logo upload isn't wired up yet.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 border border-border rounded-lg cursor-pointer"
            />
            <span className="text-sm text-ink-muted">{primaryColor}</span>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="bg-primary text-white text-sm font-medium rounded-lg px-4 py-2 w-fit mt-2 disabled:opacity-60"
        >
          {updateSettings.isPending ? 'Saving...' : 'Save changes'}
        </button>
        {updateSettings.isSuccess && <p className="text-xs text-success">Saved.</p>}
      </div>
    </div>
  )
}

function SecurityPanel() {
  const { data: settings, isLoading } = useSystemSettings()
  const updateSettings = useUpdateSystemSettings()

  const [minLength, setMinLength] = useState<number | null>(null)
  const [requireComplexity, setRequireComplexity] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null)

  if (settings && minLength === null && !isLoading) {
    setMinLength(settings.min_password_length)
    setRequireComplexity(settings.require_password_complexity)
    setSessionTimeout(settings.session_timeout_minutes)
  }

  const handleSave = () => {
    updateSettings.mutate({
      min_password_length: minLength ?? undefined,
      require_password_complexity: requireComplexity,
      session_timeout_minutes: sessionTimeout ?? undefined,
    })
  }

  if (isLoading || minLength === null) {
    return <div className="bg-surface border border-border rounded-lg p-6 text-sm text-ink-muted">Loading...</div>
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="font-display font-semibold text-ink mb-4">Security</h2>
      <div className="flex flex-col gap-4 max-w-sm">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Minimum Password Length</label>
          <input
            type="number"
            value={minLength}
            onChange={(e) => setMinLength(Number(e.target.value))}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={requireComplexity}
            onChange={(e) => setRequireComplexity(e.target.checked)}
            className="w-4 h-4"
          />
          Require complexity (uppercase, number, symbol)
        </label>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Session Timeout (minutes)</label>
          <input
            type="number"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(Number(e.target.value))}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="bg-primary text-white text-sm font-medium rounded-lg px-4 py-2 w-fit mt-2 disabled:opacity-60"
        >
          {updateSettings.isPending ? 'Saving...' : 'Save changes'}
        </button>
        {updateSettings.isSuccess && <p className="text-xs text-success">Saved.</p>}
      </div>
    </div>
  )
}

function EmailTemplatesPanel() {
  const [selected, setSelected] = useState(EMAIL_TEMPLATES[0])

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="font-display font-semibold text-ink mb-4">Email Templates</h2>
      <div className="flex gap-6">
        <div className="w-40 shrink-0 flex flex-col gap-1">
          {EMAIL_TEMPLATES.map((t) => (
            <button
              key={t}
              onClick={() => setSelected(t)}
              className={`text-left px-3 py-2 rounded-lg text-sm ${
                selected === t ? 'bg-primary/10 text-primary font-medium' : 'text-ink-muted hover:bg-canvas'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1 bg-canvas border border-border rounded-lg p-4">
          <p className="text-xs text-ink-muted uppercase tracking-wide mb-2">Preview</p>
          <p className="text-sm font-medium text-ink mb-2">{selected} Email</p>
          <p className="text-sm text-ink-muted">
            {selected === 'Invitation' && "Welcome to AppZone, {FirstName}. Click below to activate your account..."}
            {selected === 'Password Reset' && "We received a request to reset your password. Click below to continue..."}
            {selected === 'Activation Confirmation' && "Your account has been activated. Log in to get started..."}
          </p>
        </div>
      </div>
      <PanelSaveNote />
    </div>
  )
}

function IntegrationsPanel() {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="font-display font-semibold text-ink mb-4">Integrations</h2>
      <div className="flex flex-col gap-3">
        {INTEGRATIONS.map((name) => (
          <div key={name} className="flex items-center justify-between border border-border rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-canvas border border-border rounded-lg flex items-center justify-center">
                <Plug size={14} className="text-ink-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{name}</p>
                <p className="text-xs text-ink-muted">Not connected</p>
              </div>
            </div>
            <button className="text-sm border border-border rounded-lg px-3 py-1.5 text-ink-muted">Connect</button>
          </div>
        ))}
      </div>
      <PanelSaveNote />
    </div>
  )
}