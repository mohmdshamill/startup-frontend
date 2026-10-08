import { useState, useEffect, type FC, type FormEvent, type ChangeEvent } from 'react'
import ventureLaunchpadHero from '../assets/venture_launchpad_hero.jpg'
import { ApplyToStartupModal } from './ApplyToStartupModal'
import {
  FaUserPlus,
  FaUsers,
  FaEye,
  FaLayerGroup,
  FaEdit,
  FaTrashAlt,
  FaBolt,
  FaBullseye,
  FaLightbulb,
  FaTools,
  FaRocket,
  FaChartLine,
  FaBuilding,
  FaCompass,
  FaSearch,
  FaPlus,
  FaGlobe,
  FaTimes,
} from 'react-icons/fa'

export type StartupStage = 'IDEATION' | 'PROTOTYPE' | 'MVP' | 'EARLY_TRACTION' | 'SCALING'

export interface StartupIdea {
  id: string
  founderId: string
  title: string
  tagline: string
  description: string
  category: string
  stage: StartupStage
  requiredSkills: string[]
  targetMarket?: string | null
  websiteUrl?: string | null
  pitchDeckUrl?: string | null
  teamSize?: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  founder?: {
    id: string
    name: string
    email: string
    avatar?: string | null
    role: string
    location?: string | null
    bio?: string | null
    linkedinUrl?: string | null
    website?: string | null
  }
}

interface StartupIdeaManagementProps {
  user: any
  token: string
  onNavigateToRecruitment?: (startupId?: string) => void
  onNavigateToCollaboration?: (startupId: string) => void
}

export const STAGE_CONFIG: Record<StartupStage, { label: string; Icon: any; badgeClass: string; desc: string }> = {
  IDEATION: {
    label: 'Idea Stage',
    Icon: FaLightbulb,
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Planning and researching the idea',
  },
  PROTOTYPE: {
    label: 'Prototype',
    Icon: FaTools,
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    desc: 'Building the first simple demo',
  },
  MVP: {
    label: 'MVP',
    Icon: FaRocket,
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    desc: 'Working product ready for early users',
  },
  EARLY_TRACTION: {
    label: 'Early Users',
    Icon: FaChartLine,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'First real users and initial feedback',
  },
  SCALING: {
    label: 'Growing',
    Icon: FaBuilding,
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: 'Growing users, customers, and team',
  },
}

export const CATEGORIES = [
  'FinTech',
  'HealthTech',
  'EdTech',
  'AgriTech',
  'AI & ML',
  'CleanTech & Sustainability',
  'SaaS & Enterprise',
  'Tourism & Hospitality',
  'Logistics & Supply Chain',
  'E-Commerce & Retail',
  'DeepTech & Hardware',
  'Social Impact',
]

export const POPULAR_SKILL_SUGGESTIONS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'TailwindCSS',
  'PostgreSQL',
  'Docker',
  'AWS',
  'UI/UX Design',
  'Next.js',
  'FastAPI',
  'Flutter',
  'Machine Learning',
  'Data Science',
  'Growth Marketing',
  'DevOps',
]

export const StartupIdeaManagement: FC<StartupIdeaManagementProps> = ({
  user,
  token,
  onNavigateToRecruitment,
  onNavigateToCollaboration,
}) => {
  const isFounder = user?.role === 'FOUNDER' || user?.role === 'ADMIN'

  // State
  const [activeTab, setActiveTab] = useState<'my' | 'explore'>(isFounder ? 'my' : 'explore')
  const [myStartups, setMyStartups] = useState<StartupIdea[]>([])
  const [allStartups, setAllStartups] = useState<StartupIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedStage, setSelectedStage] = useState('ALL')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingStartup, setEditingStartup] = useState<StartupIdea | null>(null)
  const [inspectingStartup, setInspectingStartup] = useState<StartupIdea | null>(null)
  const [deletingStartupId, setDeletingStartupId] = useState<string | null>(null)
  const [applyingStartup, setApplyingStartup] = useState<StartupIdea | null>(null)

  // Form State
  const initialFormState = {
    title: '',
    tagline: '',
    description: '',
    category: 'AI & ML',
    stage: 'IDEATION' as StartupStage,
    requiredSkills: [] as string[],
    targetMarket: '',
    websiteUrl: '',
    pitchDeckUrl: '',
    teamSize: 1,
  }
  const [formData, setFormData] = useState(initialFormState)
  const [customSkillInput, setCustomSkillInput] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Fetch functions
  const fetchMyStartups = async () => {
    if (!token) return
    try {
      const res = await fetch('http://localhost:5000/api/startups/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setMyStartups(data.startups || [])
      }
    } catch (err) {
      console.error('Error fetching my startups:', err)
    }
  }

  const fetchAllStartups = async () => {
    try {
      let url = 'http://localhost:5000/api/startups'
      const params = new URLSearchParams()
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory)
      if (selectedStage !== 'ALL') params.append('stage', selectedStage)
      if (searchQuery.trim()) params.append('search', searchQuery.trim())

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setAllStartups(data.startups || [])
      }
    } catch (err) {
      console.error('Error fetching all startups:', err)
    }
  }

  const loadData = async () => {
    setLoading(true)
    await Promise.all([isFounder ? fetchMyStartups() : Promise.resolve(), fetchAllStartups()])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [token, selectedCategory, selectedStage, searchQuery])

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingStartup(null)
    setFormData(initialFormState)
    setCustomSkillInput('')
    setFormError(null)
    setShowCreateModal(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (startup: StartupIdea) => {
    setEditingStartup(startup)
    setFormData({
      title: startup.title,
      tagline: startup.tagline,
      description: startup.description,
      category: startup.category,
      stage: startup.stage,
      requiredSkills: [...startup.requiredSkills],
      targetMarket: startup.targetMarket || '',
      websiteUrl: startup.websiteUrl || '',
      pitchDeckUrl: startup.pitchDeckUrl || '',
      teamSize: startup.teamSize || 1,
    })
    setCustomSkillInput('')
    setFormError(null)
    setShowCreateModal(true)
  }

  // Skill Tags Management
  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim()
    if (!trimmed) return
    if (!formData.requiredSkills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, trimmed],
      }))
    }
    setCustomSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skillToRemove),
    }))
  }

  // Submit Create or Edit Form
  const handleSubmitStartup = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.title.trim()) {
      setFormError('Please provide a startup venture name/title.')
      return
    }
    if (!formData.tagline.trim()) {
      setFormError('Please enter a short pitch / elevator tagline.')
      return
    }
    if (!formData.description.trim()) {
      setFormError('Please explain the problem statement & solution in the description.')
      return
    }
    if (!formData.category) {
      setFormError('Please select a startup industry category.')
      return
    }

    setSubmitting(true)
    try {
      const isEditing = !!editingStartup
      const endpoint = isEditing
        ? `http://localhost:5000/api/startups/${editingStartup.id}`
        : 'http://localhost:5000/api/startups'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save startup idea')
      }

      showToast(
        isEditing ? 'Startup idea details updated successfully!' : '🎉 Startup idea launched successfully!',
        'success'
      )
      setShowCreateModal(false)
      setEditingStartup(null)
      await loadData()
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Startup Idea
  const handleDeleteStartup = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/startups/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Startup idea deleted successfully', 'success')
        setDeletingStartupId(null)
        if (inspectingStartup?.id === id) setInspectingStartup(null)
        await loadData()
      } else {
        showToast(data.error || 'Failed to delete startup', 'error')
      }
    } catch (err: any) {
      showToast('Network error while deleting', 'error')
    }
  }

  // Filtered views
  const displayList = activeTab === 'my' ? myStartups : allStartups

  // Metrics
  const myTotalCount = myStartups.length
  const myIdeationCount = myStartups.filter((s) => s.stage === 'IDEATION').length
  const myPrototypeMvpCount = myStartups.filter((s) => s.stage === 'PROTOTYPE' || s.stage === 'MVP').length
  const myTotalSkillsRequired = Array.from(new Set(myStartups.flatMap((s) => s.requiredSkills))).length

  return (
    <div className="w-full space-y-6 antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 transition-all ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-emerald-400 border border-slate-700'
              : 'bg-red-950 text-red-200 border border-red-800'
          }`}
        >
          <span>{toastMessage.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HERO BANNER & STATS */}
      <div className="relative rounded-3xl overflow-hidden text-white border border-indigo-900/40 shadow-2xl bg-slate-950 min-h-[220px]">
        {/* Photorealistic Hero Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
          style={{ backgroundImage: `url(${ventureLaunchpadHero})` }}
        />
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-indigo-950/70 backdrop-blur-[2px]" />
        
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 backdrop-blur-md border border-indigo-400/40 text-[11px] font-extrabold text-indigo-200 uppercase tracking-wider shadow-sm">
                <FaRocket className="text-indigo-400 text-xs animate-bounce" />
                <span>{isFounder ? 'Founder Venture Launchpad' : 'Kerala Startup Directory'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                {isFounder ? 'Startup Ideas & Team Building' : 'Explore Startup Teams & Apply'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal max-w-xl">
                {isFounder
                  ? 'Post your startup idea, update its progress, and find skilled people to join your team in Kerala.'
                  : 'Browse Kerala startup ideas, connect with founders, match your skills, and apply to join ambitious startup teams.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isFounder ? (
                <button
                  onClick={handleOpenCreateModal}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-xl shadow-indigo-950/50 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 border border-indigo-400/30"
                >
                  <FaPlus className="text-xs" />
                  <span>Post Startup Idea</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-xs text-indigo-100 flex items-center gap-2 shadow-lg">
                  <FaCompass className="text-indigo-400 text-sm" />
                  <span className="font-bold">Role: {user?.role || 'DEVELOPER'}</span> • Browse startups & apply
                </div>
              )}
            </div>
          </div>

        {/* METRICS ROW (FOR FOUNDERS & DEVELOPERS) */}
        {isFounder ? (
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                My Startups
              </span>
              <span className="text-2xl font-black text-white mt-1 block">{myTotalCount}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-amber-400/30 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Idea Stage
              </span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">{myIdeationCount}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Building Stage
              </span>
              <span className="text-2xl font-black text-indigo-400 mt-1 block">{myPrototypeMvpCount}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-emerald-400/30 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Skills Needed
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{myTotalSkillsRequired}</span>
            </div>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Startups
              </span>
              <span className="text-2xl font-black text-white mt-1 block">{allStartups.length}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-emerald-400/30 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Active Hiring
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                {allStartups.filter((s) => s.isActive).length}
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Categories
              </span>
              <span className="text-2xl font-black text-indigo-400 mt-1 block">
                {new Set(allStartups.map((s) => s.category)).size || 1}
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-amber-400/30 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Your Role
              </span>
              <span className="text-2xl font-black text-amber-400 mt-1 block truncate">
                {user?.role || 'DEVELOPER'}
              </span>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* CONTROLS BAR: TABS, SEARCH & FILTERS */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* TAB SWITCHER */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 w-full sm:w-auto">
            {isFounder && (
              <button
                onClick={() => setActiveTab('my')}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'my'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FaLightbulb className="text-amber-500 text-xs" />
                <span>My Startups</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'my' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {myStartups.length}
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('explore')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'explore'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FaGlobe className="text-indigo-500 text-xs" />
              <span>All Startups</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'explore' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {allStartups.length}
              </span>
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search startups by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 p-1"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY & STAGE SELECTORS */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stage:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              {Object.entries(STAGE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {(selectedCategory !== 'ALL' || selectedStage !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('ALL')
                setSelectedStage('ALL')
                setSearchQuery('')
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* STARTUP CARDS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
              <div className="h-14 bg-slate-100 rounded-xl w-full"></div>
              <div className="h-6 bg-slate-200 rounded-full w-1/2"></div>
            </div>
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 text-3xl flex items-center justify-center mx-auto shadow-inner">
            💡
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {activeTab === 'my' ? 'No Startup Ideas Published Yet' : 'No Startups Match Your Filter'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {activeTab === 'my'
                ? 'Create your first startup concept, define the stage, and list technical & business skills needed to build your team.'
                : 'Try clearing your search query or selecting a different category/stage filter.'}
            </p>
          </div>
          {activeTab === 'my' && isFounder && (
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              + Create First Startup Idea
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayList.map((startup) => {
            const stageConfig = STAGE_CONFIG[startup.stage] || STAGE_CONFIG.IDEATION
            const isOwner = Boolean(user?.id && user.id === startup.founderId)

            return (
              <div
                key={startup.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between p-5 sm:p-6 group relative"
              >
                {/* TOP ROW: CATEGORY PILL & STAGE BADGE */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200/80 tracking-wide uppercase">
                      {startup.category}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${stageConfig.badgeClass} shadow-2xs`}
                      title={stageConfig.desc}
                    >
                      <stageConfig.Icon className="text-xs" />
                      <span>{stageConfig.label}</span>
                    </span>
                  </div>

                  {/* STARTUP TITLE & TAGLINE */}
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {startup.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 line-clamp-2 leading-relaxed">
                      "{startup.tagline}"
                    </p>
                  </div>

                  {/* DESCRIPTION SNIPPET */}
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {startup.description}
                  </p>

                  {/* TARGET MARKET & TEAM SIZE */}
                  {(startup.targetMarket || startup.teamSize) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                      {startup.targetMarket && (
                        <span className="bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60 inline-flex items-center gap-1">
                          <FaBullseye className="text-[10px] text-purple-600" />
                          <span>{startup.targetMarket}</span>
                        </span>
                      )}
                      {startup.teamSize && (
                        <span className="bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60 inline-flex items-center gap-1">
                          <FaUsers className="text-[10px] text-indigo-600" />
                          <span>Team: {startup.teamSize}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* REQUIRED SKILLS CHIPS */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Skills Needed ({startup.requiredSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                      {startup.requiredSkills.length > 0 ? (
                        startup.requiredSkills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <FaBolt className="text-[10px] text-amber-500" />
                            <span>{skill}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No specific skills listed</span>
                      )}
                      {startup.requiredSkills.length > 5 && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">
                          +{startup.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTION BAR & FOUNDER INFO */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                  {/* Founder Credit */}
                  {startup.founder && (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        {startup.founder.avatar ? (
                          <img
                            src={startup.founder.avatar}
                            alt={startup.founder.name}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {startup.founder.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-slate-800 text-[11px] truncate max-w-[120px]">
                          {startup.founder.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(startup.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => setInspectingStartup(startup)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FaEye className="text-xs text-slate-600" />
                      <span>View Details</span>
                    </button>

                    {!isFounder && !isOwner && (
                      <button
                        onClick={() => setApplyingStartup(startup)}
                        className="py-2 px-3 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        title="Apply to Join this Startup Team"
                      >
                        <FaUserPlus className="text-xs" />
                        <span>Apply to Join</span>
                      </button>
                    )}

                    {isOwner && (
                      <>
                        {onNavigateToCollaboration && (
                          <button
                            onClick={() => onNavigateToCollaboration(startup.id)}
                            className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all cursor-pointer flex items-center gap-1.5"
                            title="Open Startup Collaboration Workspace"
                          >
                            <FaLayerGroup className="text-xs text-indigo-600" />
                            <span>Workspace</span>
                          </button>
                        )}

                        {onNavigateToRecruitment && (
                          <button
                            onClick={() => onNavigateToRecruitment(startup.id)}
                            className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-all cursor-pointer flex items-center gap-1.5"
                            title="View Candidate Applications"
                          >
                            <FaUsers className="text-xs text-purple-600" />
                            <span>Applicants</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEditModal(startup)}
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                          title="Edit Startup Details"
                        >
                          <FaEdit className="text-xs text-slate-600" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setDeletingStartupId(startup.id)}
                          className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 transition-all cursor-pointer flex items-center justify-center"
                          title="Delete Startup Idea"
                        >
                          <FaTrashAlt className="text-xs text-rose-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE & EDIT STARTUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <span>{editingStartup ? '✏️ Edit Startup Details' : '✨ Launch New Startup Idea'}</span>
                </h3>
                <p className="text-xs text-indigo-200 font-normal">
                  {editingStartup
                    ? 'Update stage, required skills, and concept details'
                    : 'Share your venture vision with the Kerala founder ecosystem'}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitStartup} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-left">
              {formError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span> {formError}
                </div>
              )}

              {/* 1. BASIC STARTUP INFO */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  1. Basic Startup Information
                </h4>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Startup Name / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AgriPay Kerala, SolarLogistics, MedConnect Kochi"
                    value={formData.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Short Tagline (One sentence about what you do) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Simple cold storage delivery for local fishermen"
                    value={formData.tagline}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, tagline: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Choose Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Team Size */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Current Team Size</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 2. SELECT STARTUP STAGE */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    2. Startup Progress Stage <span className="text-red-500">*</span>
                  </h4>
                  <span className="text-[11px] font-bold text-indigo-600">
                    Selected: {STAGE_CONFIG[formData.stage]?.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(Object.keys(STAGE_CONFIG) as StartupStage[]).map((stageKey) => {
                    const cfg = STAGE_CONFIG[stageKey]
                    const isSelected = formData.stage === stageKey

                    return (
                      <button
                        type="button"
                        key={stageKey}
                        onClick={() => setFormData({ ...formData, stage: stageKey })}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 shadow-xs ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <cfg.Icon className="text-sm text-indigo-600" />
                          <span className="text-xs font-extrabold text-slate-900">{cfg.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal">{cfg.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. DEFINE REQUIRED SKILLS */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    3. Skills Needed to Join ({formData.requiredSkills.length})
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Type a skill and press Add or click below
                  </span>
                </div>

                {/* Input and Add Button */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type skill name (e.g. React, Python, UI Design)..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkill(customSkillInput)
                      }
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(customSkillInput)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer transition-all"
                  >
                    + Add
                  </button>
                </div>

                {/* Selected Skills Chips */}
                {formData.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                    {formData.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
                      >
                        <span>⚡ {skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Suggestion Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quick Suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILL_SUGGESTIONS.map((skill) => {
                      const isAdded = formData.requiredSkills.includes(skill)
                      return (
                        <button
                          key={skill}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleAddSkill(skill)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          + {skill}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 4. DETAILS, PROBLEM-SOLUTION & MARKET */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  4. About Your Startup & Customers
                </h4>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    About This Startup (Problem & Solution) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Explain what problem your startup solves, how it works, and how far you have built it..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Target Customers / Market</label>
                    <input
                      type="text"
                      placeholder="e.g. Small shops, students in Kerala, clinics"
                      value={formData.targetMarket}
                      onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Pitch Deck Link (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... or pitch.com/..."
                      value={formData.pitchDeckUrl}
                      onChange={(e) => setFormData({ ...formData, pitchDeckUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Website or Demo Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://myventure.io or https://demo.app"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingStartup ? '💾 Update Startup Details' : '🚀 Publish Startup Idea'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT DETAIL MODAL */}
      {inspectingStartup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 text-left">
            {/* Header Banner */}
            <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
              <button
                onClick={() => setInspectingStartup(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm cursor-pointer transition-all"
              >
                ✕
              </button>

              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-white/10 backdrop-blur-md text-white border border-white/20 uppercase">
                    {inspectingStartup.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                      STAGE_CONFIG[inspectingStartup.stage]?.badgeClass
                    }`}
                  >
                    {(() => {
                      const StageIcon = STAGE_CONFIG[inspectingStartup.stage]?.Icon
                      return StageIcon ? <StageIcon className="text-xs" /> : null
                    })()}
                    <span>{STAGE_CONFIG[inspectingStartup.stage]?.label}</span>
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white">{inspectingStartup.title}</h2>
                <p className="text-xs sm:text-sm text-indigo-200 font-medium">"{inspectingStartup.tagline}"</p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* STAGE PROGRESSION TRACKER */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Startup Progress Stage
                </span>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {(Object.keys(STAGE_CONFIG) as StartupStage[]).map((stg, idx) => {
                    const cfg = STAGE_CONFIG[stg]
                    const currentIdx = Object.keys(STAGE_CONFIG).indexOf(inspectingStartup.stage)
                    const isPassed = idx <= currentIdx
                    const isCurrent = idx === currentIdx

                    return (
                      <div
                        key={stg}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-extrabold'
                            : isPassed
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                            : 'bg-white text-slate-400 border-slate-200 font-medium'
                        }`}
                      >
                        <cfg.Icon className="text-xs mx-auto mb-1" />
                        <div className="text-[10px] truncate">{cfg.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* PROBLEM & SOLUTION DESCRIPTION */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  About This Startup
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
                  {inspectingStartup.description}
                </p>
              </div>

              {/* TARGET MARKET & METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Target Customers
                  </span>
                  <p className="text-xs font-extrabold text-slate-800">
                    {inspectingStartup.targetMarket || 'Open / Kerala & Global'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Team Members
                  </span>
                  <p className="text-xs font-extrabold text-slate-800">
                    👥 {inspectingStartup.teamSize || 1} Member(s)
                  </p>
                </div>
              </div>

              {/* REQUIRED SKILLS NEEDED */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Skills Needed to Join ({inspectingStartup.requiredSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {inspectingStartup.requiredSkills.length > 0 ? (
                    inspectingStartup.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold shadow-2xs"
                      >
                        ⚡ {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No specific skills listed.</span>
                  )}
                </div>
              </div>

              {/* EXTERNAL LINKS */}
              {(inspectingStartup.websiteUrl || inspectingStartup.pitchDeckUrl) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {inspectingStartup.websiteUrl && (
                    <a
                      href={inspectingStartup.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>🌐</span> Visit Website
                    </a>
                  )}
                  {inspectingStartup.pitchDeckUrl && (
                    <a
                      href={inspectingStartup.pitchDeckUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>📊</span> View Pitch Deck
                    </a>
                  )}
                </div>
              )}

              {/* FOUNDER PROFILE CARD */}
              {inspectingStartup.founder && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {inspectingStartup.founder.avatar ? (
                      <img
                        src={inspectingStartup.founder.avatar}
                        alt={inspectingStartup.founder.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center">
                        {inspectingStartup.founder.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h5 className="text-xs font-black text-slate-900">{inspectingStartup.founder.name}</h5>
                      <span className="text-[11px] font-bold text-indigo-600">
                        {inspectingStartup.founder.role} • {inspectingStartup.founder.location || 'Kerala, IN'}
                      </span>
                      {inspectingStartup.founder.bio && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {inspectingStartup.founder.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <a
                    href={`mailto:${inspectingStartup.founder.email}`}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 transition-all shadow-2xs"
                  >
                    ✉️ Contact
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
              <span className="text-[11px] text-slate-400">
                Published on{' '}
                {new Date(inspectingStartup.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>

              <div className="flex items-center gap-2">
                {!isFounder && inspectingStartup.founderId !== user?.id && (
                  <button
                    onClick={() => {
                      const target = inspectingStartup
                      setInspectingStartup(null)
                      setApplyingStartup(target)
                    }}
                    className="px-5 py-2 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <FaUserPlus />
                    <span>Apply to Join</span>
                  </button>
                )}

                <button
                  onClick={() => setInspectingStartup(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPLY TO STARTUP MODAL */}
      <ApplyToStartupModal
        isOpen={!!applyingStartup}
        onClose={() => setApplyingStartup(null)}
        startupIdea={applyingStartup}
        user={user}
        token={token}
        onApplicationSuccess={() => {
          showToast('Team application submitted successfully!', 'success')
        }}
        onNavigateToRecruitment={
          onNavigateToRecruitment
            ? () => {
                const sid = applyingStartup?.id
                setApplyingStartup(null)
                onNavigateToRecruitment(sid)
              }
            : undefined
        }
      />

      {/* DELETE CONFIRMATION MODAL */}
      {deletingStartupId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 text-2xl flex items-center justify-center mx-auto">
              🗑️
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Delete Startup Idea?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete this startup idea? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingStartupId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStartup(deletingStartupId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default StartupIdeaManagement
