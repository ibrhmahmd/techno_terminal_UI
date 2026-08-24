import { useTranslation } from 'react-i18next'

interface PersonalInfoSectionProps {
  formData: {
    full_name: string
    email: string
    phone: string
    national_id: string
    university: string
    major: string
    is_graduate: boolean
  }
  onChange: (field: string, value: string | boolean) => void
  isLoading?: boolean
}

export function PersonalInfoSection({ formData, onChange, isLoading }: PersonalInfoSectionProps) {
  const { t } = useTranslation('staff')
  return (
    <div className="space-y-4">
      {/* Name and Email */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => onChange('full_name', e.target.value)}
            placeholder={t('personal_info.full_name_placeholder')}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder={t('personal_info.email_placeholder')}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      {/* Phone and National ID */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder={t('personal_info.phone_placeholder')}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            National ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.national_id}
            onChange={(e) => onChange('national_id', e.target.value)}
            placeholder={t('personal_info.national_id_placeholder')}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      {/* University and Major */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">University</label>
          <input
            type="text"
            value={formData.university}
            onChange={(e) => onChange('university', e.target.value)}
            placeholder={t('personal_info.university_placeholder')}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Major</label>
          <input
            type="text"
            value={formData.major}
            onChange={(e) => onChange('major', e.target.value)}
            placeholder={t('personal_info.major_placeholder')}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      {/* Graduation Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_graduate"
          checked={formData.is_graduate}
          onChange={(e) => onChange('is_graduate', e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 text-secondary border-slate-200 rounded focus:ring-secondary cursor-pointer"
        />
        <label htmlFor="is_graduate" className="text-sm font-medium text-on-surface cursor-pointer select-none">
          {t('personal_info.is_graduate')}
        </label>
      </div>

      {/* Note: hired_at is set by backend automatically */}
      <p className="text-xs text-slate-500 italic">
        {t('personal_info.hire_date_note')}
      </p>
    </div>
  )
}
