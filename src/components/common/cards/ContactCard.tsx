import { User, Phone, Mail, UserCircle } from 'lucide-react'

interface ContactCardProps {
  name: string
  phone?: string
  email?: string
  role?: string
  relationship?: string
  avatar?: React.ReactNode
  onContact?: () => void
  onLink?: () => void
}

export function ContactCard({
  name,
  phone,
  email,
  role,
  relationship,
  avatar,
  onContact,
  onLink,
}: ContactCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-700 flex items-center gap-2">
          <User className="w-4 h-4 text-slate-500" />
          {role || 'Contact'}
        </h3>
        {onLink && (
          <button
            onClick={onLink}
            className="text-xs text-secondary hover:text-secondary/80 font-medium"
          >
            + Link
          </button>
        )}
      </div>

      {!name && onLink ? (
        <div className="text-center py-3">
          <p className="text-slate-500 text-xs">No contact linked</p>
          <button
            onClick={onLink}
            className="mt-1 text-xs text-secondary hover:text-secondary/80"
          >
            Link a contact
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {avatar || (
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-4 h-4 text-slate-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-on-surface text-sm truncate">{name}</p>
              {phone && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {phone}
                </p>
              )}
            </div>
          </div>
          
          {email && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span className="truncate">{email}</span>
            </p>
          )}
          
          {relationship && (
            <p className="text-xs text-slate-400 capitalize">{relationship}</p>
          )}

          {onContact && phone && (
            <button
              onClick={onContact}
              className="w-full mt-2 text-xs text-secondary hover:text-secondary/80 flex items-center justify-center gap-1 py-1 border border-secondary/20 rounded hover:bg-secondary/5"
            >
              <Phone className="w-3 h-3" />
              Call
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ContactCard
