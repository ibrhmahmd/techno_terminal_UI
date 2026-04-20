import { useState } from 'react'
import { User, Phone, Mail, UserCircle, UsersRound, Check, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../Toast'

interface Sibling {
  id: number
  name: string
  age?: number
  link?: string
}

interface FamilyCardProps {
  parent?: {
    name: string
    phone?: string
    email?: string
    relationship?: string
  } | null
  siblings?: Sibling[]
  onLinkParent?: () => void
}

export function FamilyCard({ parent, siblings = [], onLinkParent }: FamilyCardProps) {
  const navigate = useNavigate()
  const { showToast, ToastComponent } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      showToast('Phone number copied to clipboard', 'success')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const hasSiblings = siblings && siblings.length > 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Parent Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            Parent
          </h3>
          {onLinkParent && !parent && (
            <button
              onClick={onLinkParent}
              className="text-xs text-secondary hover:text-secondary/80 font-medium"
            >
              + Link
            </button>
          )}
        </div>

        {!parent ? (
          <div className="text-center py-3">
            <p className="text-slate-500 text-xs">No parent linked</p>
            {onLinkParent && (
              <button
                onClick={onLinkParent}
                className="mt-1 text-xs text-secondary hover:text-secondary/80"
              >
                Link a parent
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface text-sm truncate">{parent.name}</p>
                {parent.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <button
                      onClick={() => handleCopyPhone(parent.phone!)}
                      className="text-xs text-slate-500 hover:text-secondary transition-colors cursor-pointer"
                      title="Click to copy"
                    >
                      {parent.phone}
                    </button>
                    {copied && <Check className="w-3 h-3 text-green-600" />}
                  </div>
                )}
              </div>
            </div>

            {parent.email && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span className="truncate">{parent.email}</span>
              </p>
            )}

            {parent.relationship && (
              <p className="text-xs text-slate-400 capitalize">{parent.relationship}</p>
            )}
          </div>
        )}
      </div>

      {/* Siblings Section - Only show if parent exists and there are siblings */}
      {parent && hasSiblings && (
        <>
          <div className="border-t border-slate-100" />
          <div className="p-4 bg-slate-50/50">
            <h4 className="font-medium text-slate-700 flex items-center gap-2 mb-3 text-sm">
              <UsersRound className="w-4 h-4 text-slate-500" />
              Siblings ({siblings.length})
            </h4>
            <div className="space-y-2">
              {siblings.map((sibling) => (
                <div
                  key={sibling.id}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                      <UserCircle className="w-3 h-3 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{sibling.name}</p>
                      {sibling.age && (
                        <p className="text-xs text-slate-500">Age {sibling.age}</p>
                      )}
                    </div>
                  </div>
                  {sibling.link && (
                    <button
                      onClick={() => navigate(sibling.link!)}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                      title="View student"
                    >
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {ToastComponent}
    </div>
  )
}

export default FamilyCard
