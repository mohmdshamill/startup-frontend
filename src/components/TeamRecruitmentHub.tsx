import { useState, useEffect, type FC } from 'react'
import recruitmentHubHero from '../assets/recruitment_hub_hero.jpg'
import {
  FaUsers,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaClock,
  FaFileAlt,
  FaExternalLinkAlt,
  FaTimes,
  FaBriefcase,
  FaGraduationCap,
  FaUserCheck,
  FaHourglassHalf,
  FaBan,
  FaEye,
  FaRocket,
  FaSyncAlt,
} from 'react-icons/fa'

export interface ApplicationItem {
  id: string
  startupIdeaId: string
  candidateId: string
  roleApplied: string
  pitchMessage: string
  skills: string[]
  availabilityHoursPerWeek: number
  portfolioUrl?: string | null
  resumeUrl?: string | null
  status: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  founderFeedback?: string | null
  reviewedAt?: string | null
  createdAt: string
  updatedAt: string
  startupIdea?: {
    id: string
    title: string
    category: string
    stage: string
    founder?: {
      id: string
      name: string
      email: string
      avatar?: string | null
      role: string
      location?: string | null
      linkedinUrl?: string | null
    }
  }
  candidate?: {
    id: string
    name: string
    email: string
    phone?: string | null
    avatar?: string | null
    role: string
    bio?: string | null
    skills: string[]
    location?: string | null
    website?: string | null
    githubUrl?: string | null
    linkedinUrl?: string | null
    resumeUrl?: string | null
    resumeFileName?: string | null
    availabilityStatus: string
    availabilityHoursPerWeek?: number | null
    workPreference: string
    noticePeriod?: string | null
    experience?: any[]
    education?: any[]
    portfolioItems?: any[]
  }
}

interface TeamRecruitmentHubProps {
  user: any
  token: string
  initialStartupId?: string
  onNavigateToStartups?: () => void
}

export const TeamRecruitmentHub: FC<TeamRecruitmentHubProps> = ({
  user,
  token,
  initialStartupId,
  onNavigateToStartups,
}) => {
  const isFounder = user?.role === 'FOUNDER' || user?.role === 'ADMIN'

  // Determine default tab: if user is FOUNDER or ADMIN, default to 'founder-pipeline', otherwise 'my-applications'
  const [activeTab, setActiveTab] = useState<'founder-pipeline' | 'my-applications'>(
    isFounder ? 'founder-pipeline' : 'my-applications'
  )

  // Data states
  const [founderApplications, setFounderApplications] = useState<ApplicationItem[]>([])
  const [founderStartups, setFounderStartups] = useState<any[]>([])
  const [founderStats, setFounderStats] = useState({
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0,
  })
  const [candidateApplications, setCandidateApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter & Search states
  const [selectedStartupFilter, setSelectedStartupFilter] = useState<string>(initialStartupId || 'all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (initialStartupId && isFounder) {
      setSelectedStartupFilter(initialStartupId)
      setActiveTab('founder-pipeline')
    } else if (!isFounder) {
      setActiveTab('my-applications')
    }
  }, [initialStartupId, isFounder])

  // Action Modals
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<ApplicationItem | null>(null)
  const [decisionModal, setDecisionModal] = useState<{
    application: ApplicationItem
    action: 'ACCEPTED' | 'REJECTED' | 'SHORTLISTED' | 'REVIEWING'
  } | null>(null)
  const [feedbackNote, setFeedbackNote] = useState('')
  const [processingAction, setProcessingAction] = useState(false)

  // Fetch Founder Pipeline Data
  const fetchFounderData = async () => {
    if (!token || !isFounder) return
    try {
      const res = await fetch('http://localhost:5000/api/applications/founder/all', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setFounderApplications(data.applications || [])
        setFounderStartups(data.startups || [])
        if (data.stats) setFounderStats(data.stats)
      }
    } catch (err: any) {
      console.error('Error fetching founder applications:', err)
    }
  }

  // Fetch Candidate Applications Data
  const fetchCandidateData = async () => {
    if (!token) return
    try {
      const res = await fetch('http://localhost:5000/api/applications/my-applications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setCandidateApplications(data.applications || [])
      }
    } catch (err: any) {
      console.error('Error fetching candidate applications:', err)
    }
  }

  const loadAllData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isFounder) {
        await Promise.all([fetchFounderData(), fetchCandidateData()])
      } else {
        await fetchCandidateData()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load recruitment data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [token])

  // Handle Founder Decision (Accept / Reject / Shortlist)
  const handleConfirmDecision = async () => {
    if (!decisionModal || !token) return
    setProcessingAction(true)

    try {
      const res = await fetch(`http://localhost:5000/api/applications/${decisionModal.application.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: decisionModal.action,
          founderFeedback: feedbackNote.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update application status')
      }

      setDecisionModal(null)
      setFeedbackNote('')
      // Refresh data
      await fetchFounderData()
    } catch (err: any) {
      alert(err.message || 'Failed to process decision.')
    } finally {
      setProcessingAction(false)
    }
  }

  // Handle Candidate Withdrawal
  const handleWithdrawApplication = async (appId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return

    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}/withdraw`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to withdraw application')
      }
      await fetchCandidateData()
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw application.')
    }
  }

  // Filtered applications for founder
  const filteredFounderApps = founderApplications.filter((app) => {
    const matchesStartup =
      selectedStartupFilter === 'all' || app.startupIdeaId === selectedStartupFilter
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesSearch =
      !searchQuery.trim() ||
      app.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.roleApplied?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.startupIdea?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesStartup && matchesStatus && matchesSearch
  })

  // Filtered applications for candidate
  const filteredCandidateApps = candidateApplications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesSearch =
      !searchQuery.trim() ||
      app.startupIdea?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.roleApplied?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.startupIdea?.category?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: ApplicationItem['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
            <FaHourglassHalf className="text-amber-600 animate-pulse text-[10px]" />
            <span>Pending Review</span>
          </span>
        )
      case 'REVIEWING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1.5 shadow-2xs">
            <FaEye className="text-sky-600 text-[10px]" />
            <span>In Review</span>
          </span>
        )
      case 'SHORTLISTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1.5 shadow-2xs">
            <FaStar className="text-purple-600 text-[10px]" />
            <span>Shortlisted</span>
          </span>
        )
      case 'ACCEPTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
            <FaCheckCircle className="text-emerald-600 text-[10px]" />
            <span>Accepted / Offer Sent</span>
          </span>
        )
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5 shadow-2xs">
            <FaTimesCircle className="text-rose-600 text-[10px]" />
            <span>Not Selected</span>
          </span>
        )
      case 'WITHDRAWN':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1.5 shadow-2xs">
            <FaBan className="text-slate-400 text-[10px]" />
            <span>Withdrawn</span>
          </span>
        )
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner Header - Executive Rose / Coral Theme with Photorealistic Hero Background */}
      <div className="relative rounded-3xl text-white shadow-2xl overflow-hidden border border-rose-900/40 bg-slate-950 min-h-[220px]">
        {/* Photorealistic Hero Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
          style={{ backgroundImage: `url(${recruitmentHubHero})` }}
        />
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-rose-950/85 to-slate-900/60 backdrop-blur-[2px]" />

        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/30 backdrop-blur-md border border-rose-400/40 text-xs font-extrabold text-rose-200 uppercase tracking-wider shadow-sm">
              <FaUsers className="text-rose-400 text-xs" />
              <span>{isFounder ? 'Executive Hiring & Applications' : 'My Application Tracking'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              {isFounder ? 'Team Hiring & Applications' : 'My Submitted Applications'}
            </h2>
            <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed font-normal max-w-xl">
              {isFounder
                ? 'Review people who applied to your startups, accept or reject candidates, and track your submitted applications.'
                : 'Track the review status of startups you applied to join, see founder feedback, and check if you got accepted.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateToStartups && (
              <button
                onClick={onNavigateToStartups}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs shadow-xl shadow-rose-950/50 transition-all flex items-center gap-2 cursor-pointer border border-rose-400/30"
              >
                <FaRocket className="text-xs" />
                <span>Browse Startup Ideas</span>
              </button>
            )}
            <button
              onClick={loadAllData}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-white/20 shadow-lg"
            >
              <FaSyncAlt className="text-xs" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800 cursor-pointer">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {isFounder && (
            <button
              onClick={() => {
                setActiveTab('founder-pipeline')
                setStatusFilter('all')
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'founder-pipeline'
                  ? 'bg-white text-[#0b57d0] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FaUserCheck className={activeTab === 'founder-pipeline' ? 'text-[#0b57d0]' : 'text-slate-400'} />
              <span>Applicants for My Startups ({founderApplications.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab('my-applications')
              setStatusFilter('all')
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'my-applications'
                ? 'bg-white text-[#0b57d0] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaBriefcase className={activeTab === 'my-applications' ? 'text-[#0b57d0]' : 'text-slate-400'} />
            <span>My Submitted Applications ({candidateApplications.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder={
              isFounder && activeTab === 'founder-pipeline'
                ? 'Search by candidate name, role, or skill...'
                : 'Search by startup title, role, or skill...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] shadow-2xs"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FOUNDER RECRUITMENT PIPELINE                                      */}
      {/* ========================================================================= */}
      {isFounder && activeTab === 'founder-pipeline' && (
        <div className="space-y-6">
          
          {/* Status Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div
              onClick={() => setStatusFilter('all')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-blue-50/80 border-[#0b57d0] ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Total Applicants</span>
              <span className="text-2xl font-black text-slate-900">{founderApplications.length}</span>
            </div>

            <div
              onClick={() => setStatusFilter('PENDING')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase text-amber-700 block mb-1">New / Pending</span>
              <span className="text-2xl font-black text-amber-700">{founderStats.pending}</span>
            </div>

            <div
              onClick={() => setStatusFilter('SHORTLISTED')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'SHORTLISTED'
                  ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase text-purple-700 block mb-1">Shortlisted</span>
              <span className="text-2xl font-black text-purple-700">{founderStats.shortlisted}</span>
            </div>

            <div
              onClick={() => setStatusFilter('ACCEPTED')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'ACCEPTED'
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase text-emerald-700 block mb-1">Accepted</span>
              <span className="text-2xl font-black text-emerald-700">{founderStats.accepted}</span>
            </div>

            <div
              onClick={() => setStatusFilter('REJECTED')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'REJECTED'
                  ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase text-rose-700 block mb-1">Rejected</span>
              <span className="text-2xl font-black text-rose-700">{founderStats.rejected}</span>
            </div>
          </div>

          {/* Startup Selector Filter (if founder has multiple startups) */}
          {founderStartups.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-bold text-slate-500 shrink-0">Filter by Startup:</span>
              <button
                onClick={() => setSelectedStartupFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedStartupFilter === 'all'
                    ? 'bg-[#0b57d0] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All My Startups ({founderApplications.length})
              </button>
              {founderStartups.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStartupFilter(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedStartupFilter === s.id
                      ? 'bg-[#0b57d0] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}

          {/* Candidate Applications List */}
          {loading ? (
            <div className="py-16 text-center text-xs font-bold text-[#0b57d0] animate-pulse">
              Loading recruitment pipeline candidates...
            </div>
          ) : filteredFounderApps.length > 0 ? (
            <div className="space-y-4">
              {filteredFounderApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all space-y-4"
                >
                  {/* Candidate Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        {app.candidate?.avatar ? (
                          <img
                            src={app.candidate.avatar}
                            alt={app.candidate.name}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100 shadow-md"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0b57d0] to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                            {app.candidate?.name ? app.candidate.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white"></span>
                      </div>

                      {/* Candidate Meta Info */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-slate-900">{app.candidate?.name}</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-[#0b57d0]">
                            {app.candidate?.role}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>📧 {app.candidate?.email}</span>
                          {app.candidate?.phone && <span>📞 {app.candidate.phone}</span>}
                          {app.candidate?.location && <span>📍 {app.candidate.location}</span>}
                        </p>

                        <div className="pt-1 flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-700">Applied for: </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#0b57d0] font-extrabold border border-blue-200">
                            {app.roleApplied}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="font-semibold text-slate-600">
                            Startup: <strong>{app.startupIdea?.title}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Timestamp */}
                    <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                      {getStatusBadge(app.status)}
                      <span className="text-[10px] text-slate-400 font-medium">
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Candidate Pitch Note */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      Applicant Note / Message
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      "{app.pitchMessage}"
                    </p>
                  </div>

                  {/* Skills & Availability Highlights */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">Skills:</span>
                      {app.skills?.map((skill) => (
                        <span key={skill} className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#0b57d0] text-[11px] font-bold border border-blue-100">
                          {skill}
                        </span>
                      ))}
                      {(!app.skills || app.skills.length === 0) && (
                        <span className="text-slate-400 italic text-xs">No specific skills listed</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-semibold text-slate-600">
                      <span className="flex items-center gap-1">
                        <FaClock className="text-[#0b57d0]" />
                        <span>{app.availabilityHoursPerWeek || 20} hrs/week</span>
                      </span>
                      {app.candidate?.workPreference && (
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">
                          {app.candidate.workPreference}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Founder Feedback Note (if present) */}
                  {app.founderFeedback && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                        Your Message to Candidate
                      </span>
                      <p className="font-medium">{app.founderFeedback}</p>
                    </div>
                  )}

                  {/* Action Bar (Review, Shortlist, Accept, Reject, Full Profile) */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    {/* External Links */}
                    <div className="flex items-center gap-2">
                      {(app.resumeUrl || app.candidate?.resumeUrl) && (
                        <a
                          href={app.resumeUrl || app.candidate?.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={
                            (app.resumeUrl || app.candidate?.resumeUrl)?.startsWith('data:')
                              ? `${app.candidate?.name?.replace(/\s+/g, '_') || 'Candidate'}_CV.pdf`
                              : undefined
                          }
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0b57d0] text-xs font-bold transition-colors flex items-center gap-1.5 border border-blue-200"
                        >
                          <FaFileAlt className="text-[#0b57d0] text-[10px]" />
                          <span>View CV / Resume</span>
                        </a>
                      )}
                      {app.portfolioUrl && (
                        <a
                          href={app.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <FaExternalLinkAlt className="text-emerald-600 text-[10px]" />
                          <span>Portfolio</span>
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedCandidateDetail(app)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0b57d0] text-xs font-bold transition-colors cursor-pointer"
                      >
                        View Full Profile
                      </button>
                    </div>

                    {/* Decision Action Buttons */}
                    <div className="flex items-center gap-2">
                      {app.status === 'PENDING' && (
                        <button
                          onClick={() => setDecisionModal({ application: app, action: 'REVIEWING' })}
                          className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold border border-sky-200 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <FaEye />
                          <span>Review</span>
                        </button>
                      )}

                      {app.status !== 'SHORTLISTED' && app.status !== 'ACCEPTED' && (
                        <button
                          onClick={() => setDecisionModal({ application: app, action: 'SHORTLISTED' })}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold border border-purple-200 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <FaStar />
                          <span>Shortlist</span>
                        </button>
                      )}

                      {app.status !== 'ACCEPTED' && (
                        <button
                          onClick={() => setDecisionModal({ application: app, action: 'ACCEPTED' })}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <FaCheckCircle />
                          <span>Accept Applicant</span>
                        </button>
                      )}

                      {app.status !== 'REJECTED' && (
                        <button
                          onClick={() => setDecisionModal({ application: app, action: 'REJECTED' })}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <FaTimesCircle />
                          <span>Reject Applicant</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <span className="text-4xl">👥</span>
              <h3 className="text-base font-extrabold text-slate-900">No Candidate Applications Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {founderApplications.length === 0
                  ? "You haven't received any applications for your startup ideas yet. Share your startup idea to find teammates!"
                  : "No applications match your current status or search filter."}
              </p>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CANDIDATE "MY SUBMITTED APPLICATIONS"                              */}
      {/* ========================================================================= */}
      {activeTab === 'my-applications' && (
        <div className="space-y-6">
          
          {loading ? (
            <div className="py-16 text-center text-xs font-bold text-[#0b57d0] animate-pulse">
              Loading your submitted applications...
            </div>
          ) : filteredCandidateApps.length > 0 ? (
            <div className="space-y-4">
              {filteredCandidateApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all space-y-4"
                >
                  {/* Startup Meta & Status Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900">{app.startupIdea?.title}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#0b57d0] border border-blue-200">
                          {app.startupIdea?.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {app.startupIdea?.stage}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium">
                        Founder: <strong>{app.startupIdea?.founder?.name}</strong> •{' '}
                        <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                      </p>

                      <div className="pt-1 flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-700">Position Applied:</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200">
                          {app.roleApplied}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-semibold">{app.availabilityHoursPerWeek} hrs/week committed</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>

                  {/* Recruitment Progress Stepper */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-3">
                      Application Status Progress
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {/* Step 1: Submitted */}
                      <div className="space-y-1">
                        <div className="w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                          ✓
                        </div>
                        <span className="text-[11px] font-bold text-slate-800">Submitted</span>
                      </div>

                      {/* Step 2: Under Review */}
                      <div className="space-y-1">
                        <div className={`w-6 h-6 mx-auto rounded-full text-[10px] font-bold flex items-center justify-center ${
                          app.status === 'REVIEWING' || app.status === 'SHORTLISTED' || app.status === 'ACCEPTED'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {app.status === 'REVIEWING' || app.status === 'SHORTLISTED' || app.status === 'ACCEPTED' ? '✓' : '2'}
                        </div>
                        <span className="text-[11px] font-bold text-slate-800">In Review</span>
                      </div>

                      {/* Step 3: Shortlisted */}
                      <div className="space-y-1">
                        <div className={`w-6 h-6 mx-auto rounded-full text-[10px] font-bold flex items-center justify-center ${
                          app.status === 'SHORTLISTED' || app.status === 'ACCEPTED'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {app.status === 'SHORTLISTED' || app.status === 'ACCEPTED' ? '✓' : '3'}
                        </div>
                        <span className="text-[11px] font-bold text-slate-800">Shortlisted</span>
                      </div>

                      {/* Step 4: Decision Offer */}
                      <div className="space-y-1">
                        <div className={`w-6 h-6 mx-auto rounded-full text-[10px] font-bold flex items-center justify-center ${
                          app.status === 'ACCEPTED'
                            ? 'bg-emerald-500 text-white'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {app.status === 'ACCEPTED' ? '✓' : app.status === 'REJECTED' ? '✕' : '4'}
                        </div>
                        <span className="text-[11px] font-bold text-slate-800">
                          {app.status === 'ACCEPTED' ? 'Accepted' : app.status === 'REJECTED' ? 'Not Selected' : 'Final Decision'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submitted Pitch */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Your Application Message
                    </span>
                    <p className="italic font-normal">"{app.pitchMessage}"</p>
                  </div>

                  {/* Founder Feedback Notice */}
                  {app.founderFeedback && (
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#0b57d0]">
                        <span>💬 Message from Founder ({app.startupIdea?.founder?.name}):</span>
                      </div>
                      <p className="text-slate-800 font-medium">{app.founderFeedback}</p>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Application ID: <span className="font-mono">{app.id.slice(0, 8)}...</span>
                    </span>

                    {(app.status === 'PENDING' || app.status === 'REVIEWING' || app.status === 'SHORTLISTED') && (
                      <button
                        onClick={() => handleWithdrawApplication(app.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <FaBan className="text-[10px]" />
                        <span>Withdraw Application</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <span className="text-4xl">🚀</span>
              <h3 className="text-base font-extrabold text-slate-900">No Applications Submitted Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Discover early-stage startup ideas and ambitious founders looking for your skills!
              </p>
              {onNavigateToStartups && (
                <button
                  onClick={onNavigateToStartups}
                  className="px-6 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Browse Startup Ideas & Apply
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* DECISION ACTION MODAL (Accept / Reject / Shortlist with Founder Notes)   */}
      {/* ========================================================================= */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full my-auto overflow-hidden animate-in zoom-in-95 duration-150">
            <div className={`p-6 text-white ${
              decisionModal.action === 'ACCEPTED'
                ? 'bg-emerald-600'
                : decisionModal.action === 'REJECTED'
                ? 'bg-rose-600'
                : 'bg-blue-600'
            }`}>
              <h3 className="text-xl font-black">
                {decisionModal.action === 'ACCEPTED'
                  ? 'Accept Applicant'
                  : decisionModal.action === 'REJECTED'
                  ? 'Reject Applicant'
                  : decisionModal.action === 'SHORTLISTED'
                  ? 'Shortlist Applicant'
                  : 'Mark Application In Review'}
              </h3>
              <p className="text-xs text-white/90 mt-1">
                Candidate: <strong>{decisionModal.application.candidate?.name}</strong> • Role: <strong>{decisionModal.application.roleApplied}</strong>
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  {decisionModal.action === 'ACCEPTED'
                    ? 'Message to Applicant (Optional)'
                    : decisionModal.action === 'REJECTED'
                    ? 'Reason / Note to Applicant (Optional)'
                    : 'Notes / Next Steps (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder={
                    decisionModal.action === 'ACCEPTED'
                      ? 'e.g. Welcome to our startup! We will contact you soon for next steps...'
                      : decisionModal.action === 'REJECTED'
                      ? 'e.g. Thank you for your interest. We are looking for candidates with different skills right now...'
                      : 'Add any review notes or meeting details...'
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setDecisionModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                disabled={processingAction}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                  decisionModal.action === 'ACCEPTED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : decisionModal.action === 'REJECTED'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#0b57d0] hover:bg-[#0047ba]'
                }`}
              >
                {processingAction
                  ? 'Updating...'
                  : decisionModal.action === 'ACCEPTED'
                  ? 'Confirm Accept'
                  : decisionModal.action === 'REJECTED'
                  ? 'Confirm Reject'
                  : decisionModal.action === 'SHORTLISTED'
                  ? 'Confirm Shortlist'
                  : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CANDIDATE FULL CREDENTIALS INSPECTION MODAL                              */}
      {/* ========================================================================= */}
      {selectedCandidateDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-[#0052cc] text-white p-6 relative">
              <button
                onClick={() => setSelectedCandidateDetail(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>

              <div className="flex items-center gap-4">
                {selectedCandidateDetail.candidate?.avatar ? (
                  <img
                    src={selectedCandidateDetail.candidate.avatar}
                    alt={selectedCandidateDetail.candidate.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl">
                    {selectedCandidateDetail.candidate?.name ? selectedCandidateDetail.candidate.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-black">{selectedCandidateDetail.candidate?.name}</h3>
                  <p className="text-xs text-blue-200">
                    {selectedCandidateDetail.candidate?.role} • {selectedCandidateDetail.candidate?.email}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {(selectedCandidateDetail.resumeUrl || selectedCandidateDetail.candidate?.resumeUrl) && (
                      <a
                        href={selectedCandidateDetail.resumeUrl || selectedCandidateDetail.candidate?.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={
                          (selectedCandidateDetail.resumeUrl || selectedCandidateDetail.candidate?.resumeUrl)?.startsWith('data:')
                            ? `${selectedCandidateDetail.candidate?.name?.replace(/\s+/g, '_') || 'Candidate'}_CV.pdf`
                            : undefined
                        }
                        className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-colors flex items-center gap-1.5 backdrop-blur-xs"
                      >
                        <FaFileAlt className="text-xs" />
                        <span>View / Download CV</span>
                      </a>
                    )}
                    {selectedCandidateDetail.portfolioUrl && (
                      <a
                        href={selectedCandidateDetail.portfolioUrl}
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
              {selectedCandidateDetail.candidate?.bio && (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-[#0b57d0] block">About Candidate</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {selectedCandidateDetail.candidate.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500 block">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidateDetail.candidate?.skills?.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              {selectedCandidateDetail.candidate?.experience && selectedCandidateDetail.candidate.experience.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                    <FaBriefcase className="text-[#0b57d0]" />
                    <span>Work Experience</span>
                  </span>
                  <div className="space-y-2">
                    {selectedCandidateDetail.candidate.experience.map((exp: any) => (
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
              {selectedCandidateDetail.candidate?.education && selectedCandidateDetail.candidate.education.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                    <FaGraduationCap className="text-[#0b57d0]" />
                    <span>Education</span>
                  </span>
                  <div className="space-y-2">
                    {selectedCandidateDetail.candidate.education.map((edu: any) => (
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
                onClick={() => setSelectedCandidateDetail(null)}
                className="px-6 py-2 rounded-xl bg-[#0b57d0] text-white text-xs font-bold hover:bg-[#0047ba] cursor-pointer"
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
