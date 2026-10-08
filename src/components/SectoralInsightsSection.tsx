import { useState, type FC } from 'react'
import { FaExternalLinkAlt, FaTimes, FaRocket } from 'react-icons/fa'

interface SectoralInsightsSectionProps {
  onSelectSector: (sectorName: string) => void
}

interface SectorItem {
  id: string
  name: string
  iconSvg: React.ReactNode
  startupsCount: number
  fundingRaised: string
  description: string
  keySubsectors: string[]
}

export const SectoralInsightsSection: FC<SectoralInsightsSectionProps> = ({ onSelectSector }) => {
  const [activeModalSector, setActiveModalSector] = useState<SectorItem | null>(null)

  const SECTORS: SectorItem[] = [
    {
      id: 'aerospace',
      name: 'Aerospace and Defense',
      startupsCount: 84,
      fundingRaised: '₹140+ Cr',
      description:
        'Cutting-edge aerospace propulsion, unmanned aerial vehicles (UAVs), naval surveillance defense robotics, and satellite subsystems originating from Kerala.',
      keySubsectors: ['Drones & UAVs', 'Naval Defense Robotics', 'Avionics', 'Satellite Tech'],
      iconSvg: (
        <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#E0F2FE" />
          <path d="M48 20L20 32L14 28L10 32L18 38L24 46L28 42L24 36L36 28L48 20Z" fill="#0284C7" />
          <circle cx="44" cy="40" r="10" fill="#38BDF8" />
          <path d="M44 35V45M39 40H49" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'agritech',
      name: 'Agriculture and Life Sciences',
      startupsCount: 165,
      fundingRaised: '₹220+ Cr',
      description:
        'Smart precision farming, hydroponics, spice bio-extracts, biotechnology therapeutics, and post-harvest cold chain intelligence.',
      keySubsectors: ['Hydroponics & Precision Farming', 'Bio-fertilizers', 'Post-Harvest AI', 'Aquaculture'],
      iconSvg: (
        <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#DCFCE7" />
          <rect x="14" y="34" width="36" height="18" rx="4" fill="#38BDF8" />
          <circle cx="24" cy="28" r="6" fill="#F97316" />
          <circle cx="34" cy="26" r="7" fill="#FB923C" />
          <circle cx="43" cy="29" r="5" fill="#F97316" />
          <path d="M22 18C22 18 20 25 24 28C28 25 26 18 26 18" fill="#16A34A" />
          <path d="M38 16C38 16 35 23 40 26C44 23 42 16 42 16" fill="#16A34A" />
        </svg>
      ),
    },
    {
      id: 'bfsi',
      name: 'Banking, Financial Services and Insurance',
      startupsCount: 112,
      fundingRaised: '₹890+ Cr',
      description:
        'Digital neo-banking, micro-lending algorithms, automated accounting, cross-border payments, and decentralized insurtech protocols.',
      keySubsectors: ['Neo-Banking', 'Cross-Border Remittances', 'Micro-Insurtech', 'WealthTech'],
      iconSvg: (
        <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#E0E7FF" />
          <rect x="16" y="24" width="22" height="24" rx="3" fill="#3B82F6" />
          <circle cx="44" cy="40" r="10" fill="#FBBF24" />
          <circle cx="44" cy="40" r="7" fill="#F59E0B" />
          <path d="M22 32H32M22 38H30" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="40" cy="22" r="5" fill="#6366F1" />
        </svg>
      ),
    },
    {
      id: 'climate',
      name: 'Climate',
      startupsCount: 98,
      fundingRaised: '₹340+ Cr',
      description:
        'Clean energy mobility, solar electric maritime vessels, carbon capture monitoring, and circular economy waste bio-converters.',
      keySubsectors: ['Solar-Electric Mobility', 'Circular Bio-Economy', 'Carbon Credits', 'Clean Grid IoT'],
      iconSvg: (
        <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#FEF08A" />
          <circle cx="36" cy="26" r="12" fill="#FACC15" />
          <path d="M28 42C24 42 20 38 20 34C20 30 24 26 28 26C32 26 36 30 36 34C36 38 32 42 28 42Z" fill="#16A34A" />
          <path d="M18 36L14 48M14 40L20 42M22 48L18 40" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'construction',
      name: 'Construction',
      startupsCount: 62,
      fundingRaised: '₹95+ Cr',
      description:
        '3D concrete automated printing, BIM workflow collaboration, sustainable precast building materials, and site safety IoT sensors.',
      keySubsectors: ['3D Concrete Printing', 'ConTech SaaS', 'Eco-Materials', 'Prefabricated Modularity'],
      iconSvg: (
        <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#E0F2FE" />
          <rect x="22" y="24" width="26" height="24" rx="2" fill="#0284C7" />
          <path d="M14 48L24 16H34" stroke="#0369A1" strokeWidth="3" strokeLinecap="round" />
          <path d="M34 16L38 24" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" />
          <circle cx="48" cy="46" r="6" fill="#F59E0B" />
        </svg>
      ),
    },
    {
      id: 'healthcare',
      name: 'Healthcare & MedTech',
      startupsCount: 140,
      fundingRaised: '₹410+ Cr',
      description:
        'AI diagnostic imaging, point-of-care biosensors, robotic surgical tools, telemedicine networks, and genomics research.',
      keySubsectors: ['Point-of-Care Diagnostics', 'Robotic Rehabilitation', 'Tele-Health Networks', 'Ayur-Bio Pharma'],
      iconSvg: (
        <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#FFE4E6" />
          <circle cx="32" cy="32" r="16" fill="#F43F5E" />
          <path d="M32 24V40M24 32H40" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <circle cx="46" cy="20" r="5" fill="#38BDF8" />
        </svg>
      ),
    },
    {
      id: 'deeptech',
      name: 'AI, Robotics & DeepTech',
      startupsCount: 185,
      fundingRaised: '₹620+ Cr',
      description:
        'Autonomous sewer cleaning robots, generative enterprise copilots, fabless edge silicon chips, and marine underwater ROVs.',
      keySubsectors: ['Sanitation & Industrial Robotics', 'Fabless Semiconductors', 'Enterprise LLMs', 'Marine ROVs'],
      iconSvg: (
        <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#EDE9FE" />
          <rect x="20" y="20" width="24" height="24" rx="6" fill="#8B5CF6" />
          <circle cx="28" cy="30" r="3" fill="#A7F3D0" />
          <circle cx="36" cy="30" r="3" fill="#A7F3D0" />
          <path d="M26 38H38" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 14V20M14 32H20M44 32H50M32 44V50" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'edtech',
      name: 'EdTech & Skilling',
      startupsCount: 95,
      fundingRaised: '₹310+ Cr',
      description:
        'Vernacular learning apps, immersive gamified vocational skill labs, coding bootcamps, and higher education career readiness.',
      keySubsectors: ['Vernacular Upskilling', 'K-12 Stem Labs', 'AR/VR Training Simulators', 'Job Matchmaking'],
      iconSvg: (
        <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#E0F2FE" />
          <path d="M16 28L32 20L48 28L32 36L16 28Z" fill="#0284C7" />
          <path d="M22 32V42C22 42 26 46 32 46C38 46 42 42 42 42V32" fill="#38BDF8" />
          <circle cx="48" cy="36" r="3" fill="#F59E0B" />
        </svg>
      ),
    },
  ]

  return (
    <section id="sector-section" className="w-full py-16 sm:py-20 bg-dot-grid border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading matching Image 2 */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-[#0b57d0] text-xs font-black tracking-wider uppercase">
            SPOTLIGHT KERALA
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Sectoral Insights
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Discover Kerala's high-growth industry verticals powering the next wave of technological breakthroughs.
          </p>
        </div>

        {/* Sector Grid matching Image 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {SECTORS.map((sec) => (
            <div
              key={sec.id}
              onClick={() => setActiveModalSector(sec)}
              className="group bg-white rounded-3xl p-5 sm:p-6 border-2 border-blue-400/40 hover:border-[#0b57d0] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center justify-between min-h-[190px] sm:min-h-[220px]"
            >
              {/* Top Sector Illustration */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                {sec.iconSvg}
              </div>

              {/* Title and External Arrow */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#0b57d0] transition-colors leading-snug">
                <span>{sec.name}</span>
                <FaExternalLinkAlt className="text-[10px] text-slate-400 group-hover:text-[#0b57d0] transition-colors shrink-0" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Sector Insight Detail Modal */}
      {activeModalSector && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 relative">
              <button
                onClick={() => setActiveModalSector(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 block mb-1">
                KERALA ECOSYSTEM VERTICAL
              </span>
              <h3 className="text-2xl font-black">{activeModalSector.name}</h3>
            </div>

            <div className="p-6 space-y-4 text-slate-800">
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {activeModalSector.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Startups</span>
                  <span className="text-base font-black text-[#0b57d0]">{activeModalSector.startupsCount}+ Hubs</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Capital Deployed</span>
                  <span className="text-base font-black text-emerald-600">{activeModalSector.fundingRaised}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Specialized Sub-Sectors
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalSector.keySubsectors.map((sub, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setActiveModalSector(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const name = activeModalSector.name
                  setActiveModalSector(null)
                  onSelectSector(name)
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
              >
                <FaRocket className="text-amber-300" />
                <span>Submit / View Ideas in this Sector</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
