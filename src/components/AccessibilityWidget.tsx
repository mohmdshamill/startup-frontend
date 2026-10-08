import { useState, useEffect, type FC } from 'react'
import { FaUniversalAccess, FaTimes, FaFont, FaAdjust, FaUndoAlt } from 'react-icons/fa'

export const AccessibilityWidget: FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal')
  const [highContrast, setHighContrast] = useState(false)

  // Listen for Ctrl+F2 keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'F2') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Apply font size and contrast classes to body
  useEffect(() => {
    document.body.classList.remove('font-large', 'font-extra-large')
    if (fontSize === 'large') document.body.classList.add('font-large')
    if (fontSize === 'extra-large') document.body.classList.add('font-extra-large')

    if (highContrast) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }
  }, [fontSize, highContrast])

  const handleReset = () => {
    setFontSize('normal')
    setHighContrast(false)
  }

  return (
    <>
      {/* Floating Accessibility Trigger Button matching all 4 images */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex flex-col items-center justify-center w-14 h-14 rounded-full bg-[#6320ee] hover:bg-[#5215d6] text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer ring-4 ring-purple-400/20"
          title="Accessibility Options (Ctrl+F2)"
          aria-label="Accessibility Options"
        >
          <FaUniversalAccess className="text-xl group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-black uppercase tracking-tighter leading-none mt-0.5 opacity-90">
            Ctrl+F2
          </span>
        </button>
      </div>

      {/* Accessibility Controls Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <FaUniversalAccess className="text-[#6320ee]" />
              <span>Accessibility Settings</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>

          <div className="py-4 space-y-4">
            {/* Font Size Adjustment */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                <FaFont className="text-slate-400" />
                <span>Text Size</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    fontSize === 'normal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    fontSize === 'large' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Medium (+12%)
                </button>
                <button
                  onClick={() => setFontSize('extra-large')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    fontSize === 'extra-large' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Large (+25%)
                </button>
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <FaAdjust className="text-slate-500" />
                <span className="text-xs font-bold text-slate-800">High Contrast Mode</span>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  highContrast ? 'bg-[#6320ee]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    highContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <FaUndoAlt className="text-[10px]" />
              <span>Reset Default</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono">Shortcut: Ctrl+F2</span>
          </div>
        </div>
      )}
    </>
  )
}
