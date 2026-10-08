import { useState, type FC } from 'react'
import { Logo } from './Logo'
import { FaSearch, FaSignInAlt, FaBars, FaTimes, FaBell, FaRocket, FaUserAlt, FaSignOutAlt, FaBolt, FaUsers, FaFolderOpen } from 'react-icons/fa'

interface NavbarProps {
  currentUser: any | null
  onOpenAuthModal: (mode: 'login' | 'register') => void
  onOpenSearchModal: () => void
  onOpenNotifications: () => void
  onNavigateToWorkspace: (view: 'startups' | 'profile' | 'recruitment' | 'matching' | 'collaboration' | 'tasks' | 'pitchdeck' | 'investors') => void
  onLogout: () => void
  currentWorkspaceView?: 'portal' | 'startups' | 'profile' | 'recruitment' | 'matching' | 'collaboration' | 'tasks' | 'pitchdeck' | 'investors'
  onNavigateHome: () => void
  onOpenProfileModal?: () => void
  unreadNotificationsCount?: number
}

export const Navbar: FC<NavbarProps> = ({
  currentUser,
  onOpenAuthModal,
  onOpenSearchModal,
  onOpenNotifications,
  onNavigateToWorkspace,
  onLogout,
  currentWorkspaceView = 'portal',
  onNavigateHome,
  onOpenProfileModal,
  unreadNotificationsCount = 0,
}) => {
  const [language, setLanguage] = useState<'en' | 'ml'>('en')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const scrollToSection = (id: string) => {
    if (currentWorkspaceView !== 'portal') {
      onNavigateHome()
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <Logo size="md" onClick={onNavigateHome} />

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700">
          <button
            onClick={onNavigateHome}
            className={`transition-colors hover:text-[#0b57d0] cursor-pointer ${
              currentWorkspaceView === 'portal' ? 'font-bold text-[#0b57d0]' : ''
            }`}
          >
            {language === 'en' ? 'Home' : 'പ്രധാനം'}
          </button>

          <button
            onClick={() => scrollToSection('startups-section')}
            className="transition-colors hover:text-[#0b57d0] cursor-pointer"
          >
            {language === 'en' ? 'Startups' : 'സ്റ്റാർട്ടപ്പുകൾ'}
          </button>

          <button
            onClick={() => scrollToSection('programs-section')}
            className="transition-colors hover:text-[#0b57d0] cursor-pointer"
          >
            {language === 'en' ? 'Programs' : 'പദ്ധതികൾ'}
          </button>

          <button
            onClick={() => scrollToSection('sector-section')}
            className="transition-colors hover:text-[#0b57d0] cursor-pointer"
          >
            {language === 'en' ? 'Ecosystem' : 'മേഖലകൾ'}
          </button>

          <button
            onClick={onOpenNotifications}
            className="transition-colors hover:text-[#0b57d0] cursor-pointer flex items-center gap-1.5 relative"
          >
            <FaBell className={`text-xs ${unreadNotificationsCount > 0 ? 'text-[#0b57d0]' : 'text-slate-400'}`} />
            <span>{language === 'en' ? 'Notifications' : 'അറിയിപ്പുകൾ'}</span>
            {unreadNotificationsCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                {unreadNotificationsCount}
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-blue-500/50"></span>
            )}
          </button>
        </nav>

        {/* Right Section: Language Toggle, Search & Login/User Controls */}
        <div className="hidden sm:flex items-center gap-3.5">
          {/* Language Switcher */}
          <div className="flex items-center text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                language === 'en'
                  ? 'text-[#0b57d0] font-bold bg-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              English
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setLanguage('ml')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                language === 'ml'
                  ? 'text-[#0b57d0] font-bold bg-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              മലയാളം
            </button>
          </div>

          {/* Search Trigger Button */}
          <button
            onClick={onOpenSearchModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 text-[#0b57d0] text-xs font-bold transition-all border border-blue-100 cursor-pointer"
          >
            <FaSearch className="text-xs" />
            <span>{language === 'en' ? 'Search' : 'തിരയുക'}</span>
          </button>

          {/* Authentication State */}
          {currentUser ? (
            <div className="relative">
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-blue-800 flex items-center justify-center font-bold text-xs">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="text-left text-xs leading-none">
                  <div className="font-bold flex items-center gap-1">
                    <span>{currentUser.name.split(' ')[0]}</span>
                    <span className="text-[9px]">▼</span>
                  </div>
                  <span className="text-[10px] text-blue-200">{currentUser.role}</span>
                </div>
              </div>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      onNavigateToWorkspace('startups')
                      setShowUserMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                  >
                    <FaRocket className="text-blue-600" />
                    <span>
                      {currentUser?.role === 'FOUNDER' || currentUser?.role === 'ADMIN'
                        ? 'My Startups & Ideas'
                        : 'Explore Startups & Apply'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigateToWorkspace('matching')
                      setShowUserMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                  >
                    <FaBolt className="text-amber-500" />
                    <span>
                      {currentUser?.role === 'FOUNDER' || currentUser?.role === 'ADMIN'
                        ? 'Find Teammates'
                        : 'Recommended Startups'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigateToWorkspace('recruitment')
                      setShowUserMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                  >
                    <FaUsers className="text-purple-600" />
                    <span>
                      {currentUser.role === 'FOUNDER' || currentUser.role === 'ADMIN'
                        ? 'Team Recruitment'
                        : 'My Applications'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigateToWorkspace('collaboration')
                      setShowUserMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                  >
                    <FaFolderOpen className="text-indigo-600" />
                    <span>Team Workspace</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigateToWorkspace('profile')
                      setShowUserMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                  >
                    <FaUserAlt className="text-emerald-600" />
                    <span>My Full Profile Workspace</span>
                  </button>

                  {onOpenProfileModal && (
                    <button
                      onClick={() => {
                        onOpenProfileModal()
                        setShowUserMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                    >
                      <span>🪪</span>
                      <span>View Profile ID Card</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      onLogout()
                      setShowUserMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                  >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuthModal('login')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <FaSignInAlt />
              <span>{language === 'en' ? 'Login' : 'ലോഗിൻ'}</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => onOpenAuthModal('login')}
            className="sm:hidden px-3 py-1.5 bg-[#0b57d0] text-white rounded-lg text-xs font-bold"
          >
            Login
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 shadow-lg">
          <button
            onClick={onNavigateHome}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-700 hover:text-[#0b57d0]"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('startups-section')}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-700 hover:text-[#0b57d0]"
          >
            Startups
          </button>
          <button
            onClick={() => scrollToSection('programs-section')}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-700 hover:text-[#0b57d0]"
          >
            Programs & Schemes
          </button>
          <button
            onClick={() => scrollToSection('sector-section')}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-700 hover:text-[#0b57d0]"
          >
            Sectoral Insights
          </button>
          <button
            onClick={onOpenNotifications}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-700 hover:text-[#0b57d0]"
          >
            Notifications
          </button>
          <button
            onClick={onOpenSearchModal}
            className="block w-full text-left py-2 text-sm font-semibold text-[#0b57d0]"
          >
            🔍 Search Portal
          </button>
          {currentUser ? (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  onNavigateToWorkspace('startups')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Go to Startup Ideas Workspace
              </button>
              <button
                onClick={() => {
                  onLogout()
                  setIsMobileMenuOpen(false)
                }}
                className="w-full py-2 bg-red-50 text-red-700 rounded-xl text-xs font-bold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  onOpenAuthModal('login')
                  setIsMobileMenuOpen(false)
                }}
                className="flex-1 py-2.5 bg-[#0b57d0] text-white rounded-xl text-xs font-bold text-center"
              >
                Login
              </button>
              <button
                onClick={() => {
                  onOpenAuthModal('register')
                  setIsMobileMenuOpen(false)
                }}
                className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold text-center"
              >
                Join Community
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
