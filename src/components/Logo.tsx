import type { FC } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  lightText?: boolean
  onClick?: () => void
}

export const Logo: FC<LogoProps> = ({ size = 'md', lightText = false, onClick }) => {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9'
  const titleSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Kerala Startup Mission Geometric Pyramid Icon */}
      <svg
        className={`${iconSize} shrink-0 transition-transform duration-300 hover:scale-105`}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top apex diamond */}
        <path d="M24 4L29 12L24 20L19 12L24 4Z" fill="#00A88F" />
        {/* Left wing triangle */}
        <path d="M18 13L23 21L14 27L9 19L18 13Z" fill="#008080" />
        {/* Right wing triangle */}
        <path d="M30 13L39 19L34 27L25 21L30 13Z" fill="#00B4D8" />
        {/* Bottom Left wing */}
        <path d="M13 28L22 22L17 38L8 34L13 28Z" fill="#006666" />
        {/* Bottom Right wing */}
        <path d="M35 28L40 34L31 38L26 22L35 28Z" fill="#0077B6" />
        {/* Center core */}
        <polygon points="24,18 29,27 24,35 19,27" fill="#06D6A0" />
        {/* Base foundation */}
        <path d="M18 39L24 36L30 39L24 44L18 39Z" fill="#023E8A" />
      </svg>

      {/* Kerala Startup Mission Brand Typography */}
      <div className="flex flex-col leading-tight">
        <div className={`font-black tracking-wider uppercase ${titleSize} ${lightText ? 'text-white' : 'text-slate-900'}`}>
          KERALA
        </div>
        <div className={`font-black tracking-widest text-[9px] uppercase ${lightText ? 'text-cyan-300' : 'text-[#0b57d0]'} flex items-center gap-1`}>
          <span>STARTUP MISSION</span>
          <span className="text-[7px] border border-current rounded-full px-0.5 leading-none">®</span>
        </div>
      </div>
    </div>
  )
}
