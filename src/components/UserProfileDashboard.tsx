import { useState, useEffect, type FC, type ChangeEvent, type FormEvent } from 'react'
import profileBannerImg from '../assets/profile_banner.jpg'

interface UserProfileDashboardProps {
  user: any
  token: string
  onLogout: () => void
}

type SectionKey =
  | 'personal'
  | 'skills'
  | 'education'
  | 'experience'
  | 'resume'
  | 'portfolio'
  | 'interests'
  | 'availability'
  | 'admin_tester'

interface SidebarItem {
  id: SectionKey
  title: string
  desc: string
  icon: string
  count?: number
  badge?: string
}

export const UserProfileDashboard: FC<UserProfileDashboardProps> = ({
  user: initialUser,
  token,
}) => {
  const [profile, setProfile] = useState<any>(initialUser)
  const [activeSection, setActiveSection] = useState<SectionKey>('personal')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Dedicated Upload Modals
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  const [showResumeModal, setShowResumeModal] = useState(false)

  // Edit Modals
  const [showPersonalModal, setShowPersonalModal] = useState(false)

  const [showEduModal, setShowEduModal] = useState(false)
  const [editingEdu, setEditingEdu] = useState<any | null>(null)

  const [showExpModal, setShowExpModal] = useState(false)
  const [editingExp, setEditingExp] = useState<any | null>(null)

  const [showPortfolioModal, setShowPortfolioModal] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<any | null>(null)

  // Form States
  const [personalForm, setPersonalForm] = useState({
    name: '',
    phone: '',
    bio: '',
    avatar: '',
    location: '',
    website: '',
    githubUrl: '',
    linkedinUrl: '',
  })

  const [skillInput, setSkillInput] = useState('')
  const [interestInput, setInterestInput] = useState('')

  const [eduForm, setEduForm] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  })

  const [expForm, setExpForm] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  })

  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    projectUrl: '',
    githubUrl: '',
    imageUrl: '',
    tags: '',
  })

  const [resumeForm, setResumeForm] = useState({
    resumeUrl: '',
    resumeFileName: '',
  })

  const [availabilityForm, setAvailabilityForm] = useState({
    availabilityStatus: 'AVAILABLE_FULLTIME',
    availabilityHoursPerWeek: 40,
    workPreference: 'REMOTE',
    noticePeriod: 'Immediate',
  })

  // RBAC tester
  const [adminStats, setAdminStats] = useState<any | null>(null)
  const [apiLog, setApiLog] = useState<string | null>(null)

  // Fetch full user profile
  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/profile/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.profile) {
        setProfile(data.profile)
        setPersonalForm({
          name: data.profile.name || '',
          phone: data.profile.phone || '',
          bio: data.profile.bio || '',
          avatar: data.profile.avatar || '',
          location: data.profile.location || '',
          website: data.profile.website || '',
          githubUrl: data.profile.githubUrl || '',
          linkedinUrl: data.profile.linkedinUrl || '',
        })
        setAvatarPreview(data.profile.avatar || '')
        setResumeForm({
          resumeUrl: data.profile.resumeUrl || '',
          resumeFileName: data.profile.resumeFileName || '',
        })
        setAvailabilityForm({
          availabilityStatus: data.profile.availabilityStatus || 'AVAILABLE_FULLTIME',
          availabilityHoursPerWeek: data.profile.availabilityHoursPerWeek || 40,
          workPreference: data.profile.workPreference || 'REMOTE',
          noticePeriod: data.profile.noticePeriod || 'Immediate',
        })
      }
    } catch (err: any) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [token])

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Calculate Profile Strength (0 - 100%)
  const calculateProfileStrength = () => {
    let score = 0
    if (profile.name) score += 10
    if (profile.bio) score += 10
    if (profile.phone || profile.location) score += 10
    if (profile.avatar) score += 10
    if (profile.skills && profile.skills.length > 0) score += 15
    if (profile.education && profile.education.length > 0) score += 15
    if (profile.experience && profile.experience.length > 0) score += 10
    if (profile.resumeUrl) score += 10
    if (profile.portfolioItems && profile.portfolioItems.length > 0) score += 5
    if (profile.interests && profile.interests.length > 0) score += 5
    return Math.min(score, 100)
  }

  const profileStrength = calculateProfileStrength()

  // Profile Photo Upload Handlers
  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file must be under 5MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setAvatarPreview(dataUrl)
      setPersonalForm((prev) => ({ ...prev, avatar: dataUrl }))
      showToast('Photo selected! Click Save to confirm.')
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAvatarModal = async (e: FormEvent) => {
    e.preventDefault()
    if (!avatarPreview) {
      showToast('Please select an image file', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('http://localhost:5000/api/profile/personal-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...personalForm, avatar: avatarPreview }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Profile photo updated successfully!')
        setShowAvatarModal(false)
        fetchProfile()
      } else {
        showToast(data.error || 'Failed to update photo', 'error')
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Resume Upload Handlers
  const handleResumeFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showToast('Resume file must be under 10MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setResumeForm({
        resumeUrl: dataUrl,
        resumeFileName: file.name,
      })
      showToast(`Selected: ${file.name}. Click Save to upload.`)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveResume = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('http://localhost:5000/api/profile/resume', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(resumeForm),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Resume document uploaded successfully!')
        setShowResumeModal(false)
        fetchProfile()
      } else {
        showToast(data.error || 'Failed to upload resume', 'error')
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Personal Info Handler
  const handleSavePersonalInfo = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('http://localhost:5000/api/profile/personal-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(personalForm),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Personal info saved successfully!')
        setShowPersonalModal(false)
        fetchProfile()
      } else {
        showToast(data.error || 'Failed to update personal info', 'error')
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Skills Handlers
  const handleAddSkill = async (skillToAdd: string) => {
    const trimmed = skillToAdd.trim()
    if (!trimmed) return
    const existing: string[] = profile.skills || []
    if (existing.includes(trimmed)) return

    const updated = [...existing, trimmed]
    await saveSkills(updated)
    setSkillInput('')
  }

  const handleRemoveSkill = async (skillToRemove: string) => {
    const existing: string[] = profile.skills || []
    const updated = existing.filter((s) => s !== skillToRemove)
    await saveSkills(updated)
  }

  const saveSkills = async (skillsArray: string[]) => {
    setSaving(true)
    try {
      const res = await fetch('http://localhost:5000/api/profile/skills', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skills: skillsArray }),
      })
      if (res.ok) {
        showToast('Skills updated!')
        fetchProfile()
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Education Handlers
  const handleOpenAddEdu = () => {
    setEditingEdu(null)
    setEduForm({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    })
    setShowEduModal(true)
  }

  const handleOpenEditEdu = (edu: any) => {
    setEditingEdu(edu)
    setEduForm({
      institution: edu.institution || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      startDate: edu.startDate ? edu.startDate.split('T')[0] : '',
      endDate: edu.endDate ? edu.endDate.split('T')[0] : '',
      isCurrent: Boolean(edu.isCurrent),
      description: edu.description || '',
    })
    setShowEduModal(true)
  }

  const handleSaveEdu = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const url = editingEdu
      ? `http://localhost:5000/api/profile/education/${editingEdu.id}`
      : 'http://localhost:5000/api/profile/education'
    const method = editingEdu ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eduForm),
      })
      if (res.ok) {
        showToast(editingEdu ? 'Education record updated!' : 'Education record added!')
        setShowEduModal(false)
        fetchProfile()
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEdu = async (id: string) => {
    if (!confirm('Remove this education record?')) return
    try {
      const res = await fetch(`http://localhost:5000/api/profile/education/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Education record deleted!')
        fetchProfile()
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  // Experience Handlers
  const handleOpenAddExp = () => {
    setEditingExp(null)
    setExpForm({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    })
    setShowExpModal(true)
  }

  const handleOpenEditExp = (exp: any) => {
    setEditingExp(exp)
    setExpForm({
      title: exp.title || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate ? exp.startDate.split('T')[0] : '',
      endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
      isCurrent: Boolean(exp.isCurrent),
      description: exp.description || '',
    })
    setShowExpModal(true)
  }

  const handleSaveExp = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const url = editingExp
      ? `http://localhost:5000/api/profile/experience/${editingExp.id}`
      : 'http://localhost:5000/api/profile/experience'
    const method = editingExp ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expForm),
      })
      if (res.ok) {
        showToast(editingExp ? 'Experience updated!' : 'Experience added!')
        setShowExpModal(false)
        fetchProfile()
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteExp = async (id: string) => {
    if (!confirm('Remove this experience record?')) return
    try {
      const res = await fetch(`http://localhost:5000/api/profile/experience/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Experience record deleted!')
        fetchProfile()
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  // Portfolio Handlers
  const handleOpenAddPortfolio = () => {
    setEditingPortfolio(null)
    setPortfolioForm({
      title: '',
      description: '',
      projectUrl: '',
      githubUrl: '',
      imageUrl: '',
      tags: '',
    })
    setShowPortfolioModal(true)
  }

  const handleOpenEditPortfolio = (item: any) => {
    setEditingPortfolio(item)
    setPortfolioForm({
      title: item.title || '',
      description: item.description || '',
      projectUrl: item.projectUrl || '',
      githubUrl: item.githubUrl || '',
      imageUrl: item.imageUrl || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
    })
    setShowPortfolioModal(true)
  }

  const handleSavePortfolio = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const url = editingPortfolio
      ? `http://localhost:5000/api/profile/portfolio/${editingPortfolio.id}`
      : 'http://localhost:5000/api/profile/portfolio'
    const method = editingPortfolio ? 'PUT' : 'POST'

    const tagsArray = portfolioForm.tags
      ? portfolioForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...portfolioForm, tags: tagsArray }),
      })
      if (res.ok) {
        showToast(editingPortfolio ? 'Project updated!' : 'Project added!')
        setShowPortfolioModal(false)
        fetchProfile()
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('Remove this portfolio project?')) return
    try {
      const res = await fetch(`http://localhost:5000/api/profile/portfolio/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Portfolio project deleted!')
        fetchProfile()
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  // Interests Handlers
  const handleAddInterest = async (interestToAdd: string) => {
    const trimmed = interestToAdd.trim()
    if (!trimmed) return
    const existing: string[] = profile.interests || []
    if (existing.includes(trimmed)) return

    const updated = [...existing, trimmed]
    await saveInterests(updated)
    setInterestInput('')
  }

  const handleRemoveInterest = async (interestToRemove: string) => {
    const existing: string[] = profile.interests || []
    const updated = existing.filter((i) => i !== interestToRemove)
    await saveInterests(updated)
  }

  const saveInterests = async (interestsArray: string[]) => {
    setSaving(true)
    try {
      const res = await fetch('http://localhost:5000/api/profile/interests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ interests: interestsArray }),
      })
      if (res.ok) {
        showToast('Interests updated!')
        fetchProfile()
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Availability Handler
  const handleSaveAvailability = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('http://localhost:5000/api/profile/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(availabilityForm),
      })
      if (res.ok) {
        showToast('Availability settings updated!')
        fetchProfile()
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // RBAC Testers
  const handleFetchMe = async () => {
    setLoading(true)
    setApiLog(null)
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setApiLog(JSON.stringify(data, null, 2))
    } catch (err: any) {
      setApiLog(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchAdminStats = async () => {
    setLoading(true)
    setApiLog(null)
    setAdminStats(null)
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) {
        setApiLog(`HTTP ${res.status}: ${data.error || 'Access Denied'}`)
      } else {
        setAdminStats(data.stats)
        setApiLog(JSON.stringify(data, null, 2))
      }
    } catch (err: any) {
      setApiLog(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'FOUNDER': return 'bg-indigo-600 text-white'
      case 'DEVELOPER': return 'bg-cyan-600 text-white'
      case 'DESIGNER': return 'bg-pink-600 text-white'
      case 'INVESTOR': return 'bg-emerald-600 text-white'
      case 'MENTOR': return 'bg-amber-600 text-white'
      case 'ADMIN': return 'bg-purple-600 text-white'
      default: return 'bg-slate-800 text-white'
    }
  }

  const formatAvailabilityLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE_FULLTIME': return '🟢 Full-Time Available'
      case 'AVAILABLE_PARTTIME': return '🟡 Part-Time Available'
      case 'CONTRACT': return '💼 Open for Contract'
      case 'OPEN_TO_OFFERS': return '✨ Open to Offers'
      case 'NOT_AVAILABLE': return '🔴 Not Available'
      default: return status
    }
  }

  // Contents in Left Sidebar
  const sidebarContents: SidebarItem[] = [
    { id: 'personal', title: 'Personal Information', desc: 'Identity & contact methods', icon: '👤' },
    { id: 'skills', title: 'Skills & Tech Stack', desc: 'Frameworks & technologies', icon: '⚡', count: profile.skills?.length },
    { id: 'education', title: 'Education History', desc: 'Academic degrees & colleges', icon: '🎓', count: profile.education?.length },
    { id: 'experience', title: 'Work Experience', desc: 'Companies & past roles', icon: '💼', count: profile.experience?.length },
    { id: 'resume', title: 'Resume Document', desc: 'Curriculum Vitae file (PDF/Word)', icon: '📄', badge: profile.resumeUrl ? 'Active' : 'Missing' },
    { id: 'portfolio', title: 'Portfolio Projects', desc: 'Showcase projects & demos', icon: '🚀', count: profile.portfolioItems?.length },
    { id: 'interests', title: 'Interests & Focus', desc: 'Industry startup domains', icon: '🌟', count: profile.interests?.length },
    { id: 'availability', title: 'Availability Status', desc: 'Notice period & work mode', icon: '📅' },
    { id: 'admin_tester', title: 'RBAC Authorization', desc: 'Security endpoint testing', icon: '🛡️' },
  ]

  const popularSkillSuggestions = [
    'React', 'TypeScript', 'Node.js', 'Python', 'TailwindCSS',
    'PostgreSQL', 'Docker', 'AWS', 'UI/UX Design', 'Next.js',
    'GraphQL', 'Go', 'Flutter', 'Machine Learning'
  ]

  const popularInterestSuggestions = [
    'Artificial Intelligence', 'Web3 / Blockchain', 'Fintech',
    'EdTech', 'HealthTech', 'CleanTech', 'SaaS', 'Robotics'
  ]

  return (
    <div className="w-full space-y-6 antialiased">
      {/* Toast Notification Alert */}
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

      {/* FULL WIDTH LAYOUT: LEFT SIDEBAR WITH CONTENTS & RIGHT DETAILS AREA */}
      <div className="w-full flex flex-col lg:flex-row items-start gap-6">

        {/* LEFT SIDEBAR: PROFILE SUMMARY & CONTENTS LIST */}
        <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6 lg:sticky lg:top-20">
          
          {/* User Spotlight with Direct Photo Upload Trigger */}
          <div className="flex flex-col items-center text-center space-y-3 pb-5 border-b border-slate-100">
            <div
              onClick={() => {
                setAvatarPreview(profile.avatar || '')
                setShowAvatarModal(true)
              }}
              className="relative group cursor-pointer"
              title="Click to Upload Profile Photo"
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 rounded-3xl object-cover ring-4 ring-slate-100 shadow-md transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-indigo-600 text-white font-black text-3xl flex items-center justify-center shadow-md">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              {/* Photo Change Badge Overlay */}
              <div className="absolute inset-0 bg-slate-950/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-extrabold gap-0.5">
                <span className="text-base">📷</span>
                <span>Change</span>
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white shadow"></span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{profile.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${getRoleStyle(profile.role)}`}>
                  {profile.role}
                </span>
                <span className="text-xs text-slate-500 font-medium">📍 {profile.location || 'Kerala, IN'}</span>
              </div>
            </div>

            {/* Profile Strength Meter */}
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-1.5 text-left">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 uppercase text-[10px] tracking-wider">Profile Strength</span>
                <span className="text-indigo-600 font-extrabold">{profileStrength}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${profileStrength}%` }}></div>
              </div>
            </div>

            {/* Direct Upload Buttons in Left Sidebar */}
            <div className="w-full grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setAvatarPreview(profile.avatar || '')
                  setShowAvatarModal(true)
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>📷</span> Photo
              </button>

              <button
                onClick={() => {
                  setResumeForm({
                    resumeUrl: profile.resumeUrl || '',
                    resumeFileName: profile.resumeFileName || '',
                  })
                  setShowResumeModal(true)
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>📄</span> Resume
              </button>
            </div>
          </div>

          {/* CONTENTS LIST NAVIGATION */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-3 block mb-2">
              Profile Sections
            </span>

            <nav className="space-y-1.5">
              {sidebarContents.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as SectionKey)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between border ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.icon}
                      </span>
                      <div className="truncate">
                        <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {item.title}
                        </div>
                        <div className={`text-[10px] truncate ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {item.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.count}
                      </span>
                    )}

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        item.badge === 'Active'
                          ? isActive ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

        </aside>

        {/* RIGHT SIDE: FULL DETAILS ADD & EDIT WORKSPACE */}
        <main className="flex-1 w-full space-y-6">

          {/* TOP FULL-WIDTH HERO COVER BANNER */}
          <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="w-full h-44 sm:h-52 relative overflow-hidden bg-slate-950">
              <img
                src={profileBannerImg}
                alt="Kerala Startup Ecosystem"
                className="w-full h-full object-cover object-center opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              <div className="absolute bottom-5 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-bold text-white mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Kerala Talent & Startup Network</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{profile.name}</h1>
                  <p className="text-xs text-slate-200 font-medium mt-0.5">
                    {profile.email} • {profile.phone || 'No phone set'} • {profile.location || 'Kerala'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPersonalModal(true)}
                    className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>✏️</span> Edit Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Status:</span>
                <span className="px-3 py-1 rounded-full bg-white text-slate-800 font-bold border border-slate-200 shadow-xs">
                  {formatAvailabilityLabel(profile.availabilityStatus)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
                    🌐 Website
                  </a>
                )}
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-slate-700 font-bold hover:underline">
                    🐙 GitHub
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
                    💼 LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* DYNAMIC SECTION DETAILS DISPLAY */}

          {/* 1. PERSONAL INFORMATION DETAILS */}
          {activeSection === 'personal' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>👤</span> Personal Information Details
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage identity, contact methods, and location details.</p>
                </div>
                <button
                  onClick={() => setShowPersonalModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Edit Information
                </button>
              </div>

              {/* Bio Spotlight */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block">
                  Bio / Pitch Tagline
                </span>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {profile.bio || 'No bio or pitch tagline entered yet. Click Edit Information to add one!'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Full Name</span>
                    <p className="text-sm font-bold text-slate-900">{profile.name}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Email Address</span>
                    <p className="text-sm font-semibold text-slate-900">{profile.email}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Phone Number</span>
                    <p className="text-sm font-semibold text-slate-900">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Location</span>
                    <p className="text-sm font-semibold text-slate-900">{profile.location || 'Kochi, Kerala'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Personal Website</span>
                    {profile.website ? (
                      <a href={profile.website} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline break-all">
                        {profile.website}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not set</span>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Social Profiles</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {profile.githubUrl && (
                        <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold hover:border-slate-400">
                          🐙 GitHub
                        </a>
                      )}
                      {profile.linkedinUrl && (
                        <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold hover:border-slate-400">
                          💼 LinkedIn
                        </a>
                      )}
                      {!profile.githubUrl && !profile.linkedinUrl && (
                        <span className="text-slate-400 italic">No social profiles configured</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SKILLS DETAILS */}
          {activeSection === 'skills' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>⚡</span> Technical Skills & Competencies
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Add programming languages, frameworks, and developer tools.</p>
              </div>

              {/* Add Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a skill and press Enter (e.g. React, PostgreSQL, Docker)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill(skillInput)
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium outline-none"
                />
                <button
                  onClick={() => handleAddSkill(skillInput)}
                  disabled={saving || !skillInput.trim()}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Add Skill
                </button>
              </div>

              {/* Active Skills Cloud */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Configured Skills ({profile.skills?.length || 0})
                </span>

                <div className="flex flex-wrap gap-2">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((s: string) => (
                      <span
                        key={s}
                        className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 flex items-center gap-2 hover:border-slate-400 transition-colors"
                      >
                        <span>{s}</span>
                        <button
                          onClick={() => handleRemoveSkill(s)}
                          className="text-slate-400 hover:text-red-600 font-bold text-base leading-none cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <div className="w-full text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                      No skills added yet. Type a skill above to add your first!
                    </div>
                  )}
                </div>
              </div>

              {/* Popular Suggestions */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Recommendations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularSkillSuggestions.map((s) => {
                    const isSelected = profile.skills?.includes(s)
                    return (
                      <button
                        key={s}
                        disabled={isSelected}
                        onClick={() => handleAddSkill(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                            : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200'
                        }`}
                      >
                        {isSelected ? `✓ ${s}` : `+ ${s}`}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. EDUCATION DETAILS */}
          {activeSection === 'education' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>🎓</span> Education & Academic Records
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Degrees, universities, and academic certifications.</p>
                </div>
                <button
                  onClick={handleOpenAddEdu}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>➕</span> Add Education
                </button>
              </div>

              {profile.education && profile.education.length > 0 ? (
                <div className="space-y-4">
                  {profile.education.map((edu: any) => (
                    <div key={edu.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold text-slate-900">{edu.degree}</h4>
                          {edu.isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                              Currently Enrolled
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-indigo-600">🎓 {edu.institution}</p>
                        {edu.fieldOfStudy && (
                          <p className="text-slate-600 font-medium">Field: {edu.fieldOfStudy}</p>
                        )}
                        <p className="text-[11px] text-slate-400 font-medium">
                          📅 {new Date(edu.startDate).getFullYear()} - {edu.isCurrent ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : 'N/A'}
                        </p>
                        {edu.description && (
                          <p className="text-slate-700 pt-1 leading-relaxed">{edu.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenEditEdu(edu)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEdu(edu.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                  <span className="text-4xl block">🎓</span>
                  <p className="text-xs text-slate-500 font-semibold">No education records added yet.</p>
                  <button
                    onClick={handleOpenAddEdu}
                    className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer"
                  >
                    + Add first education
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. WORK EXPERIENCE DETAILS */}
          {activeSection === 'experience' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>💼</span> Work Experience & Positions
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Companies, startups, and roles held.</p>
                </div>
                <button
                  onClick={handleOpenAddExp}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>➕</span> Add Experience
                </button>
              </div>

              {profile.experience && profile.experience.length > 0 ? (
                <div className="space-y-4">
                  {profile.experience.map((exp: any) => (
                    <div key={exp.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold text-slate-900">{exp.title}</h4>
                          {exp.isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                              Current Role
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-indigo-600">🏢 {exp.company} {exp.location ? `• 📍 ${exp.location}` : ''}</p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          📅 {new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : 'N/A'}
                        </p>
                        {exp.description && (
                          <p className="text-slate-700 pt-1 leading-relaxed">{exp.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenEditExp(exp)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExp(exp.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                  <span className="text-4xl block">💼</span>
                  <p className="text-xs text-slate-500 font-semibold">No work experience entries yet.</p>
                  <button
                    onClick={handleOpenAddExp}
                    className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer"
                  >
                    + Add first experience
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 5. RESUME DETAILS & DEDICATED UPLOAD MODAL TRIGGER */}
          {activeSection === 'resume' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>📄</span> Resume & Curriculum Vitae
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Upload your PDF or Word document for founder & recruiter viewing.</p>
                </div>
                <button
                  onClick={() => {
                    setResumeForm({
                      resumeUrl: profile.resumeUrl || '',
                      resumeFileName: profile.resumeFileName || '',
                    })
                    setShowResumeModal(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>📄</span> Upload / Replace Resume
                </button>
              </div>

              {/* Status Box */}
              {profile.resumeUrl ? (
                <div className="p-6 rounded-3xl border border-indigo-100 bg-indigo-50/40 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl shadow-md">
                      📄
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">{profile.resumeFileName || 'Resume Document'}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Status: <span className="text-emerald-700 font-bold">Active & Saved in Database</span>
                      </p>
                    </div>
                  </div>

                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
                  >
                    <span>👁️</span> View Document
                  </a>
                </div>
              ) : (
                <div
                  onClick={() => setShowResumeModal(true)}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-600 rounded-3xl p-10 text-center cursor-pointer bg-slate-50/60 hover:bg-indigo-50/40 transition-all space-y-2"
                >
                  <span className="text-4xl block">📄</span>
                  <h4 className="text-sm font-bold text-slate-900">Click to Open Resume Upload Modal</h4>
                  <p className="text-xs text-slate-500">Supports PDF and Word formats up to 10MB</p>
                </div>
              )}
            </div>
          )}

          {/* 6. PORTFOLIO DETAILS */}
          {activeSection === 'portfolio' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>🚀</span> Portfolio & Showcase Projects
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Showcase your startup applications, open-source work, and websites.</p>
                </div>
                <button
                  onClick={handleOpenAddPortfolio}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>➕</span> Add Project
                </button>
              </div>

              {profile.portfolioItems && profile.portfolioItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.portfolioItems.map((item: any) => (
                    <div key={item.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded-xl border border-slate-200" />
                        )}
                        <h4 className="text-base font-extrabold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.description}</p>

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.tags.map((t: string) => (
                              <span key={t} className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          {item.projectUrl && (
                            <a href={item.projectUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                              🔗 Demo
                            </a>
                          )}
                          {item.githubUrl && (
                            <a href={item.githubUrl} target="_blank" rel="noreferrer" className="text-slate-700 hover:underline">
                              🐙 Code
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={() => handleOpenEditPortfolio(item)} className="text-slate-500 hover:text-slate-900 cursor-pointer">
                            Edit
                          </button>
                          <button onClick={() => handleDeletePortfolio(item.id)} className="text-red-500 hover:text-red-700 cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                  <span className="text-4xl block">🚀</span>
                  <p className="text-xs text-slate-500 font-semibold">No portfolio projects showcased yet.</p>
                  <button
                    onClick={handleOpenAddPortfolio}
                    className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer"
                  >
                    + Add first project
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 7. INTERESTS DETAILS */}
          {activeSection === 'interests' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>🌟</span> Focus Areas & Industry Interests
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Startup verticals and domains that interest you.</p>
              </div>

              {/* Add Interest Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type an interest (e.g. AI, Fintech, Clean Energy)..."
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddInterest(interestInput)
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium outline-none"
                />
                <button
                  onClick={() => handleAddInterest(interestInput)}
                  disabled={saving || !interestInput.trim()}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Add Interest
                </button>
              </div>

              {/* Saved Interests */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Configured Interests ({profile.interests?.length || 0})
                </span>

                <div className="flex flex-wrap gap-2">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map((i: string) => (
                      <span
                        key={i}
                        className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-2 hover:border-amber-400 transition-colors"
                      >
                        <span>🌟 {i}</span>
                        <button
                          onClick={() => handleRemoveInterest(i)}
                          className="text-amber-500 hover:text-red-600 font-bold text-base leading-none cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <div className="w-full text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                      No interests chosen yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Domain Suggestions */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Suggested Startup Domains
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularInterestSuggestions.map((item) => {
                    const isSelected = profile.interests?.includes(item)
                    return (
                      <button
                        key={item}
                        disabled={isSelected}
                        onClick={() => handleAddInterest(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                            : 'bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-slate-200'
                        }`}
                      >
                        {isSelected ? `✓ ${item}` : `+ ${item}`}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 8. AVAILABILITY DETAILS */}
          {activeSection === 'availability' && (
            <form onSubmit={handleSaveAvailability} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>📅</span> Availability & Work Engagement
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Specify current availability status and weekly hours.</p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Save Settings
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-slate-700 font-extrabold uppercase tracking-wider">
                    Availability Status
                  </label>
                  <select
                    value={availabilityForm.availabilityStatus}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, availabilityStatus: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white font-bold outline-none focus:border-indigo-600"
                  >
                    <option value="AVAILABLE_FULLTIME">🟢 Available Full-Time</option>
                    <option value="AVAILABLE_PARTTIME">🟡 Available Part-Time</option>
                    <option value="CONTRACT">💼 Open for Contract / Freelance</option>
                    <option value="OPEN_TO_OFFERS">✨ Open to Offers</option>
                    <option value="NOT_AVAILABLE">🔴 Not Available</option>
                  </select>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-slate-700 font-extrabold uppercase tracking-wider">
                    Work Location Preference
                  </label>
                  <select
                    value={availabilityForm.workPreference}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, workPreference: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white font-bold outline-none focus:border-indigo-600"
                  >
                    <option value="REMOTE">🌐 100% Remote</option>
                    <option value="HYBRID">🏢 Hybrid (Office + Remote)</option>
                    <option value="ONSITE">📍 On-Site in Kerala</option>
                    <option value="ANY">🤝 Flexible / Any</option>
                  </select>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-700 font-extrabold uppercase tracking-wider">
                      Weekly Capacity
                    </label>
                    <span className="text-indigo-600 font-black text-sm">{availabilityForm.availabilityHoursPerWeek} hrs/week</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={availabilityForm.availabilityHoursPerWeek}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, availabilityHoursPerWeek: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-slate-700 font-extrabold uppercase tracking-wider">
                    Notice Period
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Immediate, 15 days, 1 month"
                    value={availabilityForm.noticePeriod}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, noticePeriod: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white font-bold outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </form>
          )}

          {/* 9. RBAC AUTHORIZATION DETAILS */}
          {activeSection === 'admin_tester' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>🛡️</span> RBAC Authorization Security Tester
              </h3>
              <p className="text-xs text-slate-500">
                Verify that your role ({profile.role}) can access protected APIs according to system rules.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={handleFetchMe}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
                >
                  GET /api/auth/me (Authenticated)
                </button>
                <button
                  onClick={handleFetchAdminStats}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs hover:bg-purple-700 cursor-pointer disabled:opacity-50"
                >
                  GET /api/admin/stats (ADMIN Only)
                </button>
              </div>

              {adminStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-purple-50 rounded-2xl text-center">
                    <span className="text-xs font-bold text-purple-700 block">Total Users</span>
                    <span className="text-xl font-black text-purple-900">{adminStats.totalUsers}</span>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-2xl text-center">
                    <span className="text-xs font-bold text-indigo-700 block">Founders</span>
                    <span className="text-xl font-black text-indigo-900">{adminStats.founders}</span>
                  </div>
                  <div className="p-3 bg-cyan-50 rounded-2xl text-center">
                    <span className="text-xs font-bold text-cyan-700 block">Developers</span>
                    <span className="text-xl font-black text-cyan-900">{adminStats.developers}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl text-center">
                    <span className="text-xs font-bold text-emerald-700 block">Investors</span>
                    <span className="text-xl font-black text-emerald-900">{adminStats.investors}</span>
                  </div>
                </div>
              )}

              {apiLog && (
                <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto max-h-60 mt-2">
                  {apiLog}
                </pre>
              )}
            </div>
          )}

        </main>
      </div>

      {/* DEDICATED PROFILE PHOTO UPLOAD MODAL */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 border border-slate-200 shadow-2xl">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Upload Profile Photo</h3>
              <p className="text-xs text-slate-500">Choose a high-resolution avatar image</p>
            </div>

            <form onSubmit={handleSaveAvatarModal} className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-32 h-32 rounded-3xl object-cover ring-4 ring-indigo-100 shadow-md" />
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-indigo-600 text-white font-black text-4xl flex items-center justify-center shadow-md">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}

                <label className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-600 rounded-2xl p-5 text-center cursor-pointer bg-slate-50 hover:bg-indigo-50/50 transition-all block">
                  <span className="text-2xl block mb-1">📷</span>
                  <span className="text-xs font-bold text-slate-900 block">Select Local Image File</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">PNG or JPG up to 5MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !avatarPreview}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED RESUME UPLOAD MODAL */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 border border-slate-200 shadow-2xl">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Upload Resume Document</h3>
              <p className="text-xs text-slate-500">Upload your CV in PDF or Word format</p>
            </div>

            <form onSubmit={handleSaveResume} className="space-y-4">
              <label className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-600 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-indigo-50/50 transition-all block">
                <span className="text-3xl block mb-1">📄</span>
                <span className="text-xs font-bold text-slate-900 block">Click to Select Local Document</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">PDF, DOC, DOCX up to 10MB</span>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeFileChange} />
              </label>

              {resumeForm.resumeFileName && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-900 flex items-center gap-2">
                  <span>📄</span>
                  <span className="truncate">{resumeForm.resumeFileName}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResumeModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !resumeForm.resumeUrl}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Save Resume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERSONAL INFO EDIT MODAL */}
      {showPersonalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900">Edit Personal Information</h3>

            <form onSubmit={handleSavePersonalInfo} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={personalForm.name}
                  onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={personalForm.phone}
                  onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Location</label>
                <input
                  type="text"
                  value={personalForm.location}
                  onChange={(e) => setPersonalForm({ ...personalForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Bio Summary</label>
                <textarea
                  rows={3}
                  value={personalForm.bio}
                  onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Personal Website</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={personalForm.website}
                  onChange={(e) => setPersonalForm({ ...personalForm, website: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">GitHub Profile URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={personalForm.githubUrl}
                  onChange={(e) => setPersonalForm({ ...personalForm, githubUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={personalForm.linkedinUrl}
                  onChange={(e) => setPersonalForm({ ...personalForm, linkedinUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPersonalModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDUCATION MODAL */}
      {showEduModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">{editingEdu ? 'Edit Education' : 'Add Education Record'}</h3>
            <form onSubmit={handleSaveEdu} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Institution</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cochin University of Science & Technology"
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Degree</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Technology"
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Field of Study</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Engineering"
                  value={eduForm.fieldOfStudy}
                  onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={eduForm.startDate}
                    onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">End Date</label>
                  <input
                    type="date"
                    disabled={eduForm.isCurrent}
                    value={eduForm.endDate}
                    onChange={(e) => setEduForm({ ...eduForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="eduCurrent"
                  checked={eduForm.isCurrent}
                  onChange={(e) => setEduForm({ ...eduForm, isCurrent: e.target.checked })}
                  className="rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="eduCurrent" className="font-bold text-slate-700 cursor-pointer">Currently Studying Here</label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEduModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPERIENCE MODAL */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">{editingExp ? 'Edit Experience' : 'Add Experience Record'}</h3>
            <form onSubmit={handleSaveExp} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Full-Stack Engineer"
                  value={expForm.title}
                  onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Company</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kerala FinTech Labs"
                  value={expForm.company}
                  onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Kochi, Kerala"
                  value={expForm.location}
                  onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={expForm.startDate}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">End Date</label>
                  <input
                    type="date"
                    disabled={expForm.isCurrent}
                    value={expForm.endDate}
                    onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="expCurrent"
                  checked={expForm.isCurrent}
                  onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked })}
                  className="rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="expCurrent" className="font-bold text-slate-700 cursor-pointer">I Currently Work Here</label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PORTFOLIO MODAL */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">{editingPortfolio ? 'Edit Project' : 'Add Portfolio Project'}</h3>
            <form onSubmit={handleSavePortfolio} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Career Match Platform"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe key features & technologies used..."
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Live Demo URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={portfolioForm.projectUrl}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, projectUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">GitHub Repo URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={portfolioForm.githubUrl}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, githubUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tech Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, TailwindCSS"
                  value={portfolioForm.tags}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, tags: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 font-medium outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPortfolioModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
