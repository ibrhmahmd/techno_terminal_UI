import { useNavigate } from 'react-router-dom'

export interface StudentMobileCardProps {
  id: number
  name: string
  gender: string
  grade?: string | null
  status: string
  billingStatus?: string
}

export function StudentMobileCard({
  id,
  name,
  gender,
  grade,
  status,
  billingStatus
}: StudentMobileCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/students/${id}`)}
      className="w-full bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between text-left transition-colors active:bg-slate-50"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          gender === 'male' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {gender === 'male' ? 'face' : 'face_3'}
          </span>
        </div>
        
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
            {billingStatus === 'due' && (
              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Payment Due" />
            )}
            {status === 'inactive' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider shrink-0">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 font-medium truncate">
            {grade || 'No grade specified'}
          </p>
        </div>
      </div>
      
      <span className="material-symbols-outlined text-slate-300 shrink-0 ml-2">chevron_right</span>
    </button>
  )
}
