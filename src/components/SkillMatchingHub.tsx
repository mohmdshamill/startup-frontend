import { useState, useEffect, type FC } from 'react'
import skillMatchingHero from '../assets/skill_matching_hero.jpg'
import {
  FaRocket,
  FaUsers,
  FaSearch,
  FaStar,
  FaCheckCircle,
  FaFire,
  FaClock,
  FaMapMarkerAlt,
  FaFileAlt,
  FaExternalLinkAlt,
  FaTimes,
  FaBriefcase,
  FaGraduationCap,
  FaSlidersH,
  FaBolt,
  FaUserCheck,
  FaSyncAlt,
  FaPlus,
} from 'react-icons/fa'
import { ApplyToStartupModal } from './ApplyToStartupModal'
import { POPULAR_SKILL_SUGGESTIONS } from './StartupIdeaManagement'

export interface RecommendedStartup {
  id: string
  title: string
  tagline: string
  description: string
  category: string
  stage: string
  requiredSkills: string[]
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  matchRating: 'SUPER_MATCH' | 'GREAT_FIT' | 'GOOD_FIT' | 'PARTIAL_MATCH'
  existingApplication?: {
    id: string
    status: string
    roleApplied: string
    createdAt: string
  } | null
  founder?: {
    id: string
    name: string
    email: string
    avatar?: string | null
    role: string
    location?: string | null
  }
}

export interface RecommendedCandidate {
  id: string
  name: string
  email: string
  avatar?: string | null
  role: string
  bio?: string | null
  skills: string[]
  interests?: string[]
  location?: string | null
  website?: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
  resumeUrl?: string | null
  portfolioUrl?: string | null
  availabilityStatus?: string
  availabilityHoursPerWeek?: number
  workPreference?: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  matchRating: 'SUPER_MATCH' | 'GREAT_FIT' | 'GOOD_FIT' | 'PARTIAL_MATCH'
  existingApplication?: {
    status: string
    roleApplied: string
  } | null
  experience?: Array<{
    id: string
    title: string
    company: string
    startDate: string
    endDate?: string | null
    isCurrent?: boolean
    description?: string | null
  }>
  education?: Array<{
    id: string
    degree: string
    institution: string
    fieldOfStudy?: string | null
    startDate: string
    endDate?: string | null
    isCurrent?: boolean
  }>
}

interface SkillMatchingHubProps {
  user: any
  token: string
  onNavigateToStartups?: () => void
  onNavigateToRecruitment?: (startupId?: string) => void
  onNavigateToCollaboration?: (startupId?: string) => void
  onNavigateToProfile?: () => void
}

export const SkillMatchingHub: FC<SkillMatchingHubProps> = ({
  user,
  token,
  onNavigateToStartups,
  onNavigateToRecruitment,
  onNavigateToCollaboration,
  onNavigateToProfile,
}) => {
  const isFounder = user?.role === 'FOUNDER' || user?.role === 'ADMIN'
  const [activeTab, setActiveTab] = useState<'startups-for-me' | 'candidates-for-startup' | 'explorer'>(
    isFounder ? 'candidates-for-startup' : 'startups-for-me'
  )

  // Startups for me state
  const [startupsForMe, setStartupsForMe] = useState<RecommendedStartup[]>([])
  const [candidateSkills, setCandidateSkills] = useState<string[]>([])
  const [loadingStartups, setLoadingStartups] = useState(false)
  const [minMatchFilter, setMinMatchFilter] = useState<number>(0)
  const [selectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Teammates for founder startups state
  const [myStartupsList, setMyStartupsList] = useState<Array<{ id: string; title: string; requiredSkills: string[] }>>([])
  const [selectedStartupId, setSelectedStartupId] = useState<string>('')
  const [startupCandidates, setStartupCandidates] = useState<RecommendedCandidate[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)

  // Explorer state
  const [explorerSkills, setExplorerSkills] = useState<string[]>(['React', 'Node.js', 'UI/UX Design'])
  const [newExplorerSkill, setNewExplorerSkill] = useState('')
  const [explorerResults, setExplorerResults] = useState<{
    candidates: RecommendedCandidate[]
    startups: RecommendedStartup[]
  }>({ candidates: [], startups: [] })
  const [loadingExplorer, setLoadingExplorer] = useState(false)

  // Modals & detail views
  const [applyingStartup, setApplyingStartup] = useState<RecommendedStartup | null>(null)
  const [inspectingCandidate, setInspectingCandidate] = useState<RecommendedCandidate | null>(null)
  const [inviteSuccessMessage, setInviteSuccessMessage] = useState<string | null>(null)

  // Load recommended startups for user
  const fetchStartupsForMe = async () => {
    if (!token) return
    setLoadingStartups(true)
    try {
      const res = await fetch('http://localhost:5000/api/matching/startups-for-me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setStartupsForMe(data.startups || [])
        setCandidateSkills(data.candidateSkills || user?.skills || [])
      }
    } catch (err) {
      console.error('Error fetching matching startups:', err)
    } finally {
      setLoadingStartups(false)
    }
  }

  // Load founder startups list
  const fetchMyStartupsList = async () => {
    if (!token) return
    try {
      const res = await fetch('http://localhost:5000/api/startups/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.startups && data.startups.length > 0) {
        setMyStartupsList(data.startups)
        if (!selectedStartupId) {
          setSelectedStartupId(data.startups[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching founder startups:', err)
    }
  }

  // Load candidate recommendations for selected startup
  const fetchCandidatesForStartup = async (startupId: string) => {
    if (!token || !startupId) return
    setLoadingCandidates(true)
    try {
      const res = await fetch(`http://localhost:5000/api/matching/candidates-for-startup/${startupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setStartupCandidates(data.candidates || [])
      }
    } catch (err) {
      console.error('Error fetching candidate recommendations:', err)
    } finally {
      setLoadingCandidates(false)
    }
  }

  // Run explorer search
  const runExplorerSearch = async (skillsToSearch: string[]) => {
    if (!token) return
    setLoadingExplorer(true)
    try {
      const res = await fetch('http://localhost:5000/api/matching/explore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skills: skillsToSearch }),
      })
      const data = await res.json()
      if (res.ok) {
        setExplorerResults({
          candidates: data.candidates || [],
          startups: data.startups || [],
        })
      }
    } catch (err) {
      console.error('Error running skill explorer search:', err)
    } finally {
      setLoadingExplorer(false)
    }
  }

  useEffect(() => {
    fetchStartupsForMe()
    fetchMyStartupsList()
  }, [token])

  useEffect(() => {
    if (selectedStartupId) {
      fetchCandidatesForStartup(selectedStartupId)
    }
  }, [selectedStartupId, token])

  useEffect(() => {
    if (activeTab === 'explorer') {
      runExplorerSearch(explorerSkills)
    }
  }, [activeTab])

  const handleAddExplorerSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !explorerSkills.includes(trimmed)) {
      const updated = [...explorerSkills, trimmed]
      setExplorerSkills(updated)
      setNewExplorerSkill('')
      runExplorerSearch(updated)
    }
  }

  const handleRemoveExplorerSkill = (skillToRemove: string) => {
    const updated = explorerSkills.filter((s) => s !== skillToRemove)
    setExplorerSkills(updated)
    runExplorerSearch(updated)
  }

  const getMatchScoreBadge = (score: number) => {
    if (score >= 85) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
          <FaFire className="text-emerald-600 animate-bounce text-[11px]" />
          <span>{score}% Super Match</span>
        </span>
      )
    }
    if (score >= 70) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1.5 shadow-2xs">
          <FaStar className="text-purple-600 text-[11px]" />
          <span>{score}% Great Fit</span>
        </span>
      )
    }
    if (score >= 50) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1.5 shadow-2xs">
          <FaBolt className="text-sky-600 text-[11px]" />
          <span>{score}% Good Match</span>
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1.5 shadow-2xs">
        <span>{score}% Match</span>
      </span>
    )
  }

  // Filtered startups for me
  const filteredStartups = startupsForMe.filter((s) => {
    const matchesMinScore = s.matchScore >= minMatchFilter
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory
    const matchesSearch =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.requiredSkills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesMinScore && matchesCat && matchesSearch
  })

  // Selected startup details
  const currentSelectedStartup = myStartupsList.find((s) => s.id === selectedStartupId)

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner Header - Cyber Emerald Theme with Photorealistic Hero Background */}
      <div className="relative rounded-3xl text-white shadow-2xl overflow-hidden border border-emerald-900/40 bg-slate-950 min-h-[220px]">
        {/* Photorealistic Hero Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
          style={{ backgroundImage: `url(${skillMatchingHero})` }}
        />
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-teal-950/85 to-slate-900/60 backdrop-blur-[2px]" />

        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md border border-emerald-400/40 text-xs font-extrabold text-emerald-200 uppercase tracking-wider shadow-sm">
              <FaBolt className="text-amber-400 text-xs" />
              <span>AI Skill & Talent Matrix</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              Skill Matching & Recommendations
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal max-w-xl">
              Find matching startup ideas that need your skills, or discover the most suitable teammates for your startup in Kerala.
            </p>

            {/* Candidate Skills Pill Display */}
            {candidateSkills.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-emerald-200 mr-1">Your Skills:</span>
                {candidateSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-200 text-[11px] font-bold border border-emerald-500/40 flex items-center gap-1.5 shadow-xs"
                  >
                    <FaBolt className="text-amber-400 text-[10px]" />
                    <span>{sk}</span>
                  </span>
                ))}
                {onNavigateToProfile && (
                  <button
                    onClick={onNavigateToProfile}
                    className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline ml-2 cursor-pointer inline-flex items-center gap-1"
                  >
                    <FaPlus className="text-[10px]" />
                    <span>Add Skills</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateToCollaboration && (
              <button
                onClick={() => onNavigateToCollaboration(selectedStartupId || undefined)}
                className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md shadow-lg"
                title="Go to Collaboration Workspace"
              >
                <FaUsers className="text-emerald-400 text-xs" />
                <span>Workspace</span>
              </button>
            )}
            {onNavigateToRecruitment && (
              <button
                onClick={() => onNavigateToRecruitment()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-xl shadow-emerald-950/50 transition-all flex items-center gap-2 cursor-pointer border border-emerald-400/30"
              >
                <FaUsers className="text-xs" />
                <span>Recruitment Hub</span>
              </button>
            )}
            <button
              onClick={() => {
                fetchStartupsForMe()
                if (selectedStartupId) fetchCandidatesForStartup(selectedStartupId)
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-white/20 shadow-lg"
            >
              <FaSyncAlt className="text-xs" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('startups-for-me')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'startups-for-me'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaRocket className={activeTab === 'startups-for-me' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Recommended Startups ({startupsForMe.length})</span>
          </button>

          {isFounder && (
            <button
              onClick={() => setActiveTab('candidates-for-startup')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'candidates-for-startup'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FaUserCheck className={activeTab === 'candidates-for-startup' ? 'text-emerald-600' : 'text-slate-400'} />
              <span>Find Teammates for My Startups</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'explorer'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaSlidersH className={activeTab === 'explorer' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Skill Match Explorer</span>
          </button>
        </div>

        {/* Search Bar for current tab */}
        {activeTab === 'startups-for-me' && (
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search matching startups or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RECOMMENDED STARTUPS FOR ME                                        */}
      {/* ========================================================================= */}
      {activeTab === 'startups-for-me' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter by Match Score:</span>
              <button
                onClick={() => setMinMatchFilter(0)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  minMatchFilter === 0 ? 'bg-[#0b57d0] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Matches
              </button>
              <button
                onClick={() => setMinMatchFilter(50)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  minMatchFilter === 50 ? 'bg-[#0b57d0] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                50%+ Good Fit
              </button>
              <button
                onClick={() => setMinMatchFilter(70)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  minMatchFilter === 70 ? 'bg-[#0b57d0] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                70%+ Great Fit
              </button>
              <button
                onClick={() => setMinMatchFilter(85)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  minMatchFilter === 85 ? 'bg-[#0b57d0] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🔥 85%+ Super Match
              </button>
            </div>

            <span className="text-xs font-bold text-slate-500">
              Showing <strong>{filteredStartups.length}</strong> matching startups
            </span>
          </div>

          {/* Recommendations Cards Grid */}
          {loadingStartups ? (
            <div className="py-20 text-center text-xs font-bold text-[#0b57d0] animate-pulse">
              Finding startups matching your skills...
            </div>
          ) : filteredStartups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredStartups.map((startup) => (
                <div
                  key={startup.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  {/* Top Bar: Match Score & Category */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#0b57d0] border border-blue-200">
                        {startup.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {startup.stage}
                      </span>
                    </div>

                    {getMatchScoreBadge(startup.matchScore)}
                  </div>

                  {/* Startup Title & Tagline */}
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-[#0b57d0] transition-colors">
                      {startup.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-600 line-clamp-2">
                      "{startup.tagline}"
                    </p>
                  </div>

                  {/* Founder & Location info */}
                  <div className="flex items-center gap-2.5 pt-1 text-xs text-slate-500 font-medium">
                    {startup.founder?.avatar ? (
                      <img
                        src={startup.founder.avatar}
                        alt={startup.founder.name}
                        className="w-6 h-6 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-[#0b57d0] text-white flex items-center justify-center font-bold text-[10px]">
                        {startup.founder?.name ? startup.founder.name.charAt(0).toUpperCase() : 'F'}
                      </div>
                    )}
                    <span>Founder: <strong>{startup.founder?.name}</strong></span>
                    {startup.founder?.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-slate-400 text-[10px]" />
                          <span>{startup.founder.location}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Matched Skills Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700">
                        Matching Skills ({startup.matchedSkills.length}/{startup.requiredSkills.length})
                      </span>
                      <span className="font-extrabold text-[#0b57d0]">{startup.matchScore}% Skill Fit</span>
                    </div>

                    {/* Skill Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {startup.matchedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-200 flex items-center gap-1"
                        >
                          <FaCheckCircle className="text-emerald-600 text-[9px]" />
                          <span>{sk}</span>
                        </span>
                      ))}

                      {startup.missingSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-200 text-slate-600 font-medium text-[11px]"
                        >
                          + {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    {!isFounder && (
                      startup.existingApplication ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0b57d0] text-xs font-bold border border-blue-200">
                            Applied ({startup.existingApplication.status})
                          </span>
                          {onNavigateToRecruitment && (
                            <button
                              onClick={() => onNavigateToRecruitment()}
                              className="text-xs font-bold text-[#0b57d0] hover:underline cursor-pointer"
                            >
                              Track Status →
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setApplyingStartup(startup)}
                          className="px-5 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                        >
                          <FaRocket className="text-xs" />
                          <span>Apply to Join</span>
                        </button>
                      )
                    )}

                    {onNavigateToStartups && (
                      <button
                        onClick={onNavigateToStartups}
                        className="px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                      >
                        View Full Idea →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <span className="text-4xl">💡</span>
              <h3 className="text-base font-extrabold text-slate-900">No Matching Startups Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try updating your registered skills in your profile to discover more matching startup ideas.
              </p>
              {onNavigateToProfile && (
                <button
                  onClick={onNavigateToProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#0b57d0] text-white text-xs font-bold hover:bg-[#0047ba] cursor-pointer"
                >
                  Update Profile Skills
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FIND TEAMMATES FOR MY STARTUPS (Founder Mode)                      */}
      {/* ========================================================================= */}
      {isFounder && activeTab === 'candidates-for-startup' && (
        <div className="space-y-6">
          {inviteSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <FaCheckCircle className="text-emerald-600" />
              <span>{inviteSuccessMessage}</span>
            </div>
          )}

          {myStartupsList.length > 0 ? (
            <div className="space-y-6">
              {/* Startup Selector Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                      Choose Your Startup Idea:
                    </label>
                    <select
                      value={selectedStartupId}
                      onChange={(e) => setSelectedStartupId(e.target.value)}
                      className="p-3 rounded-xl border border-slate-300 text-sm font-black text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] cursor-pointer"
                    >
                      {myStartupsList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentSelectedStartup && (
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-slate-500 block">Required Skills for this Startup:</span>
                      <div className="flex flex-wrap gap-1">
                        {currentSelectedStartup.requiredSkills?.map((sk) => (
                          <span
                            key={sk}
                            className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#0b57d0] font-bold text-[11px] border border-blue-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Candidates List */}
              {loadingCandidates ? (
                <div className="py-20 text-center text-xs font-bold text-[#0b57d0] animate-pulse">
                  Finding best candidates matching {currentSelectedStartup?.title || 'your startup'}...
                </div>
              ) : startupCandidates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {startupCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
                    >
                      {/* Candidate Top Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {cand.avatar ? (
                            <img
                              src={cand.avatar}
                              alt={cand.name}
                              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-100 shadow-md"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0b57d0] to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                              {cand.name ? cand.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <h3 className="text-base font-black text-slate-900">{cand.name}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-[#0b57d0]">
                              {cand.role}
                            </span>
                            {cand.location && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                                <FaMapMarkerAlt className="text-slate-400 text-[10px]" />
                                <span>{cand.location}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {getMatchScoreBadge(cand.matchScore)}
                      </div>

                      {/* Bio */}
                      {cand.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 italic font-normal">
                          "{cand.bio}"
                        </p>
                      )}

                      {/* Matching Skills Breakdown */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                        <span className="font-bold text-slate-700 block text-[11px]">
                          Matching Skills ({cand.matchedSkills.length}/{currentSelectedStartup?.requiredSkills.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cand.matchedSkills.map((sk) => (
                            <span
                              key={sk}
                              className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-200 flex items-center gap-1"
                            >
                              <FaCheckCircle className="text-emerald-600 text-[9px]" />
                              <span>{sk}</span>
                            </span>
                          ))}
                          {cand.skills?.filter((s) => !cand.matchedSkills.includes(s)).slice(0, 3).map((sk) => (
                            <span
                              key={sk}
                              className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-600 font-medium text-[11px]"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Availability Highlights */}
                      <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <FaClock className="text-[#0b57d0]" />
                          <span>{cand.availabilityHoursPerWeek || 20} hrs/week</span>
                        </span>
                        {cand.workPreference && (
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">
                            {cand.workPreference}
                          </span>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          onClick={() => setInspectingCandidate(cand)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          View Profile & CV
                        </button>

                        <button
                          onClick={() => {
                            setInviteSuccessMessage(`Invitation link prepared for ${cand.name}! You can message them at ${cand.email}.`)
                            setTimeout(() => setInviteSuccessMessage(null), 5000)
                          }}
                          className="px-4 py-1.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          Contact / Invite
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                  <span className="text-4xl">👥</span>
                  <h3 className="text-base font-extrabold text-slate-900">No Candidates Found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try updating the required skills in your startup idea to broaden your match scope.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <span className="text-4xl">🚀</span>
              <h3 className="text-base font-extrabold text-slate-900">Post a Startup Idea to Find Teammates</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once you post a startup idea with required skills, our smart matching engine will recommend skilled candidates across Kerala.
              </p>
              {onNavigateToStartups && (
                <button
                  onClick={onNavigateToStartups}
                  className="px-6 py-2.5 rounded-xl bg-[#0b57d0] text-white text-xs font-bold hover:bg-[#0047ba] cursor-pointer shadow-md"
                >
                  Publish a Startup Idea
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SKILL MATCH EXPLORER (Live combination search)                      */}
      {/* ========================================================================= */}
      {activeTab === 'explorer' && (
        <div className="space-y-6">
          {/* Skill Selector Builder */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900">Live Skill Match Builder</h3>
              <p className="text-xs text-slate-500">
                Pick or type skills to find matching talent and matching startup ideas in real time.
              </p>
            </div>

            {/* Input and Add */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill to match (e.g. Python, Flutter, Figma)..."
                value={newExplorerSkill}
                onChange={(e) => setNewExplorerSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddExplorerSkill(newExplorerSkill)
                  }
                }}
                className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
              />
              <button
                type="button"
                onClick={() => handleAddExplorerSkill(newExplorerSkill)}
                className="px-5 py-2.5 rounded-xl bg-[#0b57d0] text-white text-xs font-bold hover:bg-[#0047ba] cursor-pointer"
              >
                + Add Skill
              </button>
            </div>

            {/* Selected Skills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {explorerSkills.map((sk) => (
                <span
                  key={sk}
                  className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>⚡ {sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExplorerSkill(sk)}
                    className="text-indigo-400 hover:text-red-500 text-xs cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILL_SUGGESTIONS.slice(0, 10).map((sk) => (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => handleAddExplorerSkill(sk)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer border border-slate-200"
                  >
                    + {sk}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Explorer Results */}
          {loadingExplorer ? (
            <div className="py-20 text-center text-xs font-bold text-[#0b57d0] animate-pulse">
              Computing matching scores...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Column 1: Matching Candidates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FaUsers className="text-[#0b57d0]" />
                    <span>Matching Candidates ({explorerResults.candidates.length})</span>
                  </h4>
                </div>

                {explorerResults.candidates.length > 0 ? (
                  <div className="space-y-3">
                    {explorerResults.candidates.map((cand) => (
                      <div
                        key={cand.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            {cand.avatar ? (
                              <img src={cand.avatar} alt={cand.name} className="w-9 h-9 rounded-xl object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-[#0b57d0] text-white flex items-center justify-center font-bold text-xs">
                                {cand.name ? cand.name.charAt(0).toUpperCase() : 'C'}
                              </div>
                            )}
                            <div>
                              <h5 className="text-xs font-black text-slate-900">{cand.name}</h5>
                              <p className="text-[10px] text-slate-500">{cand.role} {cand.location ? `• ${cand.location}` : ''}</p>
                            </div>
                          </div>
                          {getMatchScoreBadge(cand.matchScore)}
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {cand.matchedSkills?.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                    No candidates matched the selected skills.
                  </div>
                )}
              </div>

              {/* Column 2: Matching Startups */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FaRocket className="text-purple-600" />
                    <span>Matching Startups ({explorerResults.startups.length})</span>
                  </h4>
                </div>

                {explorerResults.startups.length > 0 ? (
                  <div className="space-y-3">
                    {explorerResults.startups.map((st) => (
                      <div
                        key={st.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h5 className="text-xs font-black text-slate-900">{st.title}</h5>
                            <p className="text-[10px] text-slate-500">{st.category} • {st.stage}</p>
                          </div>
                          {getMatchScoreBadge(st.matchScore)}
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-2 italic font-normal">
                          "{st.tagline}"
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {st.matchedSkills?.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                    No startup ideas matched the selected skills.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CANDIDATE DETAIL INSPECTION MODAL                                        */}
      {/* ========================================================================= */}
      {inspectingCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-[#0052cc] text-white p-6 relative">
              <button
                onClick={() => setInspectingCandidate(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>

              <div className="flex items-center gap-4">
                {inspectingCandidate.avatar ? (
                  <img
                    src={inspectingCandidate.avatar}
                    alt={inspectingCandidate.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl">
                    {inspectingCandidate.name ? inspectingCandidate.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-black">{inspectingCandidate.name}</h3>
                  <p className="text-xs text-blue-200">
                    {inspectingCandidate.role} • {inspectingCandidate.email}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {inspectingCandidate.resumeUrl && (
                      <a
                        href={inspectingCandidate.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={
                          inspectingCandidate.resumeUrl.startsWith('data:')
                            ? `${inspectingCandidate.name.replace(/\s+/g, '_')}_CV.pdf`
                            : undefined
                        }
                        className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-colors flex items-center gap-1.5 backdrop-blur-xs"
                      >
                        <FaFileAlt className="text-xs" />
                        <span>View / Download CV</span>
                      </a>
                    )}
                    {inspectingCandidate.portfolioUrl && (
                      <a
                        href={inspectingCandidate.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-colors flex items-center gap-1.5 backdrop-blur-xs"
                      >
                        <FaExternalLinkAlt className="text-[10px]" />
                        <span>Portfolio</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 flex-1">
              {/* Bio */}
              {inspectingCandidate.bio && (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-[#0b57d0] block">About Candidate</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {inspectingCandidate.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500 block">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingCandidate.skills?.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              {inspectingCandidate.experience && inspectingCandidate.experience.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                    <FaBriefcase className="text-[#0b57d0]" />
                    <span>Work Experience</span>
                  </span>
                  <div className="space-y-2">
                    {inspectingCandidate.experience.map((exp: any) => (
                      <div key={exp.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{exp.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                          </span>
                        </div>
                        <p className="text-blue-700 font-semibold">{exp.company}</p>
                        {exp.description && <p className="text-slate-600">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {inspectingCandidate.education && inspectingCandidate.education.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                    <FaGraduationCap className="text-[#0b57d0]" />
                    <span>Education</span>
                  </span>
                  <div className="space-y-2">
                    {inspectingCandidate.education.map((edu: any) => (
                      <div key={edu.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{edu.degree}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(edu.startDate).getFullYear()} - {edu.isCurrent ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                          </span>
                        </div>
                        <p className="text-blue-700 font-semibold">{edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectingCandidate(null)}
                className="px-6 py-2 rounded-xl bg-[#0b57d0] text-white text-xs font-bold hover:bg-[#0047ba] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* APPLY TO STARTUP MODAL                                                   */}
      {/* ========================================================================= */}
      {applyingStartup && (
        <ApplyToStartupModal
          isOpen={!!applyingStartup}
          onClose={() => setApplyingStartup(null)}
          startupIdea={applyingStartup}
          user={user}
          token={token}
          onApplicationSuccess={() => {
            fetchStartupsForMe()
          }}
          onNavigateToRecruitment={onNavigateToRecruitment}
        />
      )}

    </div>
  )
}
