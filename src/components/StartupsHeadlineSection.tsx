import { useState, type FC } from 'react'
import { FaChevronLeft, FaChevronRight, FaTimes, FaArrowRight, FaRocket, FaExternalLinkAlt } from 'react-icons/fa'

interface StartupsHeadlineSectionProps {
  onExploreAllStartups: () => void
}

interface SpotlightStartup {
  id: string
  name: string
  logoText: string
  logoBg: string
  logoColor: string
  description: string
  category: string
  valuationOrFunding: string
  keyMilestone: string
  website: string
  foundedYear: string
  founders: string
}

const SPOTLIGHT_STARTUPS: SpotlightStartup[] = [
  {
    id: 'superbryn',
    name: 'Superbryn',
    logoText: 'SB',
    logoBg: 'bg-slate-900',
    logoColor: 'text-white',
    description:
      'Voice AI Infrastructure startup building evaluation systems for reliable enterprise agents; raised $1.2M pre-seed led by Kalaari Capital.',
    category: 'Enterprise AI & Voice Intelligence',
    valuationOrFunding: '$1.2 Million Pre-Seed',
    keyMilestone: 'Led by Kalaari Capital; evaluating 10M+ automated enterprise voice dialogues weekly.',
    website: 'https://superbryn.ai',
    foundedYear: '2023',
    founders: 'Kerala AI Lab Alumni Team',
  },
  {
    id: 'navalt',
    name: 'Navalt',
    logoText: 'Navalt',
    logoBg: 'bg-blue-900',
    logoColor: 'text-blue-300',
    description:
      'Among the largest solar-electric boat manufacturers; builds renewable vessels, secured ₹90 crore order book, raised BanyanTree PE growth capital.',
    category: 'Clean Maritime Mobility',
    valuationOrFunding: '₹90+ Crore Order Book',
    keyMilestone: 'Built ADITYA, India’s 1st solar-electric ferry with Gustave Trouvé Award of Excellence.',
    website: 'https://navaltboats.com',
    foundedYear: '2016',
    founders: 'Sandith Thandasherry',
  },
  {
    id: 'eyerov',
    name: 'IROV Technologies Pvt Ltd',
    logoText: 'EyeROV',
    logoBg: 'bg-cyan-950',
    logoColor: 'text-cyan-400',
    description:
      'EyeROV – Marine robotics startup building advanced underwater ROVs; raised ₹15 crore and secured ₹47 crore Indian Navy contract.',
    category: 'DeepTech Marine Robotics',
    valuationOrFunding: '₹47 Crore Indian Navy Contract',
    keyMilestone: 'Underwater drone inspection deployed by Indian Navy, DRDO, and major dam authorities.',
    website: 'https://eyerov.com',
    foundedYear: '2017',
    founders: 'Johns T Mathai & Kannappa Palaniappan (IIT Alumni)',
  },
  {
    id: 'netrasemi',
    name: 'Netrasemi Pvt Ltd',
    logoText: 'NETRASEMI',
    logoBg: 'bg-orange-950',
    logoColor: 'text-orange-400',
    description:
      'NetraSemi – Fabless semiconductor startup developing energy-efficient AI edge chips; raised ₹107 crore from Zoho and Unicorn India Ventures.',
    category: 'Fabless Edge AI Silicon',
    valuationOrFunding: '₹107 Crore Series A',
    keyMilestone: 'Backed by Zoho Corporation & Unicorn India Ventures for ultra-low power vision processors.',
    website: 'https://netrasemi.com',
    foundedYear: '2020',
    founders: 'Deepak Thomas & Semiconductor Veteran Group',
  },
  {
    id: 'genrobotics',
    name: 'Genrobotics Innovations',
    logoText: 'GENROBOTICS',
    logoBg: 'bg-indigo-950',
    logoColor: 'text-indigo-400',
    description:
      'Pioneers of Bandicoot, the world’s first robotic scavenger ending manual scavenging, backed by Anand Mahindra and Sridhar Vembu.',
    category: 'Social Impact Robotics & Healthcare',
    valuationOrFunding: '₹20+ Crore Growth Capital',
    keyMilestone: 'Deployed across 18+ Indian States & exported to Southeast Asia.',
    website: 'https://genrobotics.org',
    foundedYear: '2018',
    founders: 'Vimal Govind MK, Arun George, Rashid K, Nikhil NP',
  },
  {
    id: 'entri',
    name: 'Entri App',
    logoText: 'ENTRI',
    logoBg: 'bg-blue-950',
    logoColor: 'text-blue-400',
    description:
      'Leading vernacular learning platform empowering 15M+ regional language job aspirants with tailored vocational courses.',
    category: 'Vernacular EdTech',
    valuationOrFunding: '$10M+ Raised',
    keyMilestone: 'Ranked top learning app across South India with over 15 million registered learners.',
    website: 'https://entri.app',
    foundedYear: '2017',
    founders: 'Mohammed Hisamuddin & Rahul Ramesh',
  },
]

export const StartupsHeadlineSection: FC<StartupsHeadlineSectionProps> = ({ onExploreAllStartups }) => {
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [selectedSpotlight, setSelectedSpotlight] = useState<SpotlightStartup | null>(null)

  // Max visible cards on desktop is 4
  const cardsPerPage = 4
  const maxIndex = Math.max(0, SPOTLIGHT_STARTUPS.length - cardsPerPage)

  const handlePrev = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCarouselIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  return (
    <section id="startups-section" className="w-full py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching Image 1 */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          {/* Left Title Block */}
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-[#0b57d0] mb-2">
              SPOTLIGHT KERALA
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Startups Making Headline
            </h2>
          </div>

          {/* Right Description & CTA matching Image 1 */}
          <div className="lg:max-w-md flex flex-col items-start lg:items-end text-left lg:text-right space-y-2">
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              A spotlight on rising startups gaining attention for their breakthroughs, milestones, and momentum in the ecosystem.
            </p>
            <button
              onClick={onExploreAllStartups}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0b57d0] hover:text-blue-800 transition-colors cursor-pointer"
            >
              <span>Explore Our Startups</span>
              <FaArrowRight className="text-[10px]" />
            </button>
          </div>
        </div>

        {/* Startups Carousel Track */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SPOTLIGHT_STARTUPS.slice(carouselIndex, carouselIndex + cardsPerPage).map((startup) => (
              <div
                key={startup.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[300px]"
              >
                <div>
                  {/* Top Logo Chip */}
                  <div className="mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${startup.logoBg} ${startup.logoColor} flex items-center justify-center font-black text-xs shadow-md ring-1 ring-slate-200`}>
                      {startup.logoText}
                    </div>
                  </div>

                  {/* Startup Title */}
                  <h3 className="text-base font-extrabold text-slate-900 mb-2.5">
                    {startup.name}
                  </h3>

                  {/* Startup Headline Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {startup.description}
                  </p>
                </div>

                {/* Learn More Button matching Image 1 */}
                <div className="pt-6">
                  <button
                    onClick={() => setSelectedSpotlight(startup)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0b57d0] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Learn More</span>
                    <FaArrowRight className="text-[10px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Navigation Buttons matching Image 1 */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={handlePrev}
              disabled={carouselIndex === 0}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                carouselIndex === 0
                  ? 'bg-blue-50 text-blue-300 cursor-not-allowed'
                  : 'bg-blue-100 text-[#0b57d0] hover:bg-blue-200 shadow-xs'
              }`}
              aria-label="Previous Startups"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <button
              onClick={handleNext}
              disabled={carouselIndex >= maxIndex}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                carouselIndex >= maxIndex
                  ? 'bg-blue-50 text-blue-300 cursor-not-allowed'
                  : 'bg-blue-100 text-[#0b57d0] hover:bg-blue-200 shadow-xs'
              }`}
              aria-label="Next Startups"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>

        </div>

      </div>

      {/* Spotlight Detail Modal */}
      {selectedSpotlight && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 sm:p-8 relative">
              <button
                onClick={() => setSelectedSpotlight(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>

              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${selectedSpotlight.logoBg} ${selectedSpotlight.logoColor} flex items-center justify-center font-black text-sm ring-2 ring-white/20 shadow-xl`}>
                  {selectedSpotlight.logoText}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300 block">
                    {selectedSpotlight.category}
                  </span>
                  <h3 className="text-2xl font-black">{selectedSpotlight.name}</h3>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4 text-slate-800">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {selectedSpotlight.description}
              </p>

              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">
                  Key Breakthrough / Traction
                </span>
                <p className="text-xs font-semibold text-slate-900">
                  {selectedSpotlight.keyMilestone}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Capital / Milestone</span>
                  <span className="font-extrabold text-emerald-700">{selectedSpotlight.valuationOrFunding}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Founded</span>
                  <span className="font-extrabold text-slate-900">{selectedSpotlight.foundedYear}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-800">Founding Team: </span>
                <span>{selectedSpotlight.founders}</span>
              </div>
            </div>

            <div className="p-4 sm:px-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedSpotlight(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <div className="flex gap-2">
                <a
                  href={selectedSpotlight.website}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Website</span>
                  <FaExternalLinkAlt className="text-[10px]" />
                </a>
                <button
                  onClick={() => {
                    setSelectedSpotlight(null)
                    onExploreAllStartups()
                  }}
                  className="px-5 py-2 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <FaRocket />
                  <span>View All Ideas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
