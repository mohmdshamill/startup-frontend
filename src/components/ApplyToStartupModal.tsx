import { useState, useEffect, useRef, type FC, type FormEvent, type ChangeEvent, type DragEvent } from 'react'
import {
  FaTimes,
  FaRocket,
  FaUserTie,
  FaClock,
  FaCheckCircle,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaCloudUploadAlt,
  FaTrashAlt,
  FaExchangeAlt,
  FaLink,
} from 'react-icons/fa'

interface ApplyToStartupModalProps {
  isOpen: boolean
  onClose: () => void
  startupIdea: any
  user: any
  token: string
  onApplicationSuccess?: (application: any) => void
  onNavigateToRecruitment?: () => void
}

const COMMON_ROLES = [
  'Co-Founder / Partner',
  'Technical Co-Founder / CTO',
  'Business Co-Founder / COO',
  'Full Stack Developer',
  'Frontend React / Next.js Engineer',
  'Backend Node / Python Engineer',
  'Lead UI/UX & Product Designer',
  'AI / ML & LLM Specialist',
  'Mobile App Developer (Flutter / React Native)',
  'Growth Marketing & Go-To-Market Lead',
  'Product Manager & Operations',
  'Sales & Business Development Lead',
  'Advisor / Mentor',
]

export const ApplyToStartupModal: FC<ApplyToStartupModalProps> = ({
  isOpen,
  onClose,
  startupIdea,
  user,
  token,
  onApplicationSuccess,
  onNavigateToRecruitment,
}) => {
  const [roleApplied, setRoleApplied] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [pitchMessage, setPitchMessage] = useState('')
  const [availabilityHoursPerWeek, setAvailabilityHoursPerWeek] = useState(20)
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  
  // Resume / CV Upload States
  const [resumeUrl, setResumeUrl] = useState('')
  const [resumeFileName, setResumeFileName] = useState('')
  const [resumeFileSize, setResumeFileSize] = useState('')
  const [isFromProfile, setIsFromProfile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [existingApp, setExistingApp] = useState<any | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize candidate defaults from user profile and check for existing application
  useEffect(() => {
    if (user && isOpen && startupIdea) {
      if (Array.isArray(user.skills) && user.skills.length > 0) {
        setSkills([...user.skills])
      }
      if (user.availabilityHoursPerWeek) {
        setAvailabilityHoursPerWeek(user.availabilityHoursPerWeek)
      }
      if (user.resumeUrl) {
        setResumeUrl(user.resumeUrl)
        setResumeFileName(user.resumeFileName || 'Profile_Resume.pdf')
        setResumeFileSize('From Profile')
        setIsFromProfile(true)
      } else {
        setResumeUrl('')
        setResumeFileName('')
        setResumeFileSize('')
        setIsFromProfile(false)
      }
      if (user.website || user.githubUrl) {
        setPortfolioUrl(user.website || user.githubUrl || '')
      }
      // Pick initial role recommendation based on user role
      if (user.role === 'FOUNDER') {
        setRoleApplied('Co-Founder / Partner')
      } else if (user.role === 'DEVELOPER') {
        setRoleApplied('Full Stack Developer')
      } else if (user.role === 'DESIGNER') {
        setRoleApplied('Lead UI/UX & Product Designer')
      } else {
        setRoleApplied(COMMON_ROLES[0])
      }
      setError(null)
      setUploadError(null)
      setSuccessMessage(null)
      setExistingApp(null)

      // Fetch user applications to see if already applied
      if (token) {
        fetch('http://localhost:5000/api/applications/my-applications', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.applications) {
              const matched = d.applications.find((a: any) => a.startupIdeaId === startupIdea.id)
              if (matched) {
                setExistingApp(matched)
              }
            }
          })
          .catch(() => {})
      }
    }
  }, [user, isOpen, startupIdea, token])

  if (!isOpen || !startupIdea) return null

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  // File Upload Processing
  const processUploadedFile = (file: File) => {
    setUploadError(null)

    // Allowed formats: pdf, doc, docx, rtf, txt, odt
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.rtf', '.txt', '.odt']
    const fileExt = '.' + (file.name.split('.').pop()?.toLowerCase() || '')
    const isAllowedExt = allowedExtensions.includes(fileExt)
    const isAllowedMime =
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type.startsWith('text/') ||
      file.type.includes('officedocument')

    if (!isAllowedExt && !isAllowedMime) {
      setUploadError('Please upload a PDF (.pdf), Word document (.doc, .docx), or text document (.txt).')
      return
    }

    // Limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('CV file must be under 10MB in size.')
      return
    }

    const formattedSize =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setResumeUrl(reader.result)
        setResumeFileName(file.name)
        setResumeFileSize(formattedSize)
        setIsFromProfile(false)
      }
    }
    reader.onerror = () => {
      setUploadError('Failed to read document file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processUploadedFile(file)
    }
    // reset input so same file can be re-selected if removed
    if (e.target) {
      e.target.value = ''
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processUploadedFile(file)
    }
  }

  const handleRemoveResume = () => {
    setResumeUrl('')
    setResumeFileName('')
    setResumeFileSize('')
    setIsFromProfile(false)
    setUploadError(null)
  }

  const getFileIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.endsWith('.pdf')) {
      return <FaFilePdf className="text-red-500 text-xl" />
    }
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return <FaFileWord className="text-blue-600 text-xl" />
    }
    return <FaFileAlt className="text-amber-500 text-xl" />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (user?.role === 'FOUNDER') {
      setError('Startup Founders cannot apply to join another startup team. Founders can create and manage their own startup teams.')
      return
    }

    const finalRole = roleApplied === 'Other' ? customRole.trim() : roleApplied

    if (!finalRole) {
      setError('Please select or specify the role you are applying for.')
      return
    }

    if (!pitchMessage.trim() || pitchMessage.trim().length < 20) {
      setError('Please provide a pitch message of at least 20 characters explaining your interest and value add.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startupIdeaId: startupIdea.id,
          roleApplied: finalRole,
          pitchMessage,
          skills,
          availabilityHoursPerWeek: Number(availabilityHoursPerWeek),
          portfolioUrl: portfolioUrl.trim() || undefined,
          resumeUrl: resumeUrl.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.application) {
          setExistingApp(data.application)
        }
        throw new Error(data.error || 'Failed to submit application')
      }

      setSuccessMessage('Application submitted successfully to the founder!')
      if (onApplicationSuccess) {
        onApplicationSuccess(data.application)
      }
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting application.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#0052cc] via-[#0b57d0] to-blue-900 text-white p-6 sm:p-7">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <FaTimes className="text-xs" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">
            <FaRocket />
            <span>Apply to Join Startup</span>
          </div>

          <h3 className="text-2xl font-black text-white">{startupIdea.title}</h3>
          
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-blue-100 font-medium">
            <span>Category: <strong className="text-white">{startupIdea.category}</strong></span>
            <span>•</span>
            <span>Founder: <strong className="text-white">{startupIdea.founder?.name || 'Founder'}</strong></span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 font-bold">{startupIdea.stage}</span>
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
          
          {/* Existing Application Notice */}
          {existingApp && (
            <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200 text-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">You already applied for this startup</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  existingApp.status === 'ACCEPTED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : existingApp.status === 'SHORTLISTED'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : existingApp.status === 'REVIEWING'
                    ? 'bg-sky-100 text-sky-800 border border-sky-300'
                    : existingApp.status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  Status: {existingApp.status}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Applied for role: <strong>{existingApp.roleApplied}</strong>
              </p>
              {existingApp.founderFeedback && (
                <div className="p-3 rounded-xl bg-white border border-blue-100 text-xs text-slate-700">
                  <span className="font-bold text-[#0b57d0]">Founder Note: </span>
                  <span>{existingApp.founderFeedback}</span>
                </div>
              )}
              {onNavigateToRecruitment && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onNavigateToRecruitment()
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Track in Team Recruitment Hub →
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <FaCheckCircle className="text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Role Applied For */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FaUserTie className="text-[#0b57d0]" />
              <span>Role You Want to Apply For *</span>
            </label>
            <select
              value={roleApplied}
              onChange={(e) => setRoleApplied(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] bg-white cursor-pointer"
              required
            >
              {COMMON_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
              <option value="Other">Custom Role / Other...</option>
            </select>

            {roleApplied === 'Other' && (
              <input
                type="text"
                placeholder="Enter custom role title..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full mt-2 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
                required
              />
            )}
          </div>

          {/* Pitch Note / Cover Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Why do you want to join? (Short Message) *
            </label>
            <textarea
              rows={4}
              value={pitchMessage}
              onChange={(e) => setPitchMessage(e.target.value)}
              placeholder="Explain why you want to join, what skills you have, and how you can help this startup..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] resize-none"
              required
            />
          </div>

          {/* Weekly Hours Availability */}
          <div className="space-y-2 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <FaClock className="text-[#0b57d0]" />
                <span>Hours per week you can work</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-[#0b57d0] text-white font-extrabold text-xs">
                {availabilityHoursPerWeek} hrs / week
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={availabilityHoursPerWeek}
              onChange={(e) => setAvailabilityHoursPerWeek(Number(e.target.value))}
              className="w-full accent-[#0b57d0] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>Part-time (5-15 hrs)</span>
              <span>Regular (20-30 hrs)</span>
              <span>Full-time / Co-founder (40+ hrs)</span>
            </div>
          </div>

          {/* Skills Highlight */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">
              Your Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. React, Node.js, Design)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
                className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-blue-50 text-[#0b57d0] border border-blue-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-red-500 text-xs cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio & Demo URL */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">
              Portfolio or GitHub Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://github.com/username or https://myportfolio.dev"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
            />
          </div>

          {/* Resume / CV Document Section */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FaFileAlt className="text-[#0b57d0]" />
                <span>Upload Resume / CV</span>
              </label>

              {/* Mode switch */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode(inputMode === 'upload' ? 'url' : 'upload')}
                  className="text-[11px] font-semibold text-[#0b57d0] hover:text-[#0047ba] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {inputMode === 'upload' ? (
                    <>
                      <FaLink className="text-[10px]" />
                      <span>Use web link instead</span>
                    </>
                  ) : (
                    <>
                      <FaCloudUploadAlt className="text-xs" />
                      <span>Upload file instead</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.rtf,.txt,.odt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleFileChange}
            />

            {inputMode === 'upload' ? (
              <div>
                {/* Upload Error Banner */}
                {uploadError && (
                  <div className="mb-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* If resume is loaded/selected */}
                {resumeUrl ? (
                  <div className="p-3.5 rounded-2xl bg-white border border-blue-200 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        {getFileIcon(resumeFileName || 'resume.pdf')}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                            {resumeFileName || 'Resume Document'}
                          </p>
                          {isFromProfile && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0b57d0] text-[10px] font-extrabold border border-blue-100 shrink-0">
                              Profile CV
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {resumeFileSize || 'Ready for submission'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-xl text-slate-600 hover:text-[#0b57d0] hover:bg-blue-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Upload different file"
                      >
                        <FaExchangeAlt className="text-xs" />
                        <span className="hidden sm:inline">Replace</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveResume}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                        title="Remove CV document"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop / Click Zone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-150 ${
                      isDragging
                        ? 'border-[#0b57d0] bg-blue-50/70 scale-[1.01]'
                        : 'border-slate-300 hover:border-[#0b57d0] hover:bg-white bg-slate-50/70'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-[#0b57d0] flex items-center justify-center mx-auto mb-2.5">
                      <FaCloudUploadAlt className="text-2xl" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 mb-0.5">
                      <span className="text-[#0b57d0] hover:underline">Click to choose file</span> or drag and drop your Resume / CV
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      PDF (.pdf) or Word (.doc, .docx) • Under 10MB
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* URL fallback mode */
              <div className="space-y-1.5">
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/... or https://linkedin.com/..."
                  value={resumeUrl.startsWith('data:') ? '' : resumeUrl}
                  onChange={(e) => {
                    setResumeUrl(e.target.value)
                    setResumeFileName(e.target.value ? 'External Link Resume' : '')
                    setResumeFileSize('')
                    setIsFromProfile(false)
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] bg-white"
                />
                <p className="text-[10px] text-slate-500">
                  Paste a link to your CV on Google Drive, Dropbox, or website.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Sending Application...</span>
              ) : (
                <>
                  <FaRocket />
                  <span>Send Application</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

