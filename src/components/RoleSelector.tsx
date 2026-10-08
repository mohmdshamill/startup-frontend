import type { FC } from 'react'

export type RoleType = 'FOUNDER' | 'DEVELOPER' | 'DESIGNER' | 'INVESTOR' | 'MENTOR' | 'ADMIN'

interface RoleOption {
  id: RoleType
  label: string
  icon: string
  tag: string
  description: string
  activeBorder: string
  activeBg: string
  badgeColor: string
}

export const ROLES: RoleOption[] = [
  {
    id: 'FOUNDER',
    label: 'Startup Founder',
    icon: '🚀',
    tag: 'Post & Recruit',
    description: 'Pitch startup ideas, build team & manage projects',
    activeBorder: 'border-indigo-600 ring-2 ring-indigo-500/20',
    activeBg: 'bg-gradient-to-b from-indigo-50/90 to-white',
    badgeColor: 'bg-indigo-600 text-white',
  },
  {
    id: 'DEVELOPER',
    label: 'Developer',
    icon: '💻',
    tag: 'Tech & Code',
    description: 'Join tech startups & build innovative applications',
    activeBorder: 'border-cyan-600 ring-2 ring-cyan-500/20',
    activeBg: 'bg-gradient-to-b from-cyan-50/90 to-white',
    badgeColor: 'bg-cyan-600 text-white',
  },
  {
    id: 'DESIGNER',
    label: 'Designer',
    icon: '🎨',
    tag: 'UI/UX & Brand',
    description: 'Create beautiful product interfaces & branding',
    activeBorder: 'border-pink-600 ring-2 ring-pink-500/20',
    activeBg: 'bg-gradient-to-b from-pink-50/90 to-white',
    badgeColor: 'bg-pink-600 text-white',
  },
  {
    id: 'INVESTOR',
    label: 'Investor',
    icon: '📈',
    tag: 'Fund & Scale',
    description: 'Discover high-potential Kerala startups to fund',
    activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/20',
    activeBg: 'bg-gradient-to-b from-emerald-50/90 to-white',
    badgeColor: 'bg-emerald-600 text-white',
  },
  {
    id: 'MENTOR',
    label: 'Mentor',
    icon: '🎓',
    tag: 'Guide & Advise',
    description: 'Share industry expertise & advise early founders',
    activeBorder: 'border-amber-600 ring-2 ring-amber-500/20',
    activeBg: 'bg-gradient-to-b from-amber-50/90 to-white',
    badgeColor: 'bg-amber-600 text-white',
  },
]

interface RoleSelectorProps {
  selectedRole: RoleType
  onSelectRole: (role: RoleType) => void
}

export const RoleSelector: FC<RoleSelectorProps> = ({ selectedRole, onSelectRole }) => {
  const activeRoleData = ROLES.find((r) => r.id === selectedRole) || ROLES[0]

  return (
    <div className="w-full mb-6 space-y-3">
      {/* Header Label with Selected Role Pill */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <span>🎯</span> Select Your Primary Role
        </label>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase transition-all shadow-sm ${activeRoleData.badgeColor}`}
        >
          {activeRoleData.label}
        </span>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.id
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role.id)}
              className={`group relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? `${role.activeBorder} ${role.activeBg} shadow-md -translate-y-0.5`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 hover:-translate-y-0.5 hover:shadow-sm'
              }`}
            >
              {/* Active Indicator Radio Dot */}
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-white flex items-center justify-center text-xl shadow-inner transition-colors">
                  {role.icon}
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? `${role.badgeColor} scale-100 shadow-sm`
                      : 'border border-slate-300 bg-white scale-90 opacity-60'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-slate-900">{role.label}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                  {role.tag}
                </span>
                <p className="text-[10.5px] text-slate-500 mt-1.5 leading-snug line-clamp-2 font-normal">
                  {role.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
