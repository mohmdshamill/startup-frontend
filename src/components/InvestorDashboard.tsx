import { useState, useEffect, type FC } from 'react'
import { FaBuilding, FaHeart, FaRegHeart, FaEnvelope, FaSearch, FaSpinner, FaFilter } from 'react-icons/fa'

interface Startup {
  id: string
  title: string
  tagline: string
  description: string
  category: string
  stage: string
  isFavorite: boolean
  pitchDeckUrl?: string | null
  founder: {
    id: string
    name: string
    email: string
    avatar?: string
    linkedinUrl?: string
  }
}

interface Props {
  user: any
  token: string
}

const API = 'http://localhost:5000/api'

export const InvestorDashboard: FC<Props> = ({ user, token }) => {
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'all' | 'favorites'>('all')
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
  
  useEffect(() => {
    loadStartups()
  }, [view, search])
  
  const loadStartups = async () => {
    try {
      if (view === 'favorites') {
        const res = await fetch(`${API}/investors/favorites`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok) {
          setStartups(data.favorites.map((f: any) => ({ ...f.startupIdea, isFavorite: true })))
        }
      } else {
        let url = `${API}/investors/startups`
        if (search) url += `?search=${encodeURIComponent(search)}`
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok) setStartups(data.startups || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (e: React.MouseEvent, startupId: string) => {
    e.stopPropagation()
    try {
      const res = await fetch(`${API}/investors/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ startupIdeaId: startupId })
      })
      const data = await res.json()
      if (res.ok) {
        if (view === 'favorites' && !data.isFavorite) {
          setStartups((prev) => prev.filter((s) => s.id !== startupId))
        } else {
          setStartups((prev) => prev.map((s) => s.id === startupId ? { ...s, isFavorite: data.isFavorite } : s))
        }
        if (selectedStartup?.id === startupId) setSelectedStartup({ ...selectedStartup, isFavorite: data.isFavorite })
      }
    } catch (e) {}
  }

  const contactFounder = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg">
            <span className="text-2xl text-white">💼</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Investor Dashboard</h1>
            <p className="text-sm text-slate-500">Discover and connect with promising startups</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
          <FaSearch className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search startups, categories, or keywords..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-slate-800"
          />
        </div>
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button 
            onClick={() => setView('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'all' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All Startups
          </button>
          <button 
            onClick={() => setView('favorites')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'favorites' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            My Favorites
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center"><FaSpinner className="animate-spin text-3xl text-emerald-600" /></div>
      ) : startups.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <FaBuilding className="text-5xl text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-800">No startups found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((s) => (
            <div 
              key={s.id} 
              onClick={() => setSelectedStartup(s)}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">{s.category}</span>
                </div>
                <button 
                  onClick={(e) => toggleFavorite(e, s.id)}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  {s.isFavorite ? <FaHeart className="text-rose-500 text-lg" /> : <FaRegHeart className="text-slate-300 text-lg group-hover:text-rose-400" />}
                </button>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">{s.title}</h3>
              <p className="text-sm font-bold text-emerald-600 mb-4">{s.tagline}</p>
              <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-1">{s.description}</p>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                    {s.founder?.avatar ? <img src={s.founder.avatar} alt="Founder" /> : <FaBuilding className="text-slate-400 text-xs" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Founder</p>
                    <p className="text-xs font-black text-slate-800">{s.founder?.name || 'Unknown'}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black">{s.stage}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedStartup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-8 pb-0">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">{selectedStartup.title}</h2>
                  <p className="text-lg font-bold text-emerald-600">{selectedStartup.tagline}</p>
                </div>
                <button 
                  onClick={() => setSelectedStartup(null)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 font-bold text-slate-500"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-3 mb-8">
                <span className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-black uppercase">{selectedStartup.category}</span>
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase">{selectedStartup.stage}</span>
              </div>
            </div>

            <div className="p-8 pt-0 flex-1 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-3">About the Startup</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedStartup.description}</p>
            </div>

            <div className="p-8 bg-slate-50 rounded-b-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  {selectedStartup.founder?.avatar ? <img src={selectedStartup.founder.avatar} alt="Founder" className="rounded-full" /> : <span className="text-xl">🧑‍💼</span>}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{selectedStartup.founder?.name}</p>
                  <p className="text-xs font-medium text-slate-500">Founder</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => toggleFavorite(e as any, selectedStartup.id)}
                  className={`px-5 py-2.5 rounded-xl border font-bold text-sm flex items-center gap-2 transition-all ${
                    selectedStartup.isFavorite ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {selectedStartup.isFavorite ? <FaHeart /> : <FaRegHeart />} {selectedStartup.isFavorite ? 'Saved' : 'Save'}
                </button>
                <button 
                  onClick={() => contactFounder(selectedStartup.founder?.email)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-sm flex items-center gap-2"
                >
                  <FaEnvelope /> Contact Founder
                </button>
                {selectedStartup.pitchDeckUrl ? (
                  <button 
                    onClick={() => window.open(selectedStartup.pitchDeckUrl!, '_blank')}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm flex items-center gap-2 transition-colors"
                  >
                    📊 Review Pitch Deck
                  </button>
                ) : (
                  <button 
                    disabled
                    className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm flex items-center gap-2 cursor-not-allowed"
                    title="Founder has not uploaded a pitch deck yet"
                  >
                    📊 No Pitch Deck
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvestorDashboard
