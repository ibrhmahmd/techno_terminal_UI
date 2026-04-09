import { useNavigate } from 'react-router-dom'

interface TopNavbarProps {
  activePage?: string
}

export function TopNavbar({ activePage = 'Dashboard' }: TopNavbarProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-8 h-16 bg-white border-b border-slate-200">
      <div className="flex items-center gap-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm font-medium font-[Inter]">
          <span className="text-slate-400">Home</span>
          <span className="text-slate-200">/</span>
          <span className="text-secondary font-semibold">{activePage}</span>
        </nav>

        {/* Search Bar */}
        {/* <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search data..." 
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary focus:bg-white transition-all"
          />
        </div> */}
      </div>

      <div className="flex items-center gap-4">
        <button
          className="px-4 py-1.5 bg-secondary text-white rounded text-xs font-semibold hover:opacity-90 transition-opacity"
          onClick={() => navigate('/enrollments')}
        >
          New Enrollment
        </button>
        {/* <div className="w-px h-6 bg-slate-200"></div>
        <button className="px-4 py-1.5 border border-slate-200 rounded text-xs font-bold font-headline text-on-surface hover:bg-slate-50 transition-colors">
          AR / EN
        </button> */}
      </div>
    </header>
  )
}
