import { useState, type FC } from 'react'
import progFundingImg from '../assets/prog_funding.jpg'
import progIncubationImg from '../assets/prog_incubation.jpg'
import progLeapImg from '../assets/prog_leap.jpg'
import progExpansionImg from '../assets/prog_expansion.jpg'
import { FaArrowUp, FaCheckCircle, FaTimes } from 'react-icons/fa'

interface ProgramsSchemesSectionProps {
  onApplyScheme: (schemeTitle: string) => void
}

interface SchemeItem {
  id: string
  title: string
  description: string
  category: string
  image: string
  buttonColor: 'yellow' | 'blue'
  grantAmount?: string
  eligibility?: string
  benefits?: string[]
}

const SCHEMES_DATA: SchemeItem[] = [
  {
    id: 'funding',
    title: 'Early Stage Funding',
    description:
      'A comprehensive funding support initiative designed to assist startups across all stages of their journey, from idea and prototype to market readiness and growth.',
    category: 'Startups',
    image: progFundingImg,
    buttonColor: 'yellow',
    grantAmount: 'Up to ₹15 Lakhs Innovation Grant',
    eligibility: 'Early-stage tech startups registered in Kerala or DPIIT recognized.',
    benefits: [
      'Idea Grant up to ₹3,00,000 for proof-of-concept',
      'Productization Grant up to ₹7,00,000 for MVP testing',
      'Scaleup Assistance up to ₹15,00,000 with investor co-funding',
    ],
  },
  {
    id: 'incubation',
    title: 'Incubation & Acceleration',
    description:
      'Designed to nurture startups from early validation to rapid growth through mentorship, infrastructure, and ecosystem connections.',
    category: 'Startups',
    image: progIncubationImg,
    buttonColor: 'yellow',
    grantAmount: '6-Month Structured Acceleration',
    eligibility: 'Startups with functional prototypes looking for market entry.',
    benefits: [
      'Dedicated 1-on-1 industry mentor allocation',
      'Free cloud credits & SaaS perks worth $50,000+',
      'Direct pitch access to Kerala Angel Network & VC funds',
    ],
  },
  {
    id: 'coworking',
    title: 'Coworking Spaces (LEAP)',
    description:
      'LEAP Centres provide startups with flexible workspaces, ecosystem access, and growth support under one roof throughout Kerala.',
    category: 'Startups',
    image: progLeapImg,
    buttonColor: 'blue',
    grantAmount: 'Subsidized Plug-and-Play Desks',
    eligibility: 'Founders, remote tech workers, and early stage startup teams.',
    benefits: [
      'High-speed fiber connectivity, power backup, and modern meeting rooms',
      'FabLab and hardware rapid prototyping facility access',
      'Located across all 14 districts in Kerala',
    ],
  },
  {
    id: 'expansion',
    title: 'Market Expansion',
    description:
      'Designed to connect startups with national and global ecosystems through exposure visits, showcases, and strategic interactions.',
    category: 'Startups',
    image: progExpansionImg,
    buttonColor: 'yellow',
    grantAmount: 'International Showcase Sponsorship',
    eligibility: 'Revenue-generating startups expanding to international markets.',
    benefits: [
      'GITEX Dubai, CES Las Vegas, and Slush Helsinki delegations',
      'B2B matchmaking with enterprise clients and government buyers',
      'Soft-landing support in global tech hubs',
    ],
  },
]

const CATEGORY_TABS = [
  'Startups',
  'Mentors',
  'Investors',
  'Institutions',
  'Corporates',
  'Students',
  'Women',
  'Social',
]

export const ProgramsSchemesSection: FC<ProgramsSchemesSectionProps> = ({ onApplyScheme }) => {
  const [activeTab, setActiveTab] = useState('Startups')
  const [selectedSchemeModal, setSelectedSchemeModal] = useState<SchemeItem | null>(null)

  return (
    <section id="programs-section" className="w-full py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Royal Blue Card Container matching Image 3 */}
        <div className="relative w-full rounded-3xl sm:rounded-[36px] bg-gradient-to-b from-[#0052cc] to-[#0b57d0] text-white p-6 sm:p-10 lg:p-14 shadow-2xl overflow-hidden">
          
          {/* Subtle wave / curved background accent */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-300/15 blur-3xl pointer-events-none" />

          {/* Header Block */}
          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Programs & Schemes
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              Explore programs and schemes tailored to meet the evolving needs of the startup ecosystem,
              providing the right support and opportunities to drive progress and long-term impact.
            </p>
          </div>

          {/* Pill Category Filter Tabs matching Image 3 */}
          <div className="relative z-10 mt-8 mb-10 flex items-center justify-center">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-full bg-blue-900/40 backdrop-blur-md border border-white/15 max-w-full overflow-x-auto">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-white text-[#0b57d0] shadow-md shadow-blue-950/20'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Scheme Cards Row / Grid matching Image 3 */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SCHEMES_DATA.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => setSelectedSchemeModal(scheme)}
                className="group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-slate-800 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-slate-100"
              >
                <div>
                  {/* Top Illustration with Corner Arrow Badge */}
                  <div className="relative w-full h-44 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden mb-4 bg-slate-100 flex items-center justify-center">
                    <img
                      src={scheme.image}
                      alt={scheme.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Signature Yellow/Blue Arrow Button matching Image 3 */}
                    <button
                      className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                        scheme.buttonColor === 'yellow'
                          ? 'bg-amber-400 text-slate-900'
                          : 'bg-[#0b57d0] text-white'
                      }`}
                      aria-label="View Scheme Details"
                    >
                      <FaArrowUp className="transform rotate-45 text-xs font-black" />
                    </button>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-[#0b57d0] transition-colors">
                    {scheme.title}
                  </h3>

                  {/* Card Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {scheme.description}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#0b57d0]">
                  <span>Explore Details</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Interactive Scheme Details Modal */}
      {selectedSchemeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-[#0052cc] to-[#0b57d0] text-white p-6 sm:p-8">
              <button
                onClick={() => setSelectedSchemeModal(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2">
                {selectedSchemeModal.category} Initiative
              </span>
              <h3 className="text-2xl sm:text-3xl font-black">{selectedSchemeModal.title}</h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-2">{selectedSchemeModal.description}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-5">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Financial Support / Grant Quantum</span>
                <p className="text-sm font-bold text-slate-900">{selectedSchemeModal.grantAmount}</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Eligibility Criteria</h4>
                <p className="text-xs text-slate-700 font-medium">{selectedSchemeModal.eligibility}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Benefits & Offerings</h4>
                <div className="space-y-1.5">
                  {selectedSchemeModal.benefits?.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedSchemeModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const title = selectedSchemeModal.title
                  setSelectedSchemeModal(null)
                  onApplyScheme(title)
                }}
                className="px-6 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2"
              >
                <span>Apply for this Scheme</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
