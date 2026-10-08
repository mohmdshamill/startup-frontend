import { useState, useEffect, type FC } from 'react'
import jsPDF from 'jspdf'
import pptxgen from 'pptxgenjs'
import {
  FaRocket, FaCheckCircle,
  FaFilePdf, FaFileAlt, FaEye, FaEdit, FaChevronLeft,
  FaChevronRight, FaSave, FaSpinner, FaMagic,
} from 'react-icons/fa'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PitchSection {
  id: string
  title: string
  subtitle: string
  placeholder: string
  icon: string
  gradient: string
  bgColor: string
  textColor: string
  accentColor: string
  template: string
}

interface PitchDeckData {
  startupName: string
  tagline: string
  founderName: string
  category: string
  stage: string
  websiteUrl: string
  sections: Record<string, string>
}

interface Startup {
  id: string
  title: string
  tagline: string
  category: string
  stage: string
  description: string
  websiteUrl?: string
  founder: { name: string }
}

interface Props {
  user: any
  token: string
  onNavigateToStartups?: () => void
}

// ─── Section Config ───────────────────────────────────────────────────────────

const SECTIONS: PitchSection[] = [
  {
    id: 'summary', title: 'Startup Summary', subtitle: 'Who you are & what you do',
    icon: '🚀', gradient: 'from-blue-600 to-indigo-700',
    bgColor: '#1e3a8a', textColor: '#ffffff', accentColor: '#60a5fa',
    placeholder: 'Briefly describe your startup, its mission, and what makes it unique...',
    template: `{Startup Name} is a {category} startup focused on {core mission}. Founded in {year}, we are building {product/service} to help {target audience} achieve {key benefit}. Our team of {N} passionate founders brings expertise in {domain}.`,
  },
  {
    id: 'problem', title: 'Problem Statement', subtitle: 'The pain point you are solving',
    icon: '⚡', gradient: 'from-rose-600 to-pink-700',
    bgColor: '#881337', textColor: '#ffffff', accentColor: '#fda4af',
    placeholder: 'Describe the specific problem your target market faces...',
    template: `In {market}, {target audience} struggle with {core problem}. Currently, {percentage}% of {market size} face this issue leading to {pain point — time/money/efficiency loss}. Existing solutions fail because {key gap}. This creates a massive opportunity for a better approach.`,
  },
  {
    id: 'solution', title: 'Our Solution', subtitle: 'How you uniquely solve it',
    icon: '✅', gradient: 'from-emerald-600 to-teal-700',
    bgColor: '#064e3b', textColor: '#ffffff', accentColor: '#6ee7b7',
    placeholder: 'Describe your product/service and the unique value it delivers...',
    template: `We solve this by {solution description}. Our platform {key feature 1}, {key feature 2}, and {key feature 3}. Unlike competitors, we {unique differentiator}. Early users report {metric}% improvement in {key outcome}.`,
  },
  {
    id: 'businessModel', title: 'Business Model', subtitle: 'How your business operates',
    icon: '💼', gradient: 'from-violet-600 to-purple-700',
    bgColor: '#3b0764', textColor: '#ffffff', accentColor: '#c084fc',
    placeholder: 'Explain how your business creates, delivers, and captures value...',
    template: `Our business model is {B2B/B2C/marketplace}. We {create value by...}, deliver it through {channel}, and capture value via {pricing model}. Key partners include {partners}. Our cost structure is {lean/asset-heavy} with {key cost driver}.`,
  },
  {
    id: 'marketAnalysis', title: 'Market Analysis', subtitle: 'Your market size & opportunity',
    icon: '📊', gradient: 'from-amber-600 to-orange-700',
    bgColor: '#78350f', textColor: '#ffffff', accentColor: '#fcd34d',
    placeholder: 'Describe your TAM, SAM, SOM and target market segments...',
    template: `Total Addressable Market (TAM): ₹{X} Cr / $X Bn globally. Serviceable Addressable Market (SAM): ₹{Y} Cr in {geography}. Serviceable Obtainable Market (SOM): ₹{Z} Cr in Year 1-3. Primary segment: {segment description}. Market growing at {CAGR}% CAGR driven by {trend}.`,
  },
  {
    id: 'revenueModel', title: 'Revenue Model', subtitle: 'How you make money',
    icon: '💰', gradient: 'from-green-600 to-emerald-700',
    bgColor: '#14532d', textColor: '#ffffff', accentColor: '#86efac',
    placeholder: 'Detail your revenue streams, pricing, and financial projections...',
    template: `Primary revenue: {Stream 1 — e.g., Subscription ₹X/month}. Secondary revenue: {Stream 2}. Unit economics: CAC ₹{X}, LTV ₹{Y}, LTV:CAC ratio {Z}x. Year 1 target: ₹{revenue}. Year 3 projection: ₹{revenue} with {margin}% gross margin. Break-even at {metric}.`,
  },
  {
    id: 'futurePlans', title: 'Future Plans & Roadmap', subtitle: 'Where you are heading',
    icon: '🛣️', gradient: 'from-cyan-600 to-sky-700',
    bgColor: '#0c4a6e', textColor: '#ffffff', accentColor: '#67e8f9',
    placeholder: 'Outline your 12-month roadmap, milestones, and long-term vision...',
    template: `Q1: {milestone — Product launch / Beta}. Q2: {milestone — First 100 customers}. Q3: {milestone — Seed funding / Expansion}. Q4: {milestone — Revenue target}. 3-year vision: {long-term goal}. We are seeking ₹{amount} to {use of funds}.`,
  },
]

const STORAGE_KEY = (startupId: string) => `pitchdeck_${startupId}`

// ─── Slide Preview ────────────────────────────────────────────────────────────

const SlidePreview: FC<{ section: PitchSection; content: string; deck: PitchDeckData; slideIndex: number; total: number }> = ({
  section, content, deck, slideIndex, total,
}) => (
  <div
    className="w-full aspect-video rounded-2xl overflow-hidden flex flex-col relative"
    style={{ background: `linear-gradient(135deg, ${section.bgColor}ee, ${section.bgColor})` }}
  >
    {/* Decorative circles */}
    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: section.accentColor, transform: 'translate(30%, -30%)' }} />
    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10" style={{ background: section.accentColor, transform: 'translate(-30%, 30%)' }} />

    {/* Header */}
    <div className="relative z-10 px-8 pt-7 pb-4 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{section.icon}</span>
          <div>
            <h2 className="text-xl font-black text-white leading-tight">{section.title}</h2>
            <p className="text-xs font-semibold opacity-60" style={{ color: section.accentColor }}>{section.subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-white">{deck.startupName || 'Your Startup'}</p>
          <p className="text-xs opacity-50 text-white">{deck.tagline || 'Tagline here'}</p>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="relative z-10 flex-1 px-8 py-5 overflow-hidden">
      {content ? (
        <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap line-clamp-6 font-medium">
          {content}
        </p>
      ) : (
        <p className="text-sm italic opacity-30 text-white">Click Edit to add your content for this slide...</p>
      )}
    </div>

    {/* Footer */}
    <div className="relative z-10 px-8 py-3 flex items-center justify-between border-t border-white/10">
      <p className="text-[10px] font-bold opacity-40 text-white">{deck.founderName || 'Founder Name'} · {deck.category || 'Category'}</p>
      <p className="text-[10px] font-bold opacity-40 text-white">{slideIndex + 1} / {total}</p>
    </div>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────

const API = 'http://localhost:5000/api'

export const PitchDeckBuilder: FC<Props> = ({ user, token, onNavigateToStartups }) => {
  const [startups, setStartups] = useState<Startup[]>([])
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
  const [loadingStartups, setLoadingStartups] = useState(true)
  const [activeSection, setActiveSection] = useState(0)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [previewSlide, setPreviewSlide] = useState(0)
  const [exporting, setExporting] = useState<'pdf' | 'pptx' | null>(null)
  const [saved, setSaved] = useState(false)

  const [deck, setDeck] = useState<PitchDeckData>({
    startupName: '', tagline: '', founderName: user?.name || '', category: '', stage: '', websiteUrl: '',
    sections: Object.fromEntries(SECTIONS.map((s) => [s.id, ''])),
  })

  // Load startups (founders get their own, others get workspaces)
  useEffect(() => {
    const load = async () => {
      try {
        // Try founder's own startups first
        const res = await fetch(`${API}/startups/my`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok && data.startups?.length > 0) {
          const list: Startup[] = data.startups.map((s: any) => ({
            id: s.id, title: s.title, tagline: s.tagline, category: s.category,
            stage: s.stage, description: s.description, websiteUrl: s.websiteUrl,
            founder: s.founder || { name: user?.name || '' },
          }))
          setStartups(list)
          selectStartup(list[0])
          return
        }
        // Fallback: collaboration workspaces (for team members)
        const wsRes = await fetch(`${API}/collaboration/my-workspaces`, { headers: { Authorization: `Bearer ${token}` } })
        const wsData = await wsRes.json()
        if (wsRes.ok && wsData.workspaces?.length > 0) {
          const list: Startup[] = wsData.workspaces.map((w: any) => ({
            id: w.id, title: w.title, tagline: w.tagline, category: w.category,
            stage: w.stage, description: w.tagline, websiteUrl: '',
            founder: w.founder || { name: '' },
          }))
          setStartups(list)
          selectStartup(list[0])
        }
      } catch {}
      finally { setLoadingStartups(false) }
    }
    if (token) load()
  }, [token])

  const selectStartup = (s: Startup) => {
    setSelectedStartup(s)
    const stored = localStorage.getItem(STORAGE_KEY(s.id))
    if (stored) {
      setDeck(JSON.parse(stored))
    } else {
      setDeck({
        startupName: s.title,
        tagline: s.tagline,
        founderName: user?.name || '',
        category: s.category,
        stage: s.stage,
        websiteUrl: s.websiteUrl || '',
        sections: {
          summary: s.description || '',
          problem: '', solution: '', businessModel: '',
          marketAnalysis: '', revenueModel: '', futurePlans: '',
        },
      })
    }
  }

  const updateSection = (id: string, value: string) => {
    setDeck((prev) => ({ ...prev, sections: { ...prev.sections, [id]: value } }))
    setSaved(false)
  }

  const saveDeck = () => {
    if (!selectedStartup) return
    localStorage.setItem(STORAGE_KEY(selectedStartup.id), JSON.stringify(deck))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const applyTemplate = (sectionId: string) => {
    const section = SECTIONS.find((s) => s.id === sectionId)
    if (!section) return
    let filled = section.template
      .replace(/{Startup Name}/g, deck.startupName || 'Your Startup')
      .replace(/{category}/g, deck.category || 'Tech')
      .replace(/{founderName}/g, deck.founderName || 'Your Name')
    updateSection(sectionId, filled)
  }

  // ── PDF Export ──────────────────────────────────────────────────────────────
  const exportPDF = async () => {
    setExporting('pdf')
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [960, 540] })
      
      SECTIONS.forEach((section, i) => {
        if (i > 0) pdf.addPage()
        
        // Background
        pdf.setFillColor(section.bgColor)
        pdf.rect(0, 0, 960, 540, 'F')
        
        // Header
        pdf.setTextColor('#ffffff')
        pdf.setFontSize(32)
        pdf.text(`${section.title}`, 60, 80)
        
        // Subtitle
        pdf.setTextColor(section.accentColor)
        pdf.setFontSize(16)
        pdf.text(section.subtitle, 60, 110)
        
        // Divider
        pdf.setDrawColor('#ffffff')
        pdf.setLineWidth(1)
        pdf.line(60, 130, 900, 130)
        
        // Content
        pdf.setTextColor('#ffffff')
        pdf.setFontSize(18)
        const content = deck.sections[section.id] || 'Content not provided.'
        const textLines = pdf.splitTextToSize(content, 840)
        pdf.text(textLines, 60, 170)
        
        // Footer
        pdf.setFontSize(12)
        pdf.setTextColor('#ffffff')
        pdf.text(`${deck.startupName || 'Startup'}  ·  ${deck.founderName}`, 60, 500)
        pdf.text(`${i + 1} / ${SECTIONS.length}`, 880, 500)
      })

      pdf.save(`${deck.startupName || 'pitch-deck'}.pdf`)
    } catch (e: any) {
      alert('PDF Error: ' + e?.message)
      console.error(e)
    } finally { setExporting(null) }
  }

  // ── PPTX Export ─────────────────────────────────────────────────────────────
  const exportPPTX = async () => {
    setExporting('pptx')
    try {
      // @ts-ignore
      const PptxGen = typeof pptxgen.default !== 'undefined' ? pptxgen.default : pptxgen
      const pptx = new PptxGen()
      pptx.layout = 'LAYOUT_WIDE'
      pptx.title = deck.startupName || 'Pitch Deck'
      pptx.subject = 'Startup Pitch Deck'
      pptx.author = deck.founderName

      // Cover / title slide
      const coverSlide = pptx.addSlide()
      coverSlide.background = { color: '0b57d0' }
      coverSlide.addText(deck.startupName || 'Your Startup', {
        x: 0.5, y: 1.8, w: 9, h: 1.2, fontSize: 44, bold: true, color: 'FFFFFF', align: 'center',
      })
      coverSlide.addText(deck.tagline || 'Your compelling tagline', {
        x: 0.5, y: 3.2, w: 9, h: 0.6, fontSize: 20, color: '93c5fd', align: 'center', italic: true,
      })
      coverSlide.addText(`Presented by ${deck.founderName} · ${deck.category}`, {
        x: 0.5, y: 4.5, w: 9, h: 0.4, fontSize: 13, color: 'bfdbfe', align: 'center',
      })

      // Section slides
      SECTIONS.forEach((section) => {
        const content = deck.sections[section.id]
        const slide = pptx.addSlide()

        // Background gradient simulation
        const bgHex = section.bgColor.replace('#', '')
        slide.background = { color: bgHex }

        // Section icon + title
        slide.addText(`${section.icon}  ${section.title}`, {
          x: 0.4, y: 0.3, w: 7, h: 0.8, fontSize: 26, bold: true, color: 'FFFFFF',
        })
        slide.addText(section.subtitle, {
          x: 0.4, y: 1.0, w: 7, h: 0.4, fontSize: 13, color: section.accentColor.replace('#', ''), italic: true,
        })

        // Divider (thin bar)
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.4, y: 1.45, w: 9.2, h: 0.04, fill: { color: 'FFFFFF', transparency: 70 },
        })

        // Content
        slide.addText(content || 'Content not provided.', {
          x: 0.4, y: 1.65, w: 9.2, h: 3.2, fontSize: 14, color: 'E2E8F0',
          valign: 'top', wrap: true, breakLine: true,
        })

        // Footer
        slide.addText(`${deck.startupName}  ·  ${deck.founderName}`, {
          x: 0.4, y: 5.0, w: 9.2, h: 0.3, fontSize: 10, color: 'FFFFFF', align: 'center',
          transparency: 60,
        })
      })

      await pptx.writeFile({ fileName: `${deck.startupName || 'pitch-deck'}.pptx` })
    } catch (e: any) {
      alert('PPTX Error: ' + e?.message)
      console.error(e)
    } finally { setExporting(null) }
  }

  const currentSection = SECTIONS[activeSection]
  const completedCount = SECTIONS.filter((s) => deck.sections[s.id]?.trim()).length

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loadingStartups) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <FaSpinner className="animate-spin text-4xl text-[#0b57d0] mx-auto" />
        <p className="text-slate-500 font-medium">Loading your startups...</p>
      </div>
    </div>
  )

  if (startups.length === 0) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md space-y-5 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="text-5xl">🚀</div>
        <div>
          <h3 className="text-lg font-black text-slate-800">No Startups Found</h3>
          <p className="text-sm text-slate-500 mt-1">Create a startup idea first to build your pitch deck.</p>
        </div>
        <button onClick={onNavigateToStartups} className="px-6 py-3 rounded-xl bg-[#0b57d0] text-white font-bold text-sm hover:bg-[#0047ba] transition-all cursor-pointer shadow-sm">
          Create a Startup
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0b57d0] to-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pitch Deck Builder</h1>
            <p className="text-sm text-slate-500">Build, preview & export your investor pitch</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={saveDeck}
            className={`px-4 py-2.5 rounded-xl border font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
              saved ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            {saved ? <FaCheckCircle className="text-emerald-500 text-xs" /> : <FaSave className="text-slate-400 text-xs" />}
            {saved ? 'Saved!' : 'Save'}
          </button>

          <button
            onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            {mode === 'edit' ? <FaEye className="text-indigo-500 text-xs" /> : <FaEdit className="text-indigo-500 text-xs" />}
            {mode === 'edit' ? 'Preview' : 'Edit'}
          </button>

          <button
            onClick={exportPDF}
            disabled={!!exporting}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            {exporting === 'pdf' ? <FaSpinner className="animate-spin text-xs" /> : <FaFilePdf className="text-xs" />}
            Export PDF
          </button>

          <button
            onClick={exportPPTX}
            disabled={!!exporting}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            {exporting === 'pptx' ? <FaSpinner className="animate-spin text-xs" /> : <FaFileAlt className="text-xs" />}
            Export PPTX
          </button>
        </div>
      </div>

      {/* ── Startup Selector + Progress ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <FaRocket className="text-[#0b57d0] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Startup</p>
            <select
              value={selectedStartup?.id || ''}
              onChange={(e) => { const s = startups.find((x) => x.id === e.target.value); if (s) selectStartup(s) }}
              className="w-full text-sm font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer mt-0.5"
            >
              {startups.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Deck Completion</p>
            <span className="text-sm font-black text-[#0b57d0]">{completedCount}/{SECTIONS.length} sections</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / SECTIONS.length) * 100}%`, background: 'linear-gradient(90deg, #0b57d0, #6366f1)' }}
            />
          </div>
          <div className="flex mt-2 gap-1">
            {SECTIONS.map((s) => (
              <div key={s.id} className={`flex-1 h-1 rounded-full transition-all ${deck.sections[s.id]?.trim() ? 'bg-[#0b57d0]' : 'bg-slate-200'}`} title={s.title} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Deck Details Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        {[
          { label: 'Startup Name', key: 'startupName', placeholder: 'e.g. AgroLink' },
          { label: 'Tagline', key: 'tagline', placeholder: 'e.g. Connecting Farmers to Markets' },
          { label: 'Founder Name', key: 'founderName', placeholder: 'Your name' },
          { label: 'Website', key: 'websiteUrl', placeholder: 'https://...' },
        ].map(({ label, key, placeholder }) => (
          <div key={key} className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</label>
            <input
              type="text"
              value={(deck as any)[key]}
              onChange={(e) => { setDeck((p) => ({ ...p, [key]: e.target.value })); setSaved(false) }}
              placeholder={placeholder}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] transition-all"
            />
          </div>
        ))}
      </div>

      {/* ── Main Editor / Preview ── */}
      {mode === 'edit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Nav */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">Sections</p>
            {SECTIONS.map((s, i) => {
              const done = !!deck.sections[s.id]?.trim()
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeSection === i
                      ? 'border-[#0b57d0] bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{s.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-black truncate ${activeSection === i ? 'text-[#0b57d0]' : 'text-slate-800'}`}>{s.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{s.subtitle}</p>
                  </div>
                  {done
                    ? <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0">
                        <FaCheckCircle className="text-emerald-500 text-[9px]" />
                      </span>
                    : <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0" />
                  }
                </button>
              )
            })}
          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Slide preview of current section */}
            <SlidePreview
              section={currentSection}
              content={deck.sections[currentSection.id]}
              deck={deck}
              slideIndex={activeSection}
              total={SECTIONS.length}
            />

            {/* Editor */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className={`p-4 bg-gradient-to-r ${currentSection.gradient} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentSection.icon}</span>
                  <div>
                    <h3 className="font-black text-white text-sm">{currentSection.title}</h3>
                    <p className="text-[10px] text-white/60">{currentSection.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => applyTemplate(currentSection.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all cursor-pointer"
                  title="Fill with template text"
                >
                  <FaMagic className="text-[10px]" /> Template
                </button>
              </div>

              <div className="p-4">
                <textarea
                  value={deck.sections[currentSection.id]}
                  onChange={(e) => updateSection(currentSection.id, e.target.value)}
                  placeholder={currentSection.placeholder}
                  rows={7}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b57d0] transition-all resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {deck.sections[currentSection.id]?.length || 0} characters
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                      disabled={activeSection === 0}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <FaChevronLeft className="text-[9px]" /> Prev
                    </button>
                    <button
                      onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))}
                      disabled={activeSection === SECTIONS.length - 1}
                      className="px-3 py-1.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      Next <FaChevronRight className="text-[9px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Full Deck Preview Mode ── */
        <div className="space-y-4">
          {/* Slide nav */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto">
              {SECTIONS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setPreviewSlide(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                    previewSlide === i ? 'bg-[#0b57d0] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{s.icon}</span> {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Current slide */}
          <div className="max-w-4xl mx-auto">
            <SlidePreview
              section={SECTIONS[previewSlide]}
              content={deck.sections[SECTIONS[previewSlide].id]}
              deck={deck}
              slideIndex={previewSlide}
              total={SECTIONS.length}
            />
          </div>

          {/* Nav arrows */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPreviewSlide((p) => Math.max(0, p - 1))}
              disabled={previewSlide === 0}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 cursor-pointer transition-all shadow-sm"
            >
              <FaChevronLeft />
            </button>
            <span className="text-sm font-bold text-slate-600">{previewSlide + 1} / {SECTIONS.length}</span>
            <button
              onClick={() => setPreviewSlide((p) => Math.min(SECTIONS.length - 1, p + 1))}
              disabled={previewSlide === SECTIONS.length - 1}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 cursor-pointer transition-all shadow-sm"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* All slides grid for PDF/print (removed duplicate id) */}
          <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '960px' }}>
            {SECTIONS.map((s, i) => (
              <div key={s.id} className="pitch-slide" style={{ width: '960px', height: '540px', marginBottom: '10px' }}>
                <SlidePreview section={s} content={deck.sections[s.id]} deck={deck} slideIndex={i} total={SECTIONS.length} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden slides for PDF export (always in DOM) */}
      <div id="pitch-slides-container" style={{ position: 'fixed', left: '-9999px', top: 0, width: '960px', pointerEvents: 'none', zIndex: -1 }}>
        {SECTIONS.map((s, i) => (
          <div key={s.id} className="pitch-slide" style={{ width: '960px', height: '540px', marginBottom: '10px' }}>
            <SlidePreview section={s} content={deck.sections[s.id]} deck={deck} slideIndex={i} total={SECTIONS.length} />
          </div>
        ))}
      </div>

      {/* Export loading overlay */}
      {exporting && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 text-center space-y-4 max-w-xs w-full">
            <FaSpinner className="animate-spin text-4xl text-[#0b57d0] mx-auto" />
            <div>
              <p className="font-black text-slate-800 text-lg">
                {exporting === 'pdf' ? 'Generating PDF...' : 'Building Presentation...'}
              </p>
              <p className="text-sm text-slate-500 mt-1">This may take a few seconds</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PitchDeckBuilder
