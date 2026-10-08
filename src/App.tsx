import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { ProgramsSchemesSection } from './components/ProgramsSchemesSection'
import { SectoralInsightsSection } from './components/SectoralInsightsSection'
import { StartupsHeadlineSection } from './components/StartupsHeadlineSection'
import { AuthModal } from './components/AuthModal'
import { ForgotPasswordModal } from './components/ForgotPasswordModal'
import { SearchModal } from './components/SearchModal'
import { NotificationModal } from './components/NotificationModal'
import { AccessibilityWidget } from './components/AccessibilityWidget'
import { StartupIdeaManagement } from './components/StartupIdeaManagement'
import { UserProfileDashboard } from './components/UserProfileDashboard'
import { TeamRecruitmentHub } from './components/TeamRecruitmentHub'
import { SkillMatchingHub } from './components/SkillMatchingHub'
import { CollaborationWorkspaceHub } from './components/CollaborationWorkspaceHub'
import { TaskManagementHub } from './components/TaskManagementHub'
import { PitchDeckBuilder } from './components/PitchDeckBuilder'
import { InvestorDashboard } from './components/InvestorDashboard'
import { Logo } from './components/Logo'
import { FaRocket, FaUserAlt, FaHome, FaTimes, FaUsers, FaBolt, FaLayerGroup, FaTasks } from 'react-icons/fa'

export function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Navigation: 'portal' | 'startups' | 'matching' | 'recruitment' | 'collaboration' | 'tasks' | 'pitchdeck' | 'investors' | 'profile'
  const [workspaceView, setWorkspaceView] = useState<'portal' | 'startups' | 'matching' | 'recruitment' | 'collaboration' | 'tasks' | 'pitchdeck' | 'investors' | 'profile'>('portal')
  const [recruitmentStartupFilter, setRecruitmentStartupFilter] = useState<string | undefined>(undefined)
  const [collaborationStartupFilter, setCollaborationStartupFilter] = useState<string | undefined>(undefined)

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const [showUserDetailModal, setShowUserDetailModal] = useState(false)
  const [completeProfile, setCompleteProfile] = useState<any | null>(null)
  const [loadingProfileDetail, setLoadingProfileDetail] = useState(false)

  // Load user from storage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setCurrentUser(JSON.parse(savedUser))
      } catch (err) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  }, [])

  // Poll unread notifications count
  const fetchUnreadCount = async () => {
    if (!token) {
      setUnreadNotificationsCount(0)
      return
    }
    try {
      const res = await fetch('http://localhost:5000/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setUnreadNotificationsCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }

  useEffect(() => {
    if (token) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 20000)
      return () => clearInterval(interval)
    } else {
      setUnreadNotificationsCount(0)
    }
  }, [token])

  const handleAuthSuccess = (data: { user: any; token: string }) => {
    setCurrentUser(data.user)
    setToken(data.token)
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
    setIsAuthModalOpen(false)
    // Direct user to appropriate workspace view based on role
    if (data.user?.role === 'FOUNDER' || data.user?.role === 'ADMIN') {
      setWorkspaceView('startups')
    } else {
      setWorkspaceView('matching')
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setWorkspaceView('portal')
  }

  const handleOpenUserProfileModal = async () => {
    setShowUserDetailModal(true)
    if (!token) return
    setLoadingProfileDetail(true)
    try {
      const res = await fetch('http://localhost:5000/api/profile/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.profile) {
        setCompleteProfile(data.profile)
      }
    } catch (err) {
      console.error('Error fetching complete profile:', err)
    } finally {
      setLoadingProfileDetail(false)
    }
  }

  // Handle CTA Clicks
  const handleSubmitIdeaClick = () => {
    if (currentUser && token) {
      setWorkspaceView('startups')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setAuthModalMode('login')
      setIsAuthModalOpen(true)
    }
  }

  const handleStartInKeralaClick = () => {
    if (workspaceView !== 'portal') {
      setWorkspaceView('portal')
      setTimeout(() => {
        const el = document.getElementById('programs-section')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const el = document.getElementById('programs-section')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleJoinCommunityClick = () => {
    if (currentUser) {
      setWorkspaceView('profile')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setAuthModalMode('register')
      setIsAuthModalOpen(true)
    }
  }

  const handleSearchSelect = (item: any) => {
    if (item.link) {
      if (workspaceView !== 'portal') {
        setWorkspaceView('portal')
        setTimeout(() => {
          const el = document.getElementById(item.link)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        const el = document.getElementById(item.link)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-[#0b57d0] selection:text-white font-sans">
      
      {/* 1. TOP HEADER / NAVBAR (Matching Image 4) */}
      <Navbar
        currentUser={currentUser}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode)
          setIsAuthModalOpen(true)
        }}
        onOpenSearchModal={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onNavigateToWorkspace={(view) => {
          setWorkspaceView(view)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onLogout={handleLogout}
        currentWorkspaceView={workspaceView}
        onNavigateHome={() => setWorkspaceView('portal')}
        onOpenProfileModal={handleOpenUserProfileModal}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* WORKSPACE VIEW SWITCHER BAR (Visible when logged in) */}
      {currentUser && (
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-2.5 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-300">
                Logged in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWorkspaceView('portal')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  workspaceView === 'portal'
                    ? 'bg-[#0b57d0] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FaHome className="text-xs" />
                <span>Portal Home</span>
              </button>

              <button
                onClick={() => {
                  setWorkspaceView('startups')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  workspaceView === 'startups'
                    ? 'bg-[#0b57d0] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FaRocket className="text-xs" />
                <span>Startup Ideas Workspace</span>
              </button>

              <button
                onClick={() => {
                  setWorkspaceView('matching')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  workspaceView === 'matching'
                    ? 'bg-[#0b57d0] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FaBolt className="text-xs text-amber-400" />
                <span>Skill Matching</span>
              </button>

              <button
                onClick={() => {
                  setRecruitmentStartupFilter(undefined)
                  setWorkspaceView('recruitment')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  workspaceView === 'recruitment'
                    ? 'bg-[#0b57d0] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FaUsers className="text-xs" />
                <span>
                  {currentUser?.role === 'FOUNDER' || currentUser?.role === 'ADMIN'
                    ? 'Recruitment & Applications'
                    : 'My Applications'}
                </span>
              </button>

              <button
                onClick={() => {
                  setCollaborationStartupFilter(undefined)
                  setWorkspaceView('collaboration')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  workspaceView === 'collaboration'
                    ? 'bg-[#0b57d0] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FaLayerGroup className="text-xs text-indigo-400" />
                <span>Team Workspace</span>
              </button>

              <button
                onClick={() => {
                  setWorkspaceView('tasks')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  workspaceView === 'tasks'
                    ? 'bg-[#0b57d0] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FaTasks className="text-xs text-violet-400" />
                <span>Task Management</span>
              </button>

              {(currentUser?.role === 'FOUNDER' || currentUser?.role === 'ADMIN') && (
                <button
                  onClick={() => {
                    setWorkspaceView('pitchdeck')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    workspaceView === 'pitchdeck'
                      ? 'bg-[#0b57d0] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs">📊</span>
                  <span>Pitch Deck</span>
                </button>
              )}

              {(currentUser?.role === 'INVESTOR' || currentUser?.role === 'ADMIN') && (
                <button
                  onClick={() => {
                    setWorkspaceView('investors')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    workspaceView === 'investors'
                      ? 'bg-[#0b57d0] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs">💼</span>
                  <span>Investor Dashboard</span>
                </button>
              )}

              <button
                onClick={() => {
                  setWorkspaceView('profile')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  workspaceView === 'profile'
                    ? 'bg-[#0b57d0] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FaUserAlt className="text-xs" />
                <span>My Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT CONTENT */}
      <main className="flex-1 w-full">
        {workspaceView === 'portal' ? (
          /* ========================================================================= */
          /* PORTAL VIEW: 4 Core Sections matching the Reference Design Screenshots   */
          /* ========================================================================= */
          <div className="w-full space-y-0">
            {/* Section 1: Hero Section (Image 4) */}
            <HeroSection
              onSubmitIdea={handleSubmitIdeaClick}
              onStartInKerala={handleStartInKeralaClick}
              onJoinCommunity={handleJoinCommunityClick}
            />

            {/* Section 2: Startups Making Headline (Image 1) */}
            <StartupsHeadlineSection
              onExploreAllStartups={handleSubmitIdeaClick}
            />

            {/* Section 3: Sectoral Insights (Image 2) */}
            <SectoralInsightsSection
              onSelectSector={() => handleSubmitIdeaClick()}
            />

            {/* Section 4: Programs & Schemes (Image 3) */}
            <ProgramsSchemesSection
              onApplyScheme={() => handleSubmitIdeaClick()}
            />
          </div>
        ) : (
          /* ========================================================================= */
          /* WORKSPACE VIEW: Dedicated Idea Collaboration & Profile Management         */
          /* ========================================================================= */
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {workspaceView === 'startups' ? (
              <StartupIdeaManagement
                user={currentUser}
                token={token || ''}
                onNavigateToRecruitment={(startupId) => {
                  setRecruitmentStartupFilter(startupId)
                  setWorkspaceView('recruitment')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onNavigateToCollaboration={(startupId) => {
                  setCollaborationStartupFilter(startupId)
                  setWorkspaceView('collaboration')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            ) : workspaceView === 'matching' ? (
              <SkillMatchingHub
                user={currentUser}
                token={token || ''}
                onNavigateToStartups={() => {
                  setWorkspaceView('startups')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onNavigateToRecruitment={(startupId) => {
                  setRecruitmentStartupFilter(startupId)
                  setWorkspaceView('recruitment')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onNavigateToProfile={() => {
                  setWorkspaceView('profile')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            ) : workspaceView === 'recruitment' ? (
              <TeamRecruitmentHub
                user={currentUser}
                token={token || ''}
                initialStartupId={recruitmentStartupFilter}
                onNavigateToStartups={() => {
                  setWorkspaceView('startups')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            ) : workspaceView === 'collaboration' ? (
              <CollaborationWorkspaceHub
                user={currentUser}
                token={token || ''}
                initialStartupId={collaborationStartupFilter}
                onNavigateToStartups={() => {
                  setWorkspaceView('startups')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onNavigateToRecruitment={() => {
                  setWorkspaceView('recruitment')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onNavigateToMatching={() => {
                  setWorkspaceView('matching')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            ) : workspaceView === 'tasks' ? (
              <TaskManagementHub
                user={currentUser}
                token={token || ''}
                onNavigateToStartups={() => {
                  setWorkspaceView('startups')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onNavigateToCollaboration={() => {
                  setCollaborationStartupFilter(undefined)
                  setWorkspaceView('collaboration')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            ) : workspaceView === 'pitchdeck' && (currentUser?.role === 'FOUNDER' || currentUser?.role === 'ADMIN') ? (
              <PitchDeckBuilder
                user={currentUser}
                token={token || ''}
                onNavigateToStartups={() => {
                  setWorkspaceView('startups')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            ) : workspaceView === 'investors' && (currentUser?.role === 'INVESTOR' || currentUser?.role === 'ADMIN') ? (
              <InvestorDashboard
                user={currentUser}
                token={token || ''}
              />
            ) : (
              <UserProfileDashboard user={currentUser} token={token || ''} onLogout={handleLogout} />
            )}
          </div>
        )}
      </main>

      {/* 2. AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSwitchMode={(m) => setAuthModalMode(m)}
        onSuccess={handleAuthSuccess}
        onOpenForgotPassword={() => {
          setIsAuthModalOpen(false)
          setIsForgotPasswordOpen(true)
        }}
      />

      {/* 3. FORGOT PASSWORD MODAL */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      {/* 4. SEARCH MODAL */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectItem={handleSearchSelect}
      />

      {/* 5. NOTIFICATION MODAL */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => {
          setIsNotificationsOpen(false)
          fetchUnreadCount()
        }}
        token={token}
        currentUser={currentUser}
        onNavigateToRecruitment={() => {
          setWorkspaceView('recruitment')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onNavigateToCollaboration={(startupId) => {
          if (startupId) setCollaborationStartupFilter(startupId)
          setWorkspaceView('collaboration')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onUnreadCountChange={(count) => setUnreadNotificationsCount(count)}
      />

      {/* 6. FLOATING ACCESSIBILITY WIDGET (Ctrl+F2) */}
      <AccessibilityWidget />

      {/* 7. COMPLETE PROFILE DETAIL MODAL */}
      {showUserDetailModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative">
                    {completeProfile?.avatar || currentUser.avatar ? (
                      <img
                        src={completeProfile?.avatar || currentUser.avatar}
                        alt={currentUser.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl bg-white"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0b57d0] ring-4 ring-white/20 shadow-xl flex items-center justify-center font-black text-3xl sm:text-4xl text-white">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{completeProfile?.name || currentUser.name}</h2>
                      <span className="px-3 py-0.5 rounded-full text-xs font-black bg-[#0b57d0] text-white shadow-xs">
                        {completeProfile?.role || currentUser.role}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                      <span>📧 {completeProfile?.email || currentUser.email}</span>
                      {(completeProfile?.phone || currentUser.phone) && (
                        <span>📞 {completeProfile?.phone || currentUser.phone}</span>
                      )}
                      {completeProfile?.location && (
                        <span>📍 {completeProfile.location}</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowUserDetailModal(false)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-sm flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 flex-1">
              {loadingProfileDetail && (
                <div className="py-2 text-center text-xs font-bold text-[#0b57d0] animate-pulse">
                  Syncing latest profile parameters...
                </div>
              )}

              {/* Bio */}
              {(completeProfile?.bio || currentUser.bio) && (
                <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0b57d0] block">
                    Bio & Pitch Tagline
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {completeProfile?.bio || currentUser.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                  Registered Skills ({completeProfile?.skills?.length || (Array.isArray(currentUser.skills) ? currentUser.skills.length : 0)})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(completeProfile?.skills || (Array.isArray(currentUser.skills) ? currentUser.skills : []))?.map((s: string) => (
                    <span key={s} className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex justify-end items-center">
              <button
                onClick={() => setShowUserDetailModal(false)}
                className="px-6 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200 bg-white py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <Logo size="md" />
          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
            <button onClick={() => setWorkspaceView('portal')} className="hover:text-[#0b57d0] cursor-pointer">Home</button>
            <button onClick={() => handleStartInKeralaClick()} className="hover:text-[#0b57d0] cursor-pointer">Programs</button>
            <button onClick={() => handleSubmitIdeaClick()} className="hover:text-[#0b57d0] cursor-pointer">Startups</button>
            <button onClick={() => setIsNotificationsOpen(true)} className="hover:text-[#0b57d0] cursor-pointer">Announcements</button>
          </div>
          <div className="text-center md:text-right text-[11px] text-slate-400">
            © 2026 Kerala Startup Mission. All rights reserved.
            <br />
            Government of Kerala Initiative for Entrepreneurship & Innovation.
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App
