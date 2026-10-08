import { type FC } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { Logo } from './Logo'
import { FaTimes } from 'react-icons/fa'

interface AuthModalProps {
  isOpen: boolean
  mode: 'login' | 'register'
  onClose: () => void
  onSwitchMode: (mode: 'login' | 'register') => void
  onSuccess: (data: { user: any; token: string }) => void
  onOpenForgotPassword: () => void
}

export const AuthModal: FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSwitchMode,
  onSuccess,
  onOpenForgotPassword,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full my-auto overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-5 sm:px-8 flex items-center justify-between">
          <Logo size="sm" />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="p-6 sm:p-8">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => onSwitchMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#0b57d0] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#0b57d0] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Content */}
          {mode === 'login' ? (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-black text-slate-900">Welcome Back</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign in to access your startup ideas, collaboration requests, and mentor network.
                </p>
              </div>
              <LoginForm
                onSuccess={(data) => {
                  onSuccess(data)
                  onClose()
                }}
                onSwitchToRegister={() => onSwitchMode('register')}
                onOpenForgotPassword={onOpenForgotPassword}
              />
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-black text-slate-900">Join Kerala Startup Ecosystem</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your primary ecosystem role and register your profile.
                </p>
              </div>
              <RegisterForm
                onSuccess={(data) => {
                  onSuccess(data)
                  onClose()
                }}
                onSwitchToLogin={() => onSwitchMode('login')}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
