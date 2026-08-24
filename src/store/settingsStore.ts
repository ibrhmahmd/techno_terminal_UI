import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '../i18n'

type Locale = 'en' | 'ar'
type Direction = 'ltr' | 'rtl'

interface SettingsState {
  locale: Locale
  direction: Direction
  setLocale: (locale: Locale) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: 'en',
      direction: 'ltr',
      setLocale: (locale) => {
        const direction = locale === 'ar' ? 'rtl' : 'ltr'
        set({ locale, direction })
        i18n.changeLanguage(locale)
        document.documentElement.dir = direction
        document.documentElement.lang = locale
      },
    }),
    {
      name: 'settings-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          i18n.changeLanguage(state.locale)
          document.documentElement.dir = state.direction
          document.documentElement.lang = state.locale
        }
      },
    }
  )
)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'settings-storage') {
      try {
        const newValue = (e as StorageEvent).newValue || localStorage.getItem('settings-storage')
        if (newValue) {
          const parsed = JSON.parse(newValue)
          if (parsed?.state) {
            useSettingsStore.setState(parsed.state)
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
  })
}
