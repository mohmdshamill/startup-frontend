import { useState, useEffect, type FC } from 'react'
import {
  FaBell,
  FaTimes,
  FaCheckCircle,
  FaStar,
  FaEye,
  FaTimesCircle,
  FaUserPlus,
  FaInfoCircle,
  FaArrowRight,
  FaCheckDouble,
} from 'react-icons/fa'

export interface NotificationItem {
  id: string
  userId: string
  type: string
  title: string
  message: string
  link?: string | null
  isRead: boolean
  createdAt: string
  updatedAt: string
}

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  token?: string | null
  currentUser?: any | null
  onNavigateToRecruitment?: () => void
  onNavigateToCollaboration?: (startupId?: string) => void
  onUnreadCountChange?: (count: number) => void
}

export const NotificationModal: FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  token,
  currentUser,
  onNavigateToRecruitment,
  onNavigateToCollaboration,
  onUnreadCountChange,
}) => {
  const [activeTab, setActiveTab] = useState<'application' | 'invitation' | 'tasks' | 'messages' | 'announcements'>('application')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  const ECOSYSTEM_ANNOUNCEMENTS = [
    {
      id: 1,
      title: 'Kerala Startup Mission Innovation Grant 2026 Open',
      date: 'Today',
      badge: 'Grants',
      desc: 'Applications open for Idea, Productization, and Scale-up grants up to ₹15 Lakhs for early-stage tech ventures.',
    },
    {
      id: 2,
      title: 'Huddle Global 2026 Beachside Tech Summit Registrations Live',
      date: 'Yesterday',
      badge: 'Events',
      desc: "Join Asia's largest beachside startup conclave featuring 5,000+ founders, 300+ VCs, and tech leaders in Kerala.",
    },
    {
      id: 3,
      title: 'LEAP Centre Workspace Allocations Open in Ernakulam & Kozhikode',
      date: '3 days ago',
      badge: 'LEAP Hubs',
      desc: 'Subsidized state-of-the-art coworking desks with FabLab access now open for onboarding.',
    },
    {
      id: 4,
      title: 'Women Startup Summit Seed Support Scheme Launched',
      date: '5 days ago',
      badge: 'Women In Tech',
      desc: 'Special soft loan and acceleration cohort for women-led deeptech startups in Kerala.',
    },
  ]

  const fetchNotifications = async () => {
    if (!token || !currentUser) return
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
        if (onUnreadCountChange) {
          onUnreadCountChange(data.unreadCount || 0)
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && token) {
      fetchNotifications()
    }
  }, [isOpen, token])

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!token) return

    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
        if (onUnreadCountChange) {
          onUnreadCountChange(Math.max(0, unreadCount - 1))
        }
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!token) return
    setMarkingAll(true)
    try {
      const res = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
        if (onUnreadCountChange) {
          onUnreadCountChange(0)
        }
      }
    } catch (err) {
      console.error('Error marking all as read:', err)
    } finally {
      setMarkingAll(false)
    }
  }

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id)
    }
    onClose()
    if (notif.type === 'NEW_ANNOUNCEMENT' || notif.link?.includes('/collaboration')) {
      const parts = notif.link?.split('/collaboration/')
      const startupId = parts && parts.length > 1 ? parts[1] : undefined
      if (onNavigateToCollaboration) {
        onNavigateToCollaboration(startupId)
        return
      }
    }
    if (onNavigateToRecruitment) {
      onNavigateToRecruitment()
    }
  }

  if (!isOpen) return null

  const getNotificationBadge = (type: string) => {
    if (type.includes('NEW_ANNOUNCEMENT')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold flex items-center gap-1">
          <span>📣</span>
          <span>Announcement</span>
        </span>
      )
    }
    if (type.includes('ACCEPTED')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
          <FaCheckCircle className="text-emerald-600" />
          <span>Accepted</span>
        </span>
      )
    }
    if (type.includes('SHORTLISTED')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold flex items-center gap-1">
          <FaStar className="text-purple-600" />
          <span>Shortlisted</span>
        </span>
      )
    }
    if (type.includes('REVIEWING')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-extrabold flex items-center gap-1">
          <FaEye className="text-sky-600" />
          <span>In Review</span>
        </span>
      )
    }
    if (type.includes('REJECTED')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold flex items-center gap-1">
          <FaTimesCircle className="text-rose-600" />
          <span>Status Update</span>
        </span>
      )
    }
    if (type.includes('APPLICATION_RECEIVED')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0b57d0] text-[10px] font-extrabold flex items-center gap-1">
          <FaUserPlus className="text-[#0b57d0]" />
          <span>New Applicant</span>
        </span>
      )
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold flex items-center gap-1">
        <FaInfoCircle className="text-slate-500" />
        <span>Update</span>
      </span>
    )
  }

  const formatTimeAgo = (dateString: string) => {
    const d = new Date(dateString)
    const now = new Date()
    const diffSecs = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diffSecs < 60) return 'Just now'
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} mins ago`
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)} hours ago`
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)} days ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full my-auto overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0052cc] via-[#0b57d0] to-blue-900 text-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
                <FaBell className="text-amber-300 text-sm" />
              </div>
              <div>
                <h3 className="text-base font-black">Notifications</h3>
                <p className="text-[11px] text-blue-100 font-medium">
                  {unreadCount > 0 ? `${unreadCount} unread recruitment update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 mt-4 bg-black/20 p-1 rounded-2xl backdrop-blur-xs overflow-x-auto whitespace-nowrap hide-scrollbar">
            <button
              onClick={() => setActiveTab('application')}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'application'
                  ? 'bg-white text-[#0b57d0] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Application</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('invitation')}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'invitation'
                  ? 'bg-white text-[#0b57d0] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Invitation</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'bg-white text-[#0b57d0] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Tasks</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'messages'
                  ? 'bg-white text-[#0b57d0] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Messages</span>
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'announcements'
                  ? 'bg-white text-[#0b57d0] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Announcements</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Application Updates */}
        {activeTab === 'application' && (
          <div className="p-4 sm:p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {/* Quick action bar */}
            {currentUser && notifications.length > 0 && (
              <div className="flex items-center justify-between pb-1 text-xs">
                <span className="text-[11px] font-bold text-slate-500">
                  {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={markingAll}
                    className="text-[11px] font-bold text-[#0b57d0] hover:text-[#0047ba] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <FaCheckDouble className="text-[10px]" />
                    <span>Mark all as read</span>
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-xs font-bold text-[#0b57d0] animate-pulse">
                Loading notifications...
              </div>
            ) : !currentUser ? (
              <div className="py-10 text-center space-y-2">
                <span className="text-3xl">🔐</span>
                <h4 className="text-xs font-bold text-slate-800">Please sign in</h4>
                <p className="text-[11px] text-slate-500">
                  Sign in to view your startup applications and live recruitment notifications.
                </p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative group ${
                    notif.isRead
                      ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      : 'bg-blue-50/80 border-blue-200 hover:border-blue-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getNotificationBadge(notif.type)}
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#0b57d0] animate-pulse"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                      {!notif.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          title="Mark as read"
                          className="text-slate-400 hover:text-[#0b57d0] text-xs p-1 rounded-md transition-colors"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-snug">
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-[#0b57d0] group-hover:translate-x-0.5 transition-transform">
                    <span>View in Team Recruitment Hub</span>
                    <FaArrowRight className="text-[10px]" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center space-y-2">
                <span className="text-3xl">📭</span>
                <h4 className="text-xs font-extrabold text-slate-800">No Notifications Yet</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  When you apply to startups or when founders update your application status, you will receive updates here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Invitations */}
        {activeTab === 'invitation' && (
          <div className="p-4 sm:p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="py-12 text-center space-y-2">
              <span className="text-3xl">✉️</span>
              <h4 className="text-xs font-extrabold text-slate-800">No Invitations Yet</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Startup founders can invite you to their team here.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Tasks */}
        {activeTab === 'tasks' && (
          <div className="p-4 sm:p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="py-12 text-center space-y-2">
              <span className="text-3xl">📋</span>
              <h4 className="text-xs font-extrabold text-slate-800">No Task Updates</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Updates regarding your assigned tasks will appear here.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Messages */}
        {activeTab === 'messages' && (
          <div className="p-4 sm:p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="py-12 text-center space-y-2">
              <span className="text-3xl">💬</span>
              <h4 className="text-xs font-extrabold text-slate-800">No New Messages</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                You have no new unread messages.
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Ecosystem Announcements */}
        {activeTab === 'announcements' && (
          <div className="p-4 sm:p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {ECOSYSTEM_ANNOUNCEMENTS.map((notif) => (
              <div
                key={notif.id}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0b57d0] text-[10px] font-bold">
                    {notif.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{notif.date}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{notif.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{notif.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {onNavigateToRecruitment && (
            <button
              onClick={() => {
                onClose()
                onNavigateToRecruitment()
              }}
              className="text-xs font-bold text-[#0b57d0] hover:text-[#0047ba] cursor-pointer"
            >
              Open Team Recruitment Hub →
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-all cursor-pointer ml-auto"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
