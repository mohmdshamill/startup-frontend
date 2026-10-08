import { useState, type FC } from 'react'
import { FaSearch, FaTimes, FaRocket, FaBuilding, FaLightbulb } from 'react-icons/fa'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectItem: (item: any) => void
}

export const SearchModal: FC<SearchModalProps> = ({ isOpen, onClose, onSelectItem }) => {
  const [query, setQuery] = useState('')

  if (!isOpen) return null

  const SEARCH_ITEMS = [
    { title: 'Early Stage Innovation Grant', type: 'Program', category: 'Funding', link: 'programs-section' },
    { title: 'Incubation & Acceleration', type: 'Program', category: 'Support', link: 'programs-section' },
    { title: 'Coworking Spaces (LEAP)', type: 'Program', category: 'Infrastructure', link: 'programs-section' },
    { title: 'Market Expansion Support', type: 'Program', category: 'Global Scale', link: 'programs-section' },
    { title: 'Superbryn Voice AI', type: 'Startup', category: 'Enterprise AI', link: 'startups-section' },
    { title: 'Navalt Solar Electric Boats', type: 'Startup', category: 'Clean Mobility', link: 'startups-section' },
    { title: 'EyeROV Underwater Robotics', type: 'Startup', category: 'Defense & Marine', link: 'startups-section' },
    { title: 'NetraSemi Edge Silicon', type: 'Startup', category: 'Semiconductor', link: 'startups-section' },
    { title: 'Aerospace and Defense Verticals', type: 'Sector', category: 'DeepTech', link: 'sector-section' },
    { title: 'Agriculture & Life Sciences', type: 'Sector', category: 'BioTech', link: 'sector-section' },
    { title: 'Banking & FinTech', type: 'Sector', category: 'BFSI', link: 'sector-section' },
    { title: 'Climate & CleanTech', type: 'Sector', category: 'GreenTech', link: 'sector-section' },
  ]

  const filtered = query.trim()
    ? SEARCH_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()) ||
          item.type.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_ITEMS

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-20 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3">
          <FaSearch className="text-slate-400 text-base shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search programs, startups, sectors, or innovation grants..."
            autoFocus
            className="flex-1 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectItem(item)
                  onClose()
                }}
                className="p-3 rounded-2xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0b57d0] flex items-center justify-center text-xs shrink-0">
                    {item.type === 'Program' ? <FaLightbulb /> : item.type === 'Startup' ? <FaRocket /> : <FaBuilding />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0b57d0] transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.type} • {item.category}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-[#0b57d0] transition-colors font-bold">
                  →
                </span>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching programs, startups or sectors found.
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Kerala Startup Mission Portal Search
        </div>
      </div>
    </div>
  )
}
