// CRM Settings Tab
// Configuration for CRM features: waiting list, student defaults, notifications

import { useState, useEffect } from 'react'
import { Save, Users, Bell, Calendar, Settings } from 'lucide-react'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface CRMSettings {
  // Waiting List Settings
  defaultWaitingPriority: number
  autoPromoteWhenSpotOpens: boolean
  notifyParentsOnPromotion: boolean
  
  // Student Defaults
  defaultStudentStatus: 'active' | 'waiting'
  autoArchiveAfterDays: number | null
  
  // Parent Communication
  defaultNotificationChannel: 'email' | 'sms' | 'whatsapp'
  notifyOnStatusChange: boolean
  
  // Data Display
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  phoneFormat: 'international' | 'local'
}

const defaultSettings: CRMSettings = {
  defaultWaitingPriority: 3,
  autoPromoteWhenSpotOpens: false,
  notifyParentsOnPromotion: true,
  defaultStudentStatus: 'waiting',
  autoArchiveAfterDays: null,
  defaultNotificationChannel: 'whatsapp',
  notifyOnStatusChange: true,
  dateFormat: 'DD/MM/YYYY',
  phoneFormat: 'international',
}

export function CRMSettingsTab() {
  const [settings, setSettings] = useState<CRMSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load settings from localStorage (or API in production)
  useEffect(() => {
    setIsLoading(true)
    const stored = localStorage.getItem('crm-settings')
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch {
        console.error('Failed to parse CRM settings')
      }
    }
    setIsLoading(false)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In production, this would be an API call
      localStorage.setItem('crm-settings', JSON.stringify(settings))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = <K extends keyof CRMSettings>(
    key: K,
    value: CRMSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">CRM Settings</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure default behaviors for student and parent management
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 text-sm">
          Settings saved successfully!
        </div>
      )}

      {/* Waiting List Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-on-surface">Waiting List</h3>
            <p className="text-sm text-slate-500">Configure waiting list behavior</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Default Priority for New Students
            </label>
            <select
              value={settings.defaultWaitingPriority}
              onChange={(e) => updateSetting('defaultWaitingPriority', Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? '(Highest)' : n === 5 ? '(Lowest)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Auto-Promote When Spot Opens
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateSetting('autoPromoteWhenSpotOpens', !settings.autoPromoteWhenSpotOpens)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoPromoteWhenSpotOpens ? 'bg-secondary' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoPromoteWhenSpotOpens ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-slate-600">
                {settings.autoPromoteWhenSpotOpens ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Notify Parents on Promotion
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateSetting('notifyParentsOnPromotion', !settings.notifyParentsOnPromotion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifyParentsOnPromotion ? 'bg-secondary' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifyParentsOnPromotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-slate-600">
                {settings.notifyParentsOnPromotion ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Student Defaults Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-on-surface">Student Defaults</h3>
            <p className="text-sm text-slate-500">Default settings for new students</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Default Status for New Students
            </label>
            <select
              value={settings.defaultStudentStatus}
              onChange={(e) => updateSetting('defaultStudentStatus', e.target.value as 'active' | 'waiting')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
            >
              <option value="active">Active</option>
              <option value="waiting">Waiting List</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Auto-Archive Inactive Students
            </label>
            <select
              value={settings.autoArchiveAfterDays || ''}
              onChange={(e) => updateSetting('autoArchiveAfterDays', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
            >
              <option value="">Never</option>
              <option value="30">After 30 days</option>
              <option value="60">After 60 days</option>
              <option value="90">After 90 days</option>
              <option value="180">After 6 months</option>
            </select>
          </div>
        </div>
      </section>

      {/* Communication Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-on-surface">Communication</h3>
            <p className="text-sm text-slate-500">Parent notification preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Default Notification Channel
            </label>
            <select
              value={settings.defaultNotificationChannel}
              onChange={(e) => updateSetting('defaultNotificationChannel', e.target.value as 'email' | 'sms' | 'whatsapp')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Notify on Status Changes
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateSetting('notifyOnStatusChange', !settings.notifyOnStatusChange)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifyOnStatusChange ? 'bg-secondary' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifyOnStatusChange ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-slate-600">
                {settings.notifyOnStatusChange ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Data Display Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-on-surface">Data Display</h3>
            <p className="text-sm text-slate-500">Format preferences for dates and phone numbers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => updateSetting('dateFormat', e.target.value as CRMSettings['dateFormat'])}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Phone Number Format
            </label>
            <select
              value={settings.phoneFormat}
              onChange={(e) => updateSetting('phoneFormat', e.target.value as 'international' | 'local')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
            >
              <option value="international">International (+20 123 456 7890)</option>
              <option value="local">Local (0123 456 7890)</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  )
}
