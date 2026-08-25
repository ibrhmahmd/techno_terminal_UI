import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../../store/settingsStore'

export function LanguageSettings() {
  const { t } = useTranslation()
  const { locale, setLocale } = useSettingsStore()

  return (
    <div className="bg-white rounded-[6px] shadow-sm p-6">
      <h3 className="text-lg font-semibold text-on-surface mb-4">{t('navigation.settings')}</h3>
      <p className="text-sm text-on-surface-variant mb-4">
        {t('settings.choose_language')}
      </p>

      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors">
          <input
            type="radio"
            name="language"
            value="en"
            checked={locale === 'en'}
            onChange={() => setLocale('en')}
            className="w-4 h-4 text-secondary border-outline-variant focus:ring-secondary"
          />
          <span className="text-sm font-medium text-on-surface">English</span>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors">
          <input
            type="radio"
            name="language"
            value="ar"
            checked={locale === 'ar'}
            onChange={() => setLocale('ar')}
            className="w-4 h-4 text-secondary border-outline-variant focus:ring-secondary"
          />
          <span className="text-sm font-medium text-on-surface">العربية</span>
        </label>
      </div>
    </div>
  )
}
