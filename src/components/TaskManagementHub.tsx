import { useState, useEffect, type FC } from 'react'
import {
  FaTasks,
  FaPlus,
  FaTrash,
  FaEdit,
  FaTimes,
  FaCheck,
  FaSpinner,
  FaRocket,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaLayerGroup,
} from 'react-icons/fa'
// Types mirrored from CollaborationWorkspaceHub (defined locally to avoid circular import issues)
interface WorkspaceSummary {
  id: string
  title: string
  tagline: string
  category: string
  stage: string
  founder: { id: string; name: string; email: string; avatar?: string | null; role: string }
  roleInWorkspace: 'FOUNDER' | 'TEAM_MEMBER' | 'ADMIN'
  memberRole?: string
  teamMemberCount: number
  notesCount: number
  announcementsCount: number
  filesCount: number
  updatedAt: string
}

interface WorkspaceMember {
  id: string
  name: string
  email: string
  phone?: string | null
  avatar?: string | null
  role: string
  startupRole: string
  isFounder: boolean
  joinedAt: string
  skills: string[]
  location?: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
  website?: string | null
  availabilityStatus?: string
  availabilityHoursPerWeek?: number | null
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface TaskUser {
  id: string
  name: string
  avatar?: string | null
  role: string
  email?: string
}

export interface TaskAssigneeRecord {
  id: string
  userId: string
  user: TaskUser
  assignedAt: string
}

export interface Task {
  id: string
  startupIdeaId: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  deadline?: string | null
  progress: number
  tags: string[]
  creator: TaskUser
  assignees: TaskAssigneeRecord[]
  createdAt: string
  updatedAt: string
}

interface Props {
  user: any
  token: string
  initialStartupId?: string
  onNavigateToStartups?: () => void
  onNavigateToCollaboration?: () => void
}

const API = 'http://localhost:5000/api'

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
} as const

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', dot: 'bg-slate-400' },
  MEDIUM: { label: 'Medium', dot: 'bg-blue-500' },
  HIGH: { label: 'High', dot: 'bg-orange-500' },
  URGENT: { label: 'Urgent', dot: 'bg-rose-500' },
} as const

function avatarInitial(name: string) { return name ? name.charAt(0).toUpperCase() : '?' }
function formatDate(iso: string | null | undefined) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function isOverdue(deadline: string | null | undefined, status: TaskStatus) {
  if (!deadline || status === 'COMPLETED') return false
  return new Date(deadline) < new Date()
}

const MemberAvatar: FC<{ user: TaskUser; size?: 'sm' | 'md' }> = ({ user, size = 'sm' }) => {
  const sz = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
  return user.avatar ? (
    <img src={user.avatar} alt={user.name} className={`${sz} rounded-full object-cover ring-2 ring-white`} />
  ) : (
    <div className={`${sz} rounded-full bg-gradient-to-br from-[#0b57d0] to-indigo-600 flex items-center justify-center font-black text-white ring-2 ring-white`}>
      {avatarInitial(user.name)}
    </div>
  )
}

const ProgressBar: FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-500"
      style={{ width: `${progress}%`, background: progress === 100 ? '#10b981' : progress >= 60 ? '#0b57d0' : progress >= 30 ? '#f59e0b' : '#94a3b8' }}
    />
  </div>
)

const TaskCard: FC<{
  task: Task; userId: string; userRole: string
  onEdit: (t: Task) => void; onDelete: (id: string) => void
  onStatusChange: (id: string, s: TaskStatus) => void
  onProgressChange: (id: string, p: number) => void
}> = ({ task, userId, userRole, onEdit, onDelete, onStatusChange, onProgressChange }) => {
  const [progDraft, setProgDraft] = useState(task.progress)
  const [progEditing, setProgEditing] = useState(false)
  const cfg = STATUS_CONFIG[task.status]
  const pCfg = PRIORITY_CONFIG[task.priority]
  const overdue = isOverdue(task.deadline, task.status)
  const canManage = userId === task.creator.id || userRole === 'FOUNDER' || userRole === 'ADMIN'
  const nextStatus: Record<TaskStatus, TaskStatus> = { PENDING: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED', COMPLETED: 'PENDING' }

  return (
    <div className={`group relative bg-white rounded-2xl border ${cfg.border} shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col gap-3`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${pCfg.dot}`} title={`Priority: ${pCfg.label}`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">{task.title}</h4>
          {task.description && <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>}
        </div>
        {canManage && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={() => onEdit(task)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer" title="Edit">
              <FaEdit className="text-[10px]" />
            </button>
            <button onClick={() => onDelete(task.id)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer" title="Delete">
              <FaTrash className="text-[10px]" />
            </button>
          </div>
        )}
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((t) => <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">#{t}</span>)}
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
          <span>Progress</span>
          <span className={progDraft === 100 ? 'text-emerald-600 font-black' : ''}>{progDraft}%</span>
        </div>
        <ProgressBar progress={progDraft} />
        {progEditing ? (
          <div className="flex items-center gap-2">
            <input type="range" min={0} max={100} step={5} value={progDraft} onChange={(e) => setProgDraft(Number(e.target.value))} className="flex-1 h-1 accent-[#0b57d0]" />
            <button onClick={() => { onProgressChange(task.id, progDraft); setProgEditing(false) }} className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center cursor-pointer">
              <FaCheck className="text-[9px]" />
            </button>
          </div>
        ) : (
          <button onClick={() => setProgEditing(true)} className="text-[10px] text-[#0b57d0] hover:underline cursor-pointer font-semibold">Update progress</button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center -space-x-1">
          {task.assignees.length === 0
            ? <span className="text-[10px] text-slate-400 italic">Unassigned</span>
            : <>
                {task.assignees.slice(0, 4).map((a) => <MemberAvatar key={a.id} user={a.user} size="sm" />)}
                {task.assignees.length > 4 && <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[9px] font-black flex items-center justify-center ring-2 ring-white">+{task.assignees.length - 4}</span>}
              </>
          }
        </div>
        <div className="flex items-center gap-2">
          {task.deadline && (
            <span className={`flex items-center gap-1 text-[10px] font-semibold ${overdue ? 'text-rose-600' : 'text-slate-500'}`}>
              {overdue && <FaExclamationTriangle className="text-rose-500" />}
              <FaCalendarAlt className="text-[9px]" />{formatDate(task.deadline)}
            </span>
          )}
          <button onClick={() => onStatusChange(task.id, nextStatus[task.status])} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${cfg.bg} ${cfg.color} border ${cfg.border} hover:opacity-80`} title="Click to advance status">
            {cfg.label}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Assign Members Dropdown ──────────────────────────────────────────────────

const AssignMembersDropdown: FC<{
  members: WorkspaceMember[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}> = ({ members, selectedIds, onChange }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.startupRole || m.role).toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (uid: string) =>
    onChange(selectedIds.includes(uid) ? selectedIds.filter((id) => id !== uid) : [...selectedIds, uid])

  const selectAll = () => onChange(filtered.map((m) => m.id))
  const clearAll = () => onChange([])

  const selectedMembers = members.filter((m) => selectedIds.includes(m.id))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
          Assign Members
        </label>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[10px] text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected chips */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {selectedMembers.map((m) => (
            <span
              key={m.id}
              className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-[#0b57d0] text-[10px] font-bold"
            >
              {m.avatar ? (
                <img src={m.avatar} alt={m.name} className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-[#0b57d0] flex items-center justify-center text-white font-black text-[8px]">
                  {avatarInitial(m.name)}
                </div>
              )}
              {m.name}
              <button
                type="button"
                onClick={() => toggle(m.id)}
                className="ml-0.5 text-blue-400 hover:text-rose-500 cursor-pointer font-black text-[10px] leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
            open
              ? 'border-[#0b57d0] ring-2 ring-[#0b57d0]/20 bg-white'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
          }`}
        >
          <span className={selectedIds.length === 0 ? 'text-slate-400' : 'text-slate-800'}>
            {members.length === 0
              ? 'No team members available'
              : selectedIds.length === 0
              ? 'Select team members…'
              : `${selectedIds.length} member${selectedIds.length > 1 ? 's' : ''} selected`}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown panel */}
        {open && members.length > 0 && (
          <div className="absolute z-20 top-[calc(100%+6px)] left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Search + controls */}
            <div className="p-3 border-b border-slate-100 space-y-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members…"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] transition-all"
                autoFocus
              />
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-slate-400">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</span>
                <button
                  type="button"
                  onClick={selectedIds.length === filtered.length ? clearAll : selectAll}
                  className="text-[#0b57d0] hover:underline cursor-pointer"
                >
                  {selectedIds.length === filtered.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
            </div>

            {/* Member list */}
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400 italic">No members match</p>
              ) : (
                filtered.map((m) => {
                  const selected = selectedIds.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggle(m.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer text-left ${
                        selected ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all ${
                        selected ? 'bg-[#0b57d0] border-[#0b57d0]' : 'border-slate-300 bg-white'
                      }`}>
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {/* Avatar */}
                      {m.avatar ? (
                        <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-white flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0b57d0] to-indigo-600 flex items-center justify-center text-white font-black text-[10px] flex-shrink-0">
                          {avatarInitial(m.name)}
                        </div>
                      )}
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold truncate ${selected ? 'text-[#0b57d0]' : 'text-slate-800'}`}>{m.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{m.startupRole || m.role}</p>
                      </div>
                      {m.isFounder && (
                        <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          Founder
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Done */}
            <div className="p-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full py-2 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white text-xs font-black transition-all cursor-pointer"
              >
                Done ({selectedIds.length} selected)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const TaskFormModal: FC<{
  isOpen: boolean; mode: 'create' | 'edit'; initial?: Partial<Task>
  members: WorkspaceMember[]
  onClose: () => void; onSubmit: (data: any) => Promise<void>; submitting: boolean
}> = ({ isOpen, mode, initial, members, onClose, onSubmit, submitting }) => {
  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority || 'MEDIUM')
  const [deadline, setDeadline] = useState(initial?.deadline ? new Date(initial.deadline).toISOString().split('T')[0] : '')
  const [tags, setTags] = useState(initial?.tags?.join(', ') || '')
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(initial?.assignees?.map((a) => a.userId) || [])

  useEffect(() => {
    if (isOpen) {
      setTitle(initial?.title || '')
      setDescription(initial?.description || '')
      setPriority(initial?.priority || 'MEDIUM')
      setDeadline(initial?.deadline ? new Date(initial.deadline).toISOString().split('T')[0] : '')
      setTags(initial?.tags?.join(', ') || '')
      setSelectedAssignees(initial?.assignees?.map((a) => a.userId) || [])
    }
  }, [isOpen, initial?.id])

  if (!isOpen) return null
  const handleSubmit = async () => {
    if (!title.trim()) return
    await onSubmit({
      title: title.trim(), description: description.trim() || null, priority,
      deadline: deadline || null,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      assigneeIds: selectedAssignees,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0b57d0] flex items-center justify-center shadow-lg">
              <FaTasks className="text-white text-sm" />
            </div>
            <div>
              <h2 className="font-black text-lg">{mode === 'create' ? 'Create New Task' : 'Edit Task'}</h2>
              <p className="text-xs text-slate-400">Fill in the details below</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer">
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Task Title <span className="text-rose-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Design landing page wireframes" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] focus:border-transparent transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Description</label>
            <textarea value={description as string} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task in detail..." rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] focus:border-transparent transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] transition-all cursor-pointer">
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] transition-all cursor-pointer" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tags <span className="text-slate-400 font-medium normal-case">(comma-separated)</span></label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. frontend, design, urgent" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] transition-all" />
          </div>
          {/* ── Assign Members Dropdown ── */}
          <AssignMembersDropdown
            members={members}
            selectedIds={selectedAssignees}
            onChange={setSelectedAssignees}
          />
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-3xl flex items-center justify-end gap-3">
          <button onClick={onClose} disabled={submitting} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-sm transition-all cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting || !title.trim()} className="px-6 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2">
            {submitting ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
            {mode === 'create' ? 'Create Task' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const TaskManagementHub: FC<Props> = ({ user, token, initialStartupId, onNavigateToStartups, onNavigateToCollaboration }) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceSummary | null>(null)
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL')
  const [searchQ, setSearchQ] = useState('')
  const [myTasksOnly, setMyTasksOnly] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const canManageAssignees = selectedWorkspace?.roleInWorkspace === 'FOUNDER' || user?.role === 'ADMIN'

  useEffect(() => {
    const load = async () => {
      setLoadingWorkspaces(true)
      try {
        const res = await fetch(`${API}/collaboration/my-workspaces`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok) {
          setWorkspaces(data.workspaces || [])
          if (data.workspaces?.length > 0) {
            const target = initialStartupId ? data.workspaces.find((w: WorkspaceSummary) => w.id === initialStartupId) || data.workspaces[0] : data.workspaces[0]
            setSelectedWorkspace(target)
          }
        } else setError(data.error || 'Failed to load workspaces')
      } catch { setError('Network error') }
      finally { setLoadingWorkspaces(false) }
    }
    if (token) load()
  }, [token, initialStartupId])

  useEffect(() => {
    if (!selectedWorkspace) return
    const loadTasks = async () => {
      setLoadingTasks(true); setError(null)
      try {
        const [tasksRes, wsRes] = await Promise.all([
          fetch(`${API}/tasks/workspace/${selectedWorkspace.id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/collaboration/workspace/${selectedWorkspace.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const tasksData = await tasksRes.json()
        const wsData = await wsRes.json()
        if (tasksRes.ok) setTasks(tasksData.tasks || [])
        else setError(tasksData.error || 'Failed to load tasks')
        if (wsRes.ok) setMembers(wsData.members || [])
      } catch { setError('Network error') }
      finally { setLoadingTasks(false) }
    }
    loadTasks()
  }, [selectedWorkspace?.id, token])

  const myTasks = tasks.filter((t) => t.assignees.some((a) => a.userId === user?.id))

  const filteredTasks = tasks.filter((t) => {
    if (myTasksOnly && !t.assignees.some((a) => a.userId === user?.id)) return false
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false
    if (searchQ && !t.title.toLowerCase().includes(searchQ.toLowerCase()) && !t.description?.toLowerCase().includes(searchQ.toLowerCase())) return false
    return true
  })

  const grouped: Record<TaskStatus, Task[]> = {
    PENDING: filteredTasks.filter((t) => t.status === 'PENDING'),
    IN_PROGRESS: filteredTasks.filter((t) => t.status === 'IN_PROGRESS'),
    COMPLETED: filteredTasks.filter((t) => t.status === 'COMPLETED'),
  }

  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const overdue = tasks.filter((t) => isOverdue(t.deadline, t.status)).length

  const handleCreate = async (data: any) => {
    if (!selectedWorkspace) return
    setSubmitting(true); setFormError(null)
    try {
      const res = await fetch(`${API}/tasks/workspace/${selectedWorkspace.id}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      const json = await res.json()
      if (res.ok) { setTasks((prev) => [json.task, ...prev]); setShowCreateModal(false) }
      else setFormError(json.error || 'Failed to create task')
    } catch { setFormError('Network error') }
    finally { setSubmitting(false) }
  }

  const handleEdit = async (data: any) => {
    if (!editTask) return
    setSubmitting(true); setFormError(null)
    try {
      const res = await fetch(`${API}/tasks/${editTask.id}`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      const json = await res.json()
      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === editTask.id ? json.task : t)))
        if (canManageAssignees) {
          const aRes = await fetch(`${API}/tasks/${editTask.id}/assignees`, {
            method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ assigneeIds: data.assigneeIds }),
          })
          const aJson = await aRes.json()
          if (aRes.ok) setTasks((prev) => prev.map((t) => (t.id === editTask.id ? aJson.task : t)))
        }
        setEditTask(null)
      } else setFormError(json.error || 'Failed to update task')
    } catch { setFormError('Network error') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return
    setDeletingId(taskId)
    try {
      const res = await fetch(`${API}/tasks/${taskId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch {} finally { setDeletingId(null) }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const res = await fetch(`${API}/tasks/${taskId}/status`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      const json = await res.json()
      if (res.ok) setTasks((prev) => prev.map((t) => (t.id === taskId ? json.task : t)))
    } catch {}
  }

  const handleProgressChange = async (taskId: string, progress: number) => {
    try {
      const res = await fetch(`${API}/tasks/${taskId}/status`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ progress }) })
      const json = await res.json()
      if (res.ok) setTasks((prev) => prev.map((t) => (t.id === taskId ? json.task : t)))
    } catch {}
  }

  if (loadingWorkspaces) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <FaSpinner className="animate-spin text-4xl text-[#0b57d0] mx-auto" />
        <p className="text-slate-500 font-medium">Loading workspaces...</p>
      </div>
    </div>
  )

  if (workspaces.length === 0) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md space-y-5 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
          <FaTasks className="text-2xl text-slate-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800">No Workspaces Found</h3>
          <p className="text-sm text-slate-500 mt-1">You need to be part of a startup workspace to manage tasks.</p>
        </div>
        <button onClick={onNavigateToStartups} className="px-6 py-3 rounded-xl bg-[#0b57d0] text-white font-bold text-sm hover:bg-[#0047ba] transition-all cursor-pointer shadow-sm">
          Go to Startup Ideas
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <FaTasks className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Task Management</h1>
            <p className="text-sm text-slate-500">Create, assign, and track your team tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onNavigateToCollaboration && (
            <button onClick={onNavigateToCollaboration} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm">
              <FaLayerGroup className="text-indigo-500 text-xs" /> Team Workspace
            </button>
          )}
          <button onClick={() => { setShowCreateModal(true); setFormError(null) }} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-2">
            <FaPlus className="text-xs" /> New Task
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <FaRocket className="text-[#0b57d0] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Startup Workspace</p>
          <select value={selectedWorkspace?.id || ''} onChange={(e) => { const ws = workspaces.find((w) => w.id === e.target.value); setSelectedWorkspace(ws || null); setFilterStatus('ALL'); setFilterPriority('ALL'); setSearchQ('') }} className="w-full text-sm font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer mt-0.5">
            {workspaces.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
          </select>
        </div>
        {selectedWorkspace && <span className="px-3 py-1 rounded-full bg-blue-100 text-[#0b57d0] text-[10px] font-black flex-shrink-0">{selectedWorkspace.roleInWorkspace}</span>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Tasks', value: total, g: 'from-slate-500 to-slate-700', icon: '📋', onClick: undefined, active: false },
          { label: 'In Progress', value: inProgress, g: 'from-blue-500 to-blue-700', icon: '⚡', onClick: undefined, active: false },
          { label: 'Completed', value: completed, g: 'from-emerald-500 to-emerald-700', icon: '✅', onClick: undefined, active: false },
          { label: 'Overdue', value: overdue, g: 'from-rose-500 to-rose-700', icon: '⚠️', onClick: undefined, active: false },
          { label: 'My Tasks', value: myTasks.length, g: myTasksOnly ? 'from-violet-600 to-indigo-600' : 'from-violet-400 to-indigo-500', icon: '👤', onClick: () => setMyTasksOnly((p) => !p), active: myTasksOnly },
        ].map(({ label, value, g, icon, onClick, active }) => (
          <div
            key={label}
            onClick={onClick}
            className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-3 transition-all ${
              onClick ? 'cursor-pointer hover:shadow-md' : ''
            } ${
              active ? 'border-violet-400 ring-2 ring-violet-200 bg-violet-50' : 'border-slate-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g} flex items-center justify-center text-lg shadow flex-shrink-0`}>{icon}</div>
            <div className="min-w-0">
              <p className={`text-2xl font-black ${active ? 'text-violet-700' : 'text-slate-900'}`}>{value}</p>
              <p className={`text-[10px] font-semibold ${active ? 'text-violet-500' : 'text-slate-400'}`}>{label}</p>
            </div>
            {active && <span className="ml-auto text-[9px] font-black text-violet-600 bg-violet-100 border border-violet-200 px-1.5 py-0.5 rounded-full flex-shrink-0">ON</span>}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search tasks..." className="flex-1 min-w-40 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] transition-all" />
        {/* My Tasks toggle */}
        <button
          onClick={() => setMyTasksOnly((p) => !p)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
            myTasksOnly
              ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:text-violet-600'
          }`}
        >
          <span>👤</span>
          My Tasks
          {myTasksOnly && <span className="text-[10px] font-black bg-white/20 px-1.5 py-0.5 rounded-full">{myTasks.length}</span>}
        </button>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'ALL')} className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] cursor-pointer">
          <option value="ALL">All Status</option>
          {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'ALL')} className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] cursor-pointer">
          <option value="ALL">All Priority</option>
          {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
        </select>
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">{error}</div>}

      {loadingTasks ? (
        <div className="flex items-center justify-center py-20"><FaSpinner className="animate-spin text-3xl text-[#0b57d0]" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => {
            const cfg = STATUS_CONFIG[status]
            const columnTasks = grouped[status]
            return (
              <div key={status} className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4 space-y-3 min-h-[200px]`}>
                <div className="flex items-center justify-between">
                  <span className={`font-black text-sm ${cfg.color}`}>{cfg.label}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{columnTasks.length}</span>
                </div>
                {columnTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-xs font-semibold text-center">
                    <FaTasks className="text-2xl mb-2 opacity-40" />
                    No {cfg.label.toLowerCase()} tasks
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div key={task.id} className={deletingId === task.id ? 'opacity-50 pointer-events-none' : ''}>
                      <TaskCard task={task} userId={user?.id} userRole={user?.role} onEdit={(t) => { setEditTask(t); setFormError(null) }} onDelete={handleDelete} onStatusChange={handleStatusChange} onProgressChange={handleProgressChange} />
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}

      <TaskFormModal isOpen={showCreateModal} mode="create" members={members} onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} submitting={submitting} />
      <TaskFormModal isOpen={!!editTask} mode="edit" initial={editTask || undefined} members={members} onClose={() => setEditTask(null)} onSubmit={handleEdit} submitting={submitting} />

      {formError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-rose-600 text-white text-sm font-bold rounded-xl shadow-xl">
          {formError}
        </div>
      )}
    </div>
  )
}

export default TaskManagementHub
