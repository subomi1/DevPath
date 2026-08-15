import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Building2,
  Users,
  Loader2,
  X,
  FolderTree,
  Sparkles,
} from 'lucide-react'
import { AppShell } from '../../layouts/AppShell'
import {
  useDepartmentsWithTeams,
  useCreateDepartment,
  useCreateTeam,
  useDeleteTeam,
  useDeleteDepartment,
} from '../../hooks/useOrgManagement'

export default function DepartmentsPage() {
  const { departments, teams } = useDepartmentsWithTeams()
  const createDepartment = useCreateDepartment()
  const createTeam = useCreateTeam()
  const deleteTeam = useDeleteTeam()
  const deleteDepartment = useDeleteDepartment()

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [newDeptOpen, setNewDeptOpen] = useState(false)
  const [newDeptName, setNewDeptName] = useState('')
  const [newTeamFor, setNewTeamFor] = useState<string | null>(null)
  const [newTeamName, setNewTeamName] = useState('')

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleCreateDepartment = async () => {
    if (!newDeptName.trim() || createDepartment.isPending) return
    await createDepartment.mutateAsync({ name: newDeptName.trim(), description: '' })
    setNewDeptName('')
    setNewDeptOpen(false)
  }

  const handleCreateTeam = async (departmentId: string) => {
    if (!newTeamName.trim() || createTeam.isPending) return
    await createTeam.mutateAsync({ name: newTeamName.trim(), department: departmentId })
    setNewTeamName('')
    setNewTeamFor(null)
  }

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    try {
      await deleteTeam.mutateAsync({ teamId })
    } catch (err: any) {
      const memberCount = err?.response?.data?.member_count
      if (memberCount) {
        if (confirm(`${teamName} has ${memberCount} member(s). Delete anyway?`)) {
          await deleteTeam.mutateAsync({ teamId, confirm: true })
        }
      }
    }
  }

  const handleDeleteDepartment = async (departmentId: string, departmentName: string) => {
    if (!confirm(`Are you sure you want to delete "${departmentName}"?`)) return
    try {
      await deleteDepartment.mutateAsync(departmentId)
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? `Could not delete ${departmentName}.`)
    }
  }

  const isLoading = departments.isLoading || teams.isLoading

  return (
    <AppShell title="Departments & Teams">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto w-full min-h-[calc(100vh-4rem)] space-y-6">
        {/* Page Header */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink flex items-center gap-2.5">
              <FolderTree className="text-primary" size={24} />
              Departments & Teams
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted">
              Organize your company structure, departments, and sub-teams.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewDeptOpen(!newDeptOpen)
              setNewDeptName('')
            }}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus size={16} /> Add Department
          </button>
        </div>

        {/* Add Department Inline Form */}
        {newDeptOpen && (
          <div className="bg-surface border border-primary/30 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                New Department
              </h3>
              <button
                type="button"
                onClick={() => setNewDeptOpen(false)}
                className="text-ink-muted hover:text-ink p-1 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                autoFocus
                type="text"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateDepartment()
                  if (e.key === 'Escape') setNewDeptOpen(false)
                }}
                placeholder="Enter department name (e.g. Engineering, Product)..."
                className="flex-1 bg-canvas border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink-muted/60"
              />
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCreateDepartment}
                  disabled={!newDeptName.trim() || createDepartment.isPending}
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer w-full sm:w-auto"
                >
                  {createDepartment.isPending && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Save Department
                </button>
                <button
                  type="button"
                  onClick={() => setNewDeptOpen(false)}
                  className="bg-canvas hover:bg-border/40 text-ink-muted text-xs sm:text-sm font-semibold px-3 py-2.5 rounded-xl border border-border transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Container */}
        {isLoading ? (
          <div className="bg-surface border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-ink-muted space-y-3 shadow-xs">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-xs font-medium">Loading organization structure...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {departments.data?.map((dept) => {
              const deptTeams = teams.data?.filter((t) => t.department === dept.id) ?? []
              const isExpanded = expanded.has(dept.id)

              return (
                <div
                  key={dept.id}
                  className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs transition-all"
                >
                  {/* Department Header Row */}
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-canvas/40 transition-colors">
                    <button
                      type="button"
                      onClick={() => toggle(dept.id)}
                      className="flex items-center gap-3 flex-1 text-left min-w-0 cursor-pointer group"
                    >
                      <div className="p-1 rounded-lg bg-canvas text-ink-muted group-hover:text-ink transition-colors shrink-0">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                        <Building2 size={16} />
                      </div>
                      <div className="flex items-center gap-2.5 min-w-0 truncate">
                        <span className="text-sm font-semibold text-ink truncate">
                          {dept.name}
                        </span>
                        <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-canvas text-ink-muted border border-border/80 shrink-0">
                          {deptTeams.length} {deptTeams.length === 1 ? 'team' : 'teams'}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                      className="p-2 text-ink-muted hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0 ml-2 cursor-pointer"
                      title={`Delete ${dept.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Expanded Teams List */}
                  {isExpanded && (
                    <div className="border-t border-border/80 bg-canvas/30 px-4 sm:px-5 py-4 space-y-3">
                      <div className="space-y-1.5">
                        {deptTeams.map((team) => (
                          <div
                            key={team.id}
                            className="flex items-center justify-between bg-surface border border-border/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm group hover:border-border transition-all"
                          >
                            <div className="flex items-center gap-2.5 text-ink font-medium truncate">
                              <Users size={14} className="text-ink-muted shrink-0" />
                              <span className="truncate">{team.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteTeam(team.id, team.name)}
                              className="p-1.5 text-ink-muted hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title={`Delete ${team.name}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}

                        {deptTeams.length === 0 && newTeamFor !== dept.id && (
                          <p className="text-xs text-ink-muted italic py-1 px-1">
                            No teams added to this department yet.
                          </p>
                        )}
                      </div>

                      {/* Add Team Inline Trigger/Input */}
                      {newTeamFor === dept.id ? (
                        <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                          <input
                            autoFocus
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCreateTeam(dept.id)
                              if (e.key === 'Escape') setNewTeamFor(null)
                            }}
                            placeholder="New team name..."
                            className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink-muted/60"
                          />
                          <button
                            type="button"
                            onClick={() => handleCreateTeam(dept.id)}
                            disabled={!newTeamName.trim() || createTeam.isPending}
                            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0"
                          >
                            {createTeam.isPending && (
                              <Loader2 size={12} className="animate-spin" />
                            )}
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewTeamFor(null)}
                            className="p-2 text-ink-muted hover:text-ink rounded-xl transition-colors cursor-pointer shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setNewTeamFor(dept.id)
                            setNewTeamName('')
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors pt-1 cursor-pointer"
                        >
                          <Plus size={14} /> Add Team
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Empty State */}
            {departments.data?.length === 0 && (
              <div className="bg-surface border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 bg-canvas border border-border rounded-2xl flex items-center justify-center text-ink-muted shadow-2xs">
                  <Sparkles size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-ink">No departments found</h3>
                  <p className="text-xs text-ink-muted max-w-sm">
                    Get started by creating your first department to organize your teams.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewDeptOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer mt-2"
                >
                  <Plus size={14} /> Add First Department
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}