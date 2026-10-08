import type { FC } from 'react'
import keralaHeroBg from '../assets/kerala_hero_bg.jpg'
import { FaLightbulb, FaCompass, FaUsers } from 'react-icons/fa'

interface HeroSectionProps {
  onSubmitIdea: () => void
  onStartInKerala: () => void
  onJoinCommunity: () => void
}

export const HeroSection: FC<HeroSectionProps> = ({
  onSubmitIdea,
  onStartInKerala,
  onJoinCommunity,
}) => {
  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden bg-slate-950 text-white">
      {/* Aerial Landscape Background */}
      <img
        src={keralaHeroBg}
        alt="Kerala Startup Mission Tech Campus"
        className="absolute inset-0 w-full h-full object-cover object-center scale-100 transition-transform duration-1000 ease-out hover:scale-105"
      />

      {/* Modern subtle darkening overlay gradient (darker on left for strong readability, clear on right for campus vista) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="max-w-2xl space-y-6">
          
          {/* Main Headline */}
          <div className="space-y-1">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight drop-shadow-lg">
              Dream it.
            </h1>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight drop-shadow-lg">
              Do it.
            </h1>
          </div>

          {/* Subtitle Description */}
          <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-xl drop-shadow">
            A nodal agency of the Government of Kerala for entrepreneurship development and incubation activities in Kerala, India
          </p>

          {/* 3 Call-To-Action Buttons matching Image 4 */}
          <div className="pt-4 flex flex-wrap items-center gap-3.5 sm:gap-4">
            
            {/* Primary Action Button: Submit Your Idea */}
            <button
              onClick={onSubmitIdea}
              className="px-6 py-3.5 rounded-xl bg-[#0b57d0] hover:bg-[#0047ba] text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-900/40 cursor-pointer flex items-center gap-2"
            >
              <FaLightbulb className="text-amber-300" />
              <span>Submit Your Idea</span>
            </button>

            {/* Secondary Action Button: Start In Kerala */}
            <button
              onClick={onStartInKerala}
              className="px-6 py-3.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 backdrop-blur-md border border-blue-400/40 text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <FaCompass className="text-blue-300" />
              <span>Start In Kerala</span>
            </button>

            {/* Accent Orange Action Button: Join The Community */}
            <button
              onClick={onJoinCommunity}
              className="px-6 py-3.5 rounded-xl bg-[#ff7a00] hover:bg-[#e06c00] text-white font-extrabold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-orange-950/40 cursor-pointer flex items-center gap-2"
            >
              <FaUsers />
              <span>Join The Community</span>
            </button>

          </div>

          {/* Quick Ecosystem Stats Badge Strip */}
          <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-300 font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>5,000+ Registered Startups</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <span>₹2,500+ Cr Funding Raised</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              <span>10M+ Sq.Ft Incubation Hubs</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
