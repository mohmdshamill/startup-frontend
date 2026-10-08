import { useState, useEffect, type FC, type ChangeEvent } from 'react'
import teamWorkspaceHero from '../assets/team_workspace_hero.jpg'
import {
  FaLayerGroup,
  FaStickyNote,
  FaBullhorn,
  FaFolderOpen,
  FaUsers,
  FaPlus,
  FaTrash,
  FaEdit,
  FaThumbtack,
  FaDownload,
  FaFileAlt,
  FaExternalLinkAlt,
  FaTimes,
  FaCrown,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaFilePdf,
  FaFileCode,
  FaFileImage,
  FaFileArchive,
  FaRocket,
  FaSyncAlt,
} from 'react-icons/fa'

export interface WorkspaceSummary {
  id: string
  title: string
  tagline: string
  category: string
  stage: string
  founder: {
    id: string
    name: string
    email: string
    avatar?: string | null
    role: string
  }
  roleInWorkspace: 'FOUNDER' | 'TEAM_MEMBER' | 'ADMIN'
  memberRole?: string
  teamMemberCount: number
  notesCount: number
  announcementsCount: number
  filesCount: number
  updatedAt: string
}

export interface WorkspaceMember {
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

export interface WorkspaceNote {
  id: string
  title: string
  content: string
  color: string
  isPinned: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    avatar?: string | null
    role: string
  }
}

export interface WorkspaceAnnouncement {
  id: string
  title: string
  content: string
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT'
  isPinned: boolean
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    avatar?: string | null
    role: string
  }
}

export interface WorkspaceFile {
  id: string
  fileName: string
  fileUrl: string
  fileSize: string
  fileType: string
  category: 'GENERAL' | 'PITCH_DECK' | 'DESIGN' | 'CODE' | 'DOCUMENT'
  description?: string | null
  createdAt: string
  uploader: {
    id: string
    name: string
    avatar?: string | null
    role: string
  }
}

interface CollaborationWorkspaceHubProps {
  user: any
  token: string
  initialStartupId?: string
  onNavigateToStartups?: () => void
  onNavigateToRecruitment?: () => void
  onNavigateToMatching?: () => void
}

export const CollaborationWorkspaceHub: FC<CollaborationWorkspaceHubProps> = ({
  user,
  token,
  initialStartupId,
  onNavigateToStartups,
  onNavigateToRecruitment,
  onNavigateToMatching,
}) => {
  // Navigation & Workspace Selection
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([])
  const [selectedStartupId, setSelectedStartupId] = useState<string>(initialStartupId || '')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notes' | 'announcements' | 'files' | 'members'>('dashboard')
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Current Workspace Data
  const [currentStartup, setCurrentStartup] = useState<any | null>(null)
  const [userRoleInWorkspace, setUserRoleInWorkspace] = useState<string>('')
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [notes, setNotes] = useState<WorkspaceNote[]>([])
  const [announcements, setAnnouncements] = useState<WorkspaceAnnouncement[]>([])
  const [files, setFiles] = useState<WorkspaceFile[]>([])
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalNotes: 0,
    totalAnnouncements: 0,
    totalFiles: 0,
  })

  // Modals
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [editingNote, setEditingNote] = useState<WorkspaceNote | null>(null)
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false)
  const [showUploadFileModal, setShowUploadFileModal] = useState(false)
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<WorkspaceMember | null>(null)

  // Form States
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    color: 'blue',
    isPinned: false,
    tagInput: '',
    tags: [] as string[],
  })

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'NORMAL' as 'NORMAL' | 'IMPORTANT' | 'URGENT',
    isPinned: false,
  })

  const [fileForm, setFileForm] = useState({
    fileName: '',
    category: 'GENERAL' as 'GENERAL' | 'PITCH_DECK' | 'DESIGN' | 'CODE' | 'DOCUMENT',
    description: '',
    fileData: '',
    fileSize: '',
    fileType: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [fileCategoryFilter, setFileCategoryFilter] = useState<string>('ALL')

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // 1. Fetch user workspaces
  const fetchWorkspaces = async () => {
    if (!token) return
    setLoadingWorkspaces(true)
    try {
      const res = await fetch('http://localhost:5000/api/collaboration/my-workspaces', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setWorkspaces(data.workspaces || [])
        if (data.workspaces && data.workspaces.length > 0) {
          // If initialStartupId is set and valid, select it; otherwise select first
          if (initialStartupId && data.workspaces.some((w: any) => w.id === initialStartupId)) {
            setSelectedStartupId(initialStartupId)
          } else if (!selectedStartupId || !data.workspaces.some((w: any) => w.id === selectedStartupId)) {
            setSelectedStartupId(data.workspaces[0].id)
          }
        } else {
          setSelectedStartupId('')
        }
      }
    } catch (err: any) {
      console.error('Error loading workspaces:', err)
    } finally {
      setLoadingWorkspaces(false)
    }
  }

  // 2. Fetch details for selected workspace
  const fetchWorkspaceDetails = async (startupId: string) => {
    if (!token || !startupId) return
    setLoadingDetails(true)
    try {
      const res = await fetch(`http://localhost:5000/api/collaboration/workspace/${startupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setCurrentStartup(data.startup)
        setUserRoleInWorkspace(data.userRoleInWorkspace)
        setMembers(data.members || [])
        setNotes(data.notes || [])
        setAnnouncements(data.announcements || [])
        setFiles(data.files || [])
        if (data.stats) setStats(data.stats)
      } else {
        showToast(data.error || 'Failed to load workspace.', 'error')
      }
    } catch (err: any) {
      console.error('Error loading workspace details:', err)
      showToast('Connection error loading workspace.', 'error')
    } finally {
      setLoadingDetails(false)
    }
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [token])

  useEffect(() => {
    if (selectedStartupId) {
      fetchWorkspaceDetails(selectedStartupId)
    } else {
      setCurrentStartup({
        id: 'default-workspace',
        title: user?.name ? `${user.name}'s Startup Workspace` : 'My Startup Workspace',
        tagline: 'Team dashboard, meeting notes, announcements, file sharing, and member list.',
        category: 'Startup Team',
        stage: 'IDEATION',
        founder: {
          id: user?.id || 'me',
          name: user?.name || 'Founder User',
          email: user?.email || '',
          avatar: user?.avatar,
          role: user?.role || 'FOUNDER',
        },
        description: 'Welcome to your startup team collaboration workspace! Post a startup idea to start receiving applications and building your team.',
      })
      setUserRoleInWorkspace(user?.role === 'FOUNDER' || user?.role === 'ADMIN' ? 'FOUNDER' : 'TEAM_MEMBER')
      setMembers([
        {
          id: user?.id || 'me',
          name: user?.name || 'Founder User',
          email: user?.email || '',
          avatar: user?.avatar,
          role: user?.role || 'FOUNDER',
          startupRole: user?.role === 'FOUNDER' || user?.role === 'ADMIN' ? 'Founder & Team Lead' : 'Team Member',
          isFounder: true,
          joinedAt: new Date().toISOString(),
          skills: Array.isArray(user?.skills) && user.skills.length > 0 ? user.skills : ['Product Strategy', 'Management'],
          location: user?.location || 'Kerala, India',
        },
      ])
      setNotes([])
      setAnnouncements([])
      setFiles([])
      setStats({
        totalMembers: 1,
        totalNotes: 0,
        totalAnnouncements: 0,
        totalFiles: 0,
      })
    }
  }, [selectedStartupId, token, user])

  // NOTE ACTIONS
  const handleSaveNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      showToast('Please enter both note title and content.', 'error')
      return
    }

    if (!selectedStartupId || selectedStartupId === 'default-workspace') {
      const newNote: WorkspaceNote = {
        id: `local-note-${Date.now()}`,
        title: noteForm.title.trim(),
        content: noteForm.content.trim(),
        color: noteForm.color,
        isPinned: noteForm.isPinned,
        tags: noteForm.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: user?.id || 'me',
          name: user?.name || 'You',
          avatar: user?.avatar,
          role: user?.role || 'FOUNDER',
        },
      }
      setNotes((prev) => [newNote, ...prev])
      setStats((prev) => ({ ...prev, totalNotes: prev.totalNotes + 1 }))
      setShowAddNoteModal(false)
      setEditingNote(null)
      setNoteForm({ title: '', content: '', color: 'blue', isPinned: false, tagInput: '', tags: [] })
      showToast('Note added to workspace.')
      return
    }

    setSubmitting(true)
    try {
      if (editingNote) {
        // Update Note
        const res = await fetch(`http://localhost:5000/api/collaboration/notes/${editingNote.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: noteForm.title,
            content: noteForm.content,
            color: noteForm.color,
            isPinned: noteForm.isPinned,
            tags: noteForm.tags,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to update note.')
        showToast('Note updated successfully.')
      } else {
        // Create Note
        const res = await fetch(`http://localhost:5000/api/collaboration/workspace/${selectedStartupId}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: noteForm.title,
            content: noteForm.content,
            color: noteForm.color,
            isPinned: noteForm.isPinned,
            tags: noteForm.tags,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create note.')
        showToast('Note added to workspace.')
      }

      setShowAddNoteModal(false)
      setEditingNote(null)
      setNoteForm({ title: '', content: '', color: 'blue', isPinned: false, tagInput: '', tags: [] })
      fetchWorkspaceDetails(selectedStartupId)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return
    if (noteId.startsWith('local-') || !selectedStartupId || selectedStartupId === 'default-workspace') {
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      setStats((prev) => ({ ...prev, totalNotes: Math.max(0, prev.totalNotes - 1) }))
      showToast('Note deleted.')
      return
    }
    try {
      const res = await fetch(`http://localhost:5000/api/collaboration/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Note deleted.')
        fetchWorkspaceDetails(selectedStartupId)
      }
    } catch (err) {
      showToast('Failed to delete note.', 'error')
    }
  }

  const handleTogglePinNote = async (noteId: string) => {
    if (noteId.startsWith('local-') || !selectedStartupId || selectedStartupId === 'default-workspace') {
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n))
      )
      return
    }
    try {
      await fetch(`http://localhost:5000/api/collaboration/notes/${noteId}/pin`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchWorkspaceDetails(selectedStartupId)
    } catch (err) {
      console.error(err)
    }
  }

  // ANNOUNCEMENT ACTIONS
  const handlePublishAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      showToast('Please enter announcement title and details.', 'error')
      return
    }

    if (!selectedStartupId || selectedStartupId === 'default-workspace') {
      const newAnn: WorkspaceAnnouncement = {
        id: `local-ann-${Date.now()}`,
        title: announcementForm.title.trim(),
        content: announcementForm.content.trim(),
        priority: announcementForm.priority,
        isPinned: announcementForm.isPinned,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: user?.id || 'me',
          name: user?.name || 'You',
          avatar: user?.avatar,
          role: user?.role || 'FOUNDER',
        },
      }
      setAnnouncements((prev) => [newAnn, ...prev])
      setStats((prev) => ({ ...prev, totalAnnouncements: prev.totalAnnouncements + 1 }))
      setShowAddAnnouncementModal(false)
      setAnnouncementForm({ title: '', content: '', priority: 'NORMAL', isPinned: false })
      showToast('Announcement posted! 📣')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`http://localhost:5000/api/collaboration/workspace/${selectedStartupId}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(announcementForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to publish announcement.')

      showToast('Announcement posted & team notified! 📣')
      setShowAddAnnouncementModal(false)
      setAnnouncementForm({ title: '', content: '', priority: 'NORMAL', isPinned: false })
      fetchWorkspaceDetails(selectedStartupId)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!window.confirm('Delete this announcement?')) return
    if (announcementId.startsWith('local-') || !selectedStartupId || selectedStartupId === 'default-workspace') {
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId))
      setStats((prev) => ({ ...prev, totalAnnouncements: Math.max(0, prev.totalAnnouncements - 1) }))
      showToast('Announcement removed.')
      return
    }
    try {
      const res = await fetch(`http://localhost:5000/api/collaboration/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Announcement removed.')
        fetchWorkspaceDetails(selectedStartupId)
      }
    } catch (err) {
      showToast('Failed to delete announcement.', 'error')
    }
  }

  // FILE SHARING ACTIONS
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 20 * 1024 * 1024) {
      showToast('File size exceeds 20MB limit.', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      let sizeFormatted = `${(file.size / 1024).toFixed(1)} KB`
      if (file.size > 1024 * 1024) {
        sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      }

      setFileForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileData: base64,
        fileSize: sizeFormatted,
        fileType: file.type || 'application/octet-stream',
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleUploadFile = async () => {
    if (!fileForm.fileName || !fileForm.fileData) {
      showToast('Please select a file to upload.', 'error')
      return
    }

    if (!selectedStartupId || selectedStartupId === 'default-workspace') {
      const newFile: WorkspaceFile = {
        id: `local-file-${Date.now()}`,
        fileName: fileForm.fileName,
        fileUrl: fileForm.fileData,
        fileSize: fileForm.fileSize || '100 KB',
        fileType: fileForm.fileType || 'application/octet-stream',
        category: fileForm.category,
        description: fileForm.description,
        createdAt: new Date().toISOString(),
        uploader: {
          id: user?.id || 'me',
          name: user?.name || 'You',
          avatar: user?.avatar,
          role: user?.role || 'FOUNDER',
        },
      }
      setFiles((prev) => [newFile, ...prev])
      setStats((prev) => ({ ...prev, totalFiles: prev.totalFiles + 1 }))
      setShowUploadFileModal(false)
      setFileForm({
        fileName: '',
        category: 'GENERAL',
        description: '',
        fileData: '',
        fileSize: '',
        fileType: '',
      })
      showToast('File shared with team.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`http://localhost:5000/api/collaboration/workspace/${selectedStartupId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fileForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload file.')

      showToast('File shared with team.')
      setShowUploadFileModal(false)
      setFileForm({
        fileName: '',
        category: 'GENERAL',
        description: '',
        fileData: '',
        fileSize: '',
        fileType: '',
      })
      fetchWorkspaceDetails(selectedStartupId)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this shared file?')) return
    if (fileId.startsWith('local-') || !selectedStartupId || selectedStartupId === 'default-workspace') {
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
      setStats((prev) => ({ ...prev, totalFiles: Math.max(0, prev.totalFiles - 1) }))
      showToast('File removed.')
      return
    }
    try {
      const res = await fetch(`http://localhost:5000/api/collaboration/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('File removed.')
        fetchWorkspaceDetails(selectedStartupId)
      }
    } catch (err) {
      showToast('Failed to delete file.', 'error')
    }
  }

  // File Icon Helper
  const getFileIcon = (fileName: string, category: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    if (ext === 'pdf' || category === 'PITCH_DECK') return <FaFilePdf className="text-red-500 text-2xl" />
    if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(ext) || category === 'DESIGN')
      return <FaFileImage className="text-emerald-500 text-2xl" />
    if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return <FaFileArchive className="text-amber-500 text-2xl" />
    if (['js', 'ts', 'tsx', 'jsx', 'py', 'json', 'html', 'css'].includes(ext) || category === 'CODE')
      return <FaFileCode className="text-blue-500 text-2xl" />
    return <FaFileAlt className="text-indigo-500 text-2xl" />
  }

  // Note Color Styles
  const getNoteStyle = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-emerald-100/50'
      case 'amber':
        return 'bg-amber-50/90 border-amber-200 text-amber-950 shadow-amber-100/50'
      case 'purple':
        return 'bg-purple-50/90 border-purple-200 text-purple-950 shadow-purple-100/50'
      case 'rose':
        return 'bg-rose-50/90 border-rose-200 text-rose-950 shadow-rose-100/50'
      case 'blue':
      default:
        return 'bg-blue-50/90 border-blue-200 text-blue-950 shadow-blue-100/50'
    }
  }

  const activeWorkspace = workspaces.find((w) => w.id === selectedStartupId)

  // Empty State if user is not in any accepted startup team workspace
  if (!loadingWorkspaces && workspaces.length === 0) {
    const isFounderUser = user?.role === 'FOUNDER' || user?.role === 'ADMIN'

    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-xl overflow-hidden text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-3xl text-indigo-300 mx-auto">
            {isFounderUser ? <FaRocket /> : <FaUsers />}
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {isFounderUser ? 'Post Your Startup Idea to Unlock Workspace' : 'Not Currently Part of a Startup Team'}
          </h2>

          <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl mx-auto leading-relaxed">
            {isFounderUser
              ? 'Post your startup idea to receive candidate applications, build your team in Kerala, and manage team sprint notes, announcements, and files.'
              : 'Apply to startup ideas in the Skill Matching Hub or Startup Directory. Once a founder accepts your application, your startup team workspace will be unlocked here!'}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {isFounderUser ? (
              onNavigateToStartups && (
                <button
                  onClick={onNavigateToStartups}
                  className="px-6 py-3 rounded-xl bg-white text-[#0b57d0] hover:bg-blue-50 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FaRocket />
                  <span>+ Post Startup Idea</span>
                </button>
              )
            ) : (
              <>
                {onNavigateToMatching && (
                  <button
                    onClick={onNavigateToMatching}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>⚡</span>
                    <span>Skill Matching Hub</span>
                  </button>
                )}
                {onNavigateToStartups && (
                  <button
                    onClick={onNavigateToStartups}
                    className="px-5 py-3 rounded-xl bg-white text-[#0b57d0] hover:bg-blue-50 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FaRocket />
                    <span>Browse Startup Ideas</span>
                  </button>
                )}
                {onNavigateToRecruitment && (
                  <button
                    onClick={onNavigateToRecruitment}
                    className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FaUsers />
                    <span>Track My Submitted Applications</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-2xl">📝</span>
            <h3 className="text-sm font-black text-slate-900">Sprint & Meeting Notes</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Collaborate on meeting records, project roadmaps, and ideas synced with your founder and teammates.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-2xl">📣</span>
            <h3 className="text-sm font-black text-slate-900">Team Announcements</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              View official announcements and milestone updates broadcast directly by the startup founder.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-2xl">📁</span>
            <h3 className="text-sm font-black text-slate-900">File & Asset Sharing</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Access pitch decks, design prototypes, technical specs, and code files shared inside your team.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500 text-white border-emerald-600'
              : 'bg-rose-500 text-white border-rose-600'
          }`}
        >
          <span>{toastMessage.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Startup Creation Notice if user has no startup ideas yet */}
      {workspaces.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚀</span>
            <div>
              <h4 className="text-xs font-black text-amber-950">You haven't posted your startup idea yet</h4>
              <p className="text-[11px] text-amber-800 font-medium">
                Post your startup idea to receive candidate applications and sync team workspace data automatically.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateToMatching && (
              <button
                onClick={onNavigateToMatching}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡ Skill Matching</span>
              </button>
            )}
            {onNavigateToStartups && (
              <button
                onClick={onNavigateToStartups}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                + Post Startup Idea
              </button>
            )}
          </div>
        </div>
      )}

      {loadingWorkspaces && (
        <div className="py-2 text-center text-xs font-bold text-indigo-600 animate-pulse">
          Syncing workspace items...
        </div>
      )}

      {/* Top Banner & Workspace Selector Header - Slate Space Studio Theme with Photorealistic Hero Background */}
      <div className="relative rounded-3xl text-white shadow-2xl overflow-hidden border border-slate-800 bg-slate-950 min-h-[220px]">
        {/* Photorealistic Hero Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
          style={{ backgroundImage: `url(${teamWorkspaceHero})` }}
        />
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-blue-950/60 backdrop-blur-[2px]" />

        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 backdrop-blur-md border border-blue-400/40 text-xs font-extrabold text-blue-200 uppercase tracking-wider shadow-sm">
              <FaLayerGroup className="text-blue-400 text-xs" />
              <span>Virtual Team Studio Workspace</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                {currentStartup?.title || 'Collaboration Workspace'}
              </h2>
              {activeWorkspace && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs flex items-center gap-1.5 border border-blue-400/30">
                  {activeWorkspace.roleInWorkspace === 'FOUNDER' ? <FaCrown className="text-amber-300 text-xs" /> : <FaUsers className="text-xs" />}
                  <span>{activeWorkspace.roleInWorkspace === 'FOUNDER' ? 'Founder Workspace' : 'Team Member'}</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal max-w-xl">
              {currentStartup?.tagline || 'Team dashboard, meeting notes, announcements, file sharing, and member list.'}
            </p>
          </div>

          {/* Workspace Switcher & Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {workspaces.length > 1 && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-300 block tracking-wider">Switch Startup:</label>
                <select
                  value={selectedStartupId}
                  onChange={(e) => setSelectedStartupId(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-white/20 text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-lg"
                >
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id} className="text-slate-900 font-semibold">
                      {w.title} ({w.roleInWorkspace === 'FOUNDER' ? 'Founder' : 'Member'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => fetchWorkspaceDetails(selectedStartupId)}
              className="self-end sm:self-auto px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-white/20 shadow-lg"
            >
              <FaSyncAlt className="text-xs" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-white text-[#0b57d0] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaLayerGroup className={activeTab === 'dashboard' ? 'text-[#0b57d0]' : 'text-slate-400'} />
            <span>Team Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'notes'
                ? 'bg-white text-[#0b57d0] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaStickyNote className={activeTab === 'notes' ? 'text-[#0b57d0]' : 'text-slate-400'} />
            <span>Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'announcements'
                ? 'bg-white text-[#0b57d0] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaBullhorn className={activeTab === 'announcements' ? 'text-[#0b57d0]' : 'text-slate-400'} />
            <span>Announcements</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'files'
                ? 'bg-white text-[#0b57d0] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaFolderOpen className={activeTab === 'files' ? 'text-[#0b57d0]' : 'text-slate-400'} />
            <span>File Sharing</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'members'
                ? 'bg-white text-[#0b57d0] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaUsers className={activeTab === 'members' ? 'text-[#0b57d0]' : 'text-slate-400'} />
            <span>Member List</span>
          </button>
        </div>

        {/* Quick Action Button for current tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'notes' && (
            <button
              onClick={() => {
                setEditingNote(null)
                setNoteForm({ title: '', content: '', color: 'blue', isPinned: false, tagInput: '', tags: [] })
                setShowAddNoteModal(true)
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FaPlus />
              <span>+ Add Note</span>
            </button>
          )}

          {activeTab === 'announcements' && (
            <button
              onClick={() => setShowAddAnnouncementModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FaBullhorn />
              <span>+ Post Announcement</span>
            </button>
          )}

          {activeTab === 'files' && (
            <button
              onClick={() => setShowUploadFileModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FaPlus />
              <span>+ Share File</span>
            </button>
          )}
        </div>
      </div>

      {loadingDetails && (
        <div className="py-12 text-center text-xs font-bold text-[#0b57d0] animate-pulse">
          Loading workspace components...
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DASHBOARD VIEW                                                         */}
      {/* ========================================================================= */}
      {!loadingDetails && activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('members')}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-indigo-400 transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-indigo-600">
                <span className="text-[10px] font-black uppercase text-slate-400">Team Size</span>
                <FaUsers className="text-sm" />
              </div>
              <span className="text-3xl font-black text-slate-900 block">{stats.totalMembers}</span>
              <span className="text-[11px] text-slate-500 font-medium">Founder + Accepted members</span>
            </div>

            <div
              onClick={() => setActiveTab('notes')}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-[10px] font-black uppercase text-slate-400">Team Notes</span>
                <FaStickyNote className="text-sm" />
              </div>
              <span className="text-3xl font-black text-slate-900 block">{stats.totalNotes}</span>
              <span className="text-[11px] text-slate-500 font-medium">Sprint docs & ideas</span>
            </div>

            <div
              onClick={() => setActiveTab('announcements')}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-purple-400 transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-[10px] font-black uppercase text-slate-400">Announcements</span>
                <FaBullhorn className="text-sm" />
              </div>
              <span className="text-3xl font-black text-slate-900 block">{stats.totalAnnouncements}</span>
              <span className="text-[11px] text-slate-500 font-medium">Broadcast updates</span>
            </div>

            <div
              onClick={() => setActiveTab('files')}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-[10px] font-black uppercase text-slate-400">Shared Files</span>
                <FaFolderOpen className="text-sm" />
              </div>
              <span className="text-3xl font-black text-slate-900 block">{stats.totalFiles}</span>
              <span className="text-[11px] text-slate-500 font-medium">Decks & documents</span>
            </div>
          </div>

          {/* Startup Overview & Pinned Announcement */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Startup Project Info Card */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800">
                    {currentStartup?.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800">
                    Stage: {currentStartup?.stage}
                  </span>
                </div>
                {currentStartup?.websiteUrl && (
                  <a
                    href={currentStartup.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#0b57d0] hover:underline flex items-center gap-1"
                  >
                    <span>Website</span>
                    <FaExternalLinkAlt className="text-[10px]" />
                  </a>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">{currentStartup?.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {currentStartup?.description}
                </p>
              </div>

              {currentStartup?.targetMarket && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Target Market: </span>
                  {currentStartup.targetMarket}
                </div>
              )}

              {/* Skills Tags */}
              {currentStartup?.requiredSkills && currentStartup.requiredSkills.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Core Skills Required:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentStartup.requiredSkills.map((sk: string) => (
                      <span
                        key={sk}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions & Recent Announcement Card */}
            <div className="space-y-6">
              {/* Quick Actions Panel */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm space-y-3">
                <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wide">Workspace Shortcuts</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('notes')
                      setShowAddNoteModal(true)
                    }}
                    className="p-3 rounded-2xl bg-white border border-indigo-200 text-indigo-950 font-bold text-xs hover:shadow-xs transition-all text-left flex items-center gap-2 cursor-pointer"
                  >
                    <FaStickyNote className="text-blue-600" />
                    <span>+ New Note</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('announcements')
                      setShowAddAnnouncementModal(true)
                    }}
                    className="p-3 rounded-2xl bg-white border border-indigo-200 text-indigo-950 font-bold text-xs hover:shadow-xs transition-all text-left flex items-center gap-2 cursor-pointer"
                  >
                    <FaBullhorn className="text-purple-600" />
                    <span>+ Announce</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('files')
                      setShowUploadFileModal(true)
                    }}
                    className="p-3 rounded-2xl bg-white border border-indigo-200 text-indigo-950 font-bold text-xs hover:shadow-xs transition-all text-left flex items-center gap-2 cursor-pointer"
                  >
                    <FaFolderOpen className="text-emerald-600" />
                    <span>+ Share File</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('members')}
                    className="p-3 rounded-2xl bg-white border border-indigo-200 text-indigo-950 font-bold text-xs hover:shadow-xs transition-all text-left flex items-center gap-2 cursor-pointer"
                  >
                    <FaUsers className="text-indigo-600" />
                    <span>Team ({members.length})</span>
                  </button>
                </div>
              </div>

              {/* Latest Announcement Widget */}
              {announcements.length > 0 && (
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-400">Latest Announcement</span>
                    <button
                      onClick={() => setActiveTab('announcements')}
                      className="text-xs font-bold text-[#0b57d0] hover:underline cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-slate-900">{announcements[0].title}</h5>
                    <p className="text-xs text-slate-600 line-clamp-2">{announcements[0].content}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Posted by {announcements[0].author.name} • {new Date(announcements[0].createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. NOTES VIEW                                                             */}
      {/* ========================================================================= */}
      {!loadingDetails && activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Sprint & Meeting Notes</h3>
              <p className="text-xs text-slate-500 font-normal">
                Jot down ideas, meeting minutes, and architectural decisions. Pinned notes stay at the top.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingNote(null)
                setNoteForm({ title: '', content: '', color: 'blue', isPinned: false, tagInput: '', tags: [] })
                setShowAddNoteModal(true)
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
            >
              <FaPlus />
              <span>+ Add Note</span>
            </button>
          </div>

          {notes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-4xl block">📝</span>
              <h4 className="text-base font-bold text-slate-800">No notes written yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create the first note for this startup to share meeting goals or project ideas.
              </p>
              <button
                onClick={() => setShowAddNoteModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#0b57d0] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                + Create First Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-6 rounded-3xl border shadow-xs flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${getNoteStyle(
                    note.color
                  )}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {note.isPinned && (
                          <span className="p-1 rounded-md bg-amber-200/80 text-amber-900 text-xs" title="Pinned Note">
                            <FaThumbtack />
                          </span>
                        )}
                        <h4 className="text-base font-bold text-slate-900 leading-snug">{note.title}</h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePinNote(note.id)}
                          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            note.isPinned ? 'text-amber-700 bg-amber-200/60' : 'text-slate-400 hover:bg-black/5'
                          }`}
                          title={note.isPinned ? 'Unpin Note' : 'Pin Note to Top'}
                        >
                          <FaThumbtack />
                        </button>
                        <button
                          onClick={() => {
                            setEditingNote(note)
                            setNoteForm({
                              title: note.title,
                              content: note.content,
                              color: note.color,
                              isPinned: note.isPinned,
                              tagInput: '',
                              tags: note.tags || [],
                            })
                            setShowAddNoteModal(true)
                          }}
                          className="p-1.5 rounded-lg text-xs text-slate-500 hover:bg-black/5 transition-colors cursor-pointer"
                          title="Edit Note"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 rounded-lg text-xs text-rose-500 hover:bg-rose-100/50 transition-colors cursor-pointer"
                          title="Delete Note"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-normal">
                      {note.content}
                    </p>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {note.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-white/60 border border-black/5 text-[10px] font-bold text-slate-700"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold">{note.author.name}</span>
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ANNOUNCEMENTS VIEW                                                     */}
      {/* ========================================================================= */}
      {!loadingDetails && activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Broadcast Announcements</h3>
              <p className="text-xs text-slate-500 font-normal">
                Official notices for the team. Team members get instant notifications when you publish.
              </p>
            </div>

            <button
              onClick={() => setShowAddAnnouncementModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
            >
              <FaBullhorn />
              <span>+ Post Announcement</span>
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-4xl block">📣</span>
              <h4 className="text-base font-bold text-slate-800">No announcements posted yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Share kickoff schedules, feature milestones, or urgent team alerts.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    ann.priority === 'URGENT'
                      ? 'bg-rose-50/70 border-rose-200'
                      : ann.priority === 'IMPORTANT'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex items-center gap-2">
                        {ann.priority === 'URGENT' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase">
                            🚨 Urgent
                          </span>
                        )}
                        {ann.priority === 'IMPORTANT' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white uppercase">
                            ⭐ Important
                          </span>
                        )}
                        <h4 className="text-base font-black text-slate-900">{ann.title}</h4>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                        {ann.content}
                      </p>

                      <div className="pt-2 flex items-center gap-3 text-xs text-slate-500">
                        <span className="font-bold text-slate-900">👤 {ann.author.name}</span>
                        <span>•</span>
                        <span>📅 {new Date(ann.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-2 rounded-xl text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Announcement"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SHARED FILES VIEW                                                      */}
      {/* ========================================================================= */}
      {!loadingDetails && activeTab === 'files' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Shared Project Files</h3>
              <p className="text-xs text-slate-500 font-normal">
                Store pitch decks, UI designs, technical specifications, and legal docs in one place.
              </p>
            </div>

            <button
              onClick={() => setShowUploadFileModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
            >
              <FaPlus />
              <span>+ Share File</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PITCH_DECK', 'DESIGN', 'DOCUMENT', 'CODE', 'GENERAL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFileCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  fileCategoryFilter === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {files.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-4xl block">📁</span>
              <h4 className="text-base font-bold text-slate-800">No files uploaded yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Share your pitch deck, prototypes, or documentation with the team.
              </p>
              <button
                onClick={() => setShowUploadFileModal(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                + Upload First File
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files
                .filter((f) => fileCategoryFilter === 'ALL' || f.category === fileCategoryFilter)
                .map((file) => (
                  <div
                    key={file.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                            {getFileIcon(file.fileName, file.category)}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1" title={file.fileName}>
                              {file.fileName}
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {file.category.replace('_', ' ')} • {file.fileSize}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete File"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>

                      {file.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">{file.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400">By {file.uploader.name}</span>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FaDownload className="text-[10px]" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MEMBERS VIEW                                                           */}
      {/* ========================================================================= */}
      {!loadingDetails && activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Team Directory ({members.length})</h3>
              <p className="text-xs text-slate-500 font-normal">
                All approved team members and founders collaborating on this startup.
              </p>
            </div>

            {userRoleInWorkspace === 'FOUNDER' && onNavigateToRecruitment && (
              <button
                onClick={onNavigateToRecruitment}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#0b57d0] font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
              >
                <FaUsers />
                <span>Manage Applicants</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {members.map((member) => (
              <div
                key={member.id}
                className={`p-6 rounded-3xl border shadow-sm space-y-4 transition-all bg-white ${
                  member.isFounder ? 'border-indigo-200 ring-1 ring-indigo-500/10' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[#0b57d0] text-white font-black text-xl flex items-center justify-center">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{member.name}</h4>
                      {member.isFounder && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black flex items-center gap-1">
                          <FaCrown className="text-[9px]" />
                          <span>Founder</span>
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-indigo-700 block">
                      {member.startupRole}
                    </span>

                    <span className="text-[11px] text-slate-400 block">
                      Member since {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Skills Badges */}
                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {member.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold"
                      >
                        {s}
                      </span>
                    ))}
                    {member.skills.length > 4 && (
                      <span className="text-[10px] font-bold text-slate-400 self-center">
                        +{member.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Contact & Profile Links */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        title={`Email: ${member.email}`}
                      >
                        <FaEnvelope />
                      </a>
                    )}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                        title={`Call: ${member.phone}`}
                      >
                        <FaPhone />
                      </a>
                    )}
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-sky-100 hover:text-sky-700 transition-colors"
                        title="LinkedIn"
                      >
                        <FaLinkedin />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedMemberDetail(member)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT NOTE                                                  */}
      {/* ========================================================================= */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingNote ? 'Edit Note' : 'Add Team Note'}
              </h3>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Sprint Goals or Architecture Review"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Content</label>
                <textarea
                  rows={5}
                  placeholder="Write your note details here..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
                />
              </div>

              {/* Color Selector */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Note Color</label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'blue', bg: 'bg-blue-200', border: 'border-blue-400' },
                    { id: 'emerald', bg: 'bg-emerald-200', border: 'border-emerald-400' },
                    { id: 'amber', bg: 'bg-amber-200', border: 'border-amber-400' },
                    { id: 'purple', bg: 'bg-purple-200', border: 'border-purple-400' },
                    { id: 'rose', bg: 'bg-rose-200', border: 'border-rose-400' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNoteForm({ ...noteForm, color: c.id })}
                      className={`w-7 h-7 rounded-full ${c.bg} border-2 ${
                        noteForm.color === c.id ? 'ring-2 ring-slate-900' : 'border-transparent'
                      } cursor-pointer`}
                    />
                  ))}
                </div>
              </div>

              {/* Pin Checkbox */}
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noteForm.isPinned}
                  onChange={(e) => setNoteForm({ ...noteForm, isPinned: e.target.checked })}
                  className="rounded border-slate-300 text-[#0b57d0] focus:ring-[#0b57d0]"
                />
                <span>📌 Pin note to top of workspace</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleSaveNote}
                className="px-6 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                {submitting ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: POST ANNOUNCEMENT                                                */}
      {/* ========================================================================= */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Broadcast Announcement</h3>
              <button
                onClick={() => setShowAddAnnouncementModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Sprint 2 Demo Tomorrow at 3 PM"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Details & Agenda</label>
                <textarea
                  rows={4}
                  placeholder="Provide all details for your team..."
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Priority Level</label>
                <select
                  value={announcementForm.priority}
                  onChange={(e: any) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="NORMAL">Normal Notice</option>
                  <option value="IMPORTANT">Important Update</option>
                  <option value="URGENT">🚨 Urgent Alert</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddAnnouncementModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handlePublishAnnouncement}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                {submitting ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: UPLOAD / SHARE FILE                                              */}
      {/* ========================================================================= */}
      {showUploadFileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Share File with Team</h3>
              <button
                onClick={() => setShowUploadFileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Choose File</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
                {fileForm.fileName && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">
                    Selected: {fileForm.fileName} ({fileForm.fileSize})
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Category</label>
                <select
                  value={fileForm.category}
                  onChange={(e: any) => setFileForm({ ...fileForm, category: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="GENERAL">General File</option>
                  <option value="PITCH_DECK">Pitch Deck / Presentation</option>
                  <option value="DESIGN">Design Mockup / UI Asset</option>
                  <option value="DOCUMENT">Documentation / Spec / Contract</option>
                  <option value="CODE">Source Code / Archive</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Short Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Latest Figma wireframe export v2"
                  value={fileForm.description}
                  onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowUploadFileModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={submitting || !fileForm.fileData}
                onClick={handleUploadFile}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Uploading...' : 'Upload & Share'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MEMBER DETAIL INSPECTION MODAL                                   */}
      {/* ========================================================================= */}
      {selectedMemberDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 relative">
              <button
                onClick={() => setSelectedMemberDetail(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <FaTimes />
              </button>

              <div className="flex items-center gap-4">
                {selectedMemberDetail.avatar ? (
                  <img
                    src={selectedMemberDetail.avatar}
                    alt={selectedMemberDetail.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center">
                    {selectedMemberDetail.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black">{selectedMemberDetail.name}</h3>
                  <span className="text-xs text-indigo-200 font-bold block">
                    {selectedMemberDetail.startupRole}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {selectedMemberDetail.isFounder ? 'Founder' : 'Team Member'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">Email:</span>
                  <a href={`mailto:${selectedMemberDetail.email}`} className="text-[#0b57d0] font-bold hover:underline">
                    {selectedMemberDetail.email}
                  </a>
                </p>
                {selectedMemberDetail.phone && (
                  <p className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">Phone:</span>
                    <span>{selectedMemberDetail.phone}</span>
                  </p>
                )}
                {selectedMemberDetail.location && (
                  <p className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">Location:</span>
                    <span>{selectedMemberDetail.location}</span>
                  </p>
                )}
              </div>

              {selectedMemberDetail.skills && selectedMemberDetail.skills.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedMemberDetail.skills.map((s) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-lg bg-slate-100 font-bold text-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedMemberDetail(null)}
                className="px-5 py-2 rounded-xl bg-[#0b57d0] text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
