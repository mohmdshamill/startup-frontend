import type { FC } from 'react'
import progFunding from '../assets/prog_funding.jpg'
import progLeap from '../assets/prog_leap.jpg'
import progIncubation from '../assets/prog_incubation.jpg'
import progExpansion from '../assets/prog_expansion.jpg'

interface PlatformSectionsProps {
  onGetStarted: () => void
}

const STEPS = [
  { n: '1', title: 'Register & choose your role', text: 'Sign up as a Founder, Developer, Designer, Mentor or Investor. Your role decides what you see.', img: progLeap },
  { n: '2', title: 'Founders post startup ideas', text: 'Describe the idea, stage, category and the skills you need. Manage everything from one workspace.', img: progIncubation },
  { n: '3', title: 'Talent applies to join', text: 'Developers and designers pick a role and send a pitch with skills, availability and CV. Founders shortlist, accept or reject.', img: progExpansion },
  { n: '4', title: 'Investors back startups', text: 'Investors browse active startups, save favourites, and apply with a pitch and an investing amount in ₹.', img: progFunding },
]

const ROLES = [
  {
    icon: '🚀',
    role: 'Founder',
    color: 'border-t-[#0b57d0]',
    points: ['Create and manage startup ideas', 'Review applications and pick your team', 'Find teammates with Skill Matching', 'Pitch deck, tasks and team workspace'],
  },
  {
    icon: '💻',
    role: 'Developer / Designer',
    color: 'border-t-indigo-500',
    points: ['Explore startups and get recommendations', 'Apply with role, skills, hours and CV', 'Track status in My Applications', 'Work on assigned tasks with your team'],
  },
  {
    icon: '💼',
    role: 'Investor',
    color: 'border-t-[#00a88f]',
    points: ['Investor Dashboard with startup discovery', 'Filter by category and stage, save favourites', 'Apply with a pitch and amount in ₹', 'Track your investor applications'],
  },
  {
    icon: '🧭',
    role: 'Mentor',
    color: 'border-t-[#ff7a00]',
    points: ['Explore startups you can guide', 'Share experience in the team workspace', 'Keep a profile of your expertise'],
  },
  {
    icon: '🛡️',
    role: 'Admin',
    color: 'border-t-rose-500',
    points: ['Platform stats and user management', 'Verify startups', 'Review and resolve reports'],
  },
]

export const PlatformSections: FC<PlatformSectionsProps> = ({ onGetStarted }) => {
  return (
    <>
      {/* How it works */}
      <section id="how-it-works" className="w-full bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff7a00]">Our Workflow</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">How the platform works</h2>
            <p className="mt-3 text-slate-600">From idea to team to funding, step by step.</p>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-3xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col">
                <div className="relative aspect-[4/3] bg-slate-100">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 w-9 h-9 rounded-full bg-[#ff7a00] text-white text-sm font-black flex items-center justify-center shadow-lg">
                    {s.n}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-extrabold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Role based access */}
      <section id="roles-section" className="w-full bg-slate-50 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0b57d0]">Role Based Access</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">A dashboard for every role</h2>
            <p className="mt-3 text-slate-600">
              Choose a role when you register and sign in securely. Each role only sees the tools that matter to it.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROLES.map((r) => (
              <div key={r.role} className={`rounded-3xl bg-white border border-slate-200 border-t-4 ${r.color} shadow-md hover:shadow-xl transition-shadow p-6 space-y-4`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{r.icon}</span>
                  <h3 className="text-lg font-black text-slate-900">{r.role}</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  {r.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="text-[#00a88f] font-black">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investors */}
      <section id="investors-section" className="w-full bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
            <img src={progFunding} alt="Investment and seed funding" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00a88f]">For Investors</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Discover and back early-stage startups</h2>
            <p className="text-slate-600 leading-relaxed">
              See the idea, stage and founder in one place, and express interest directly.
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✓ Browse active startups and filter by category and stage</li>
              <li>✓ Save startups to your favourites</li>
              <li>✓ Apply with why you want to join and your investing amount (₹ INR)</li>
              <li>✓ Founders are notified; track every application in My Applications</li>
            </ul>
            <button
              onClick={onGetStarted}
              className="px-7 py-3.5 rounded-xl bg-[#ff7a00] hover:bg-[#e06c00] text-white font-extrabold text-sm shadow-lg shadow-orange-900/20 transition-colors cursor-pointer"
            >
              Register as an Investor
            </button>
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="w-full bg-gradient-to-r from-[#0b57d0] to-[#003da5] text-white py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-black">Ready to build, join or invest?</h2>
        <p className="mt-2 text-blue-100 text-sm">Create your account and open the dashboard made for your role.</p>
        <button
          onClick={onGetStarted}
          className="mt-6 px-8 py-3.5 rounded-xl bg-[#ff7a00] hover:bg-[#e06c00] font-extrabold text-sm cursor-pointer transition-colors"
        >
          Get Started
        </button>
      </section>
    </>
  )
}
