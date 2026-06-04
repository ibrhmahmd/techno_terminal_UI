import { useNavigate } from 'react-router-dom'

export interface ParentMobileCardProps {
  id: number
  name: string
  phone: string | null
  studentCount: number
}

export function ParentMobileCard({
  id,
  name,
  phone,
  studentCount
}: ParentMobileCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/parents/${id}`)}
      className="w-full bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between text-left transition-colors active:bg-slate-50"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">family_restroom</span>
        </div>
        
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 truncate mb-0.5">{name}</h3>
          <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[14px]">call</span>
              <span className="truncate">{phone || 'No phone'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="material-symbols-outlined text-[14px]">face</span>
              <span>{studentCount}</span>
            </div>
          </div>
        </div>
      </div>
      
      <span className="material-symbols-outlined text-slate-300 shrink-0 ml-2">chevron_right</span>
    </button>
  )
}
