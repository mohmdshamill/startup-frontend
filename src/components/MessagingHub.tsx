import { useState, type FC } from 'react'
import { FaUserCircle, FaPaperPlane, FaUsers, FaChalkboardTeacher, FaChartLine, FaComments } from 'react-icons/fa'

interface MessagingHubProps {
  currentUser?: any
}

export const MessagingHub: FC<MessagingHubProps> = ({ currentUser }) => {
  const [activeChat, setActiveChat] = useState<'team' | 'mentor' | 'investor' | 'group'>('team')
  const [message, setMessage] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    // Here you would implement sending logic
    console.log(`Sending message in ${activeChat}: ${message}`)
    setMessage('')
  }

  const getChatTitle = () => {
    switch (activeChat) {
      case 'team': return 'Founder - Team'
      case 'mentor': return 'Founder - Mentor'
      case 'investor': return 'Founder - Investor'
      case 'group': return 'Team Collaboration Chat'
    }
  }

  return (
    <div className="flex h-[80vh] w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
      
      {/* Sidebar Navigation */}
      <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <h2 className="text-lg font-black flex items-center gap-2">
            <FaComments /> Messaging
          </h2>
          <p className="text-xs text-blue-100 mt-1 opacity-90">Secure communication hub</p>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <button
            onClick={() => setActiveChat('team')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${
              activeChat === 'team'
                ? 'bg-blue-100 text-[#0b57d0] shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FaUserCircle className={activeChat === 'team' ? 'text-[#0b57d0]' : 'text-slate-400'} />
            Founder - Team
          </button>
          
          <button
            onClick={() => setActiveChat('mentor')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${
              activeChat === 'mentor'
                ? 'bg-purple-100 text-purple-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FaChalkboardTeacher className={activeChat === 'mentor' ? 'text-purple-600' : 'text-slate-400'} />
            Founder - Mentor
          </button>

          <button
            onClick={() => setActiveChat('investor')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${
              activeChat === 'investor'
                ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FaChartLine className={activeChat === 'investor' ? 'text-emerald-600' : 'text-slate-400'} />
            Founder - Investor
          </button>

          <button
            onClick={() => setActiveChat('group')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${
              activeChat === 'group'
                ? 'bg-amber-100 text-amber-800 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FaUsers className={activeChat === 'group' ? 'text-amber-600' : 'text-slate-400'} />
            Team Collaboration Chat
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        
        {/* Chat Header */}
        <div className="h-20 px-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg
              ${activeChat === 'team' ? 'bg-[#0b57d0]' : ''}
              ${activeChat === 'mentor' ? 'bg-purple-600' : ''}
              ${activeChat === 'investor' ? 'bg-emerald-600' : ''}
              ${activeChat === 'group' ? 'bg-amber-500' : ''}
            `}>
              {getChatTitle().charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-slate-900">{getChatTitle()}</h3>
              <p className="text-xs text-slate-500 font-medium">Active now</p>
            </div>
          </div>
        </div>

        {/* Messages List (Empty Placeholder for UI) */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
            <FaComments className="text-5xl opacity-20" />
            <p className="text-sm font-bold">Start the conversation in {getChatTitle()}</p>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#0b57d0]/50 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="w-12 h-12 rounded-2xl bg-[#0b57d0] hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              <FaPaperPlane className="text-sm ml-1" />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
