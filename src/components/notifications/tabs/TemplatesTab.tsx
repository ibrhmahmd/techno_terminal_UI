// Templates Tab
// Manage notification templates

import { useState } from 'react'
import { useNotificationTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate, useTestTemplate } from '../../../hooks/notifications'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import { Modal } from '../../common/Modal'
import { DataTableContainer } from '../../common/DataTableContainer'
import type { NotificationTemplateDTO, CreateTemplateRequest } from '../../../api/notifications'

export function TemplatesTab() {
  const { data: templates, isLoading } = useNotificationTemplates()
  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()
  const deleteTemplate = useDeleteTemplate()
  const testTemplate = useTestTemplate()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateDTO | null>(null)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [testTemplateId, setTestTemplateId] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-purple-600">description</span>
          </div>
          <div>
            <h3 className="font-medium text-on-surface">Notification Templates</h3>
            <p className="text-sm text-slate-500">Manage email templates for notifications</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary-dark transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Create Template
        </button>
      </div>

      {/* Templates Table */}
      <DataTableContainer>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Key</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {templates?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2 block">description</span>
                  No templates created yet
                </td>
              </tr>
            ) : (
              templates?.map(template => (
                <tr key={template.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{template.name}</p>
                    <p className="text-xs text-slate-500">{template.variables.length} variables</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 font-mono">{template.template_key}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{template.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${template.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setTestTemplateId(template.id)
                          setIsTestModalOpen(true)
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Test template"
                      >
                        <span className="material-symbols-outlined">send</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingTemplate(template)
                          setIsModalOpen(true)
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => deleteTemplate.mutate(template.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTableContainer>

      {/* Template Modal */}
      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={editingTemplate}
        onSave={(data) => {
          if (editingTemplate) {
            updateTemplate.mutate({ id: editingTemplate.id, request: data })
          } else {
            createTemplate.mutate(data as CreateTemplateRequest)
          }
          setIsModalOpen(false)
        }}
      />

      {/* Test Modal */}
      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        templateId={testTemplateId}
        onTest={(email, variables) => {
          if (testTemplateId) {
            testTemplate.mutate({ id: testTemplateId, request: { recipient_email: email, variable_values: variables } })
          }
          setIsTestModalOpen(false)
        }}
      />
    </div>
  )
}

// Template Modal Component
interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template: NotificationTemplateDTO | null
  onSave: (data: Partial<NotificationTemplateDTO> & { template_key?: string }) => void
}

function TemplateModal({ isOpen, onClose, template, onSave }: TemplateModalProps) {
  const [name, setName] = useState(template?.name || '')
  const [templateKey, setTemplateKey] = useState(template?.template_key || '')
  const [subject, setSubject] = useState(template?.subject || '')
  const [bodyHtml, setBodyHtml] = useState(template?.body_html || '')
  const [bodyText, setBodyText] = useState(template?.body_text || '')
  const [isActive, setIsActive] = useState(template?.is_active ?? true)
  const [variables, setVariables] = useState(template?.variables || [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      template_key: templateKey,
      name,
      subject,
      body_html: bodyHtml,
      body_text: bodyText || undefined,
      is_active: isActive,
      variables,
    })
  }

  const addVariable = () => {
    setVariables([...variables, { name: '', description: '', required: true }])
  }

  const updateVariable = (index: number, field: string, value: string | boolean) => {
    const newVars = [...variables]
    newVars[index] = { ...newVars[index], [field]: value }
    setVariables(newVars)
  }

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Edit Template' : 'Create Template'}
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || !templateKey || !subject || !bodyHtml}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark disabled:opacity-50 transition-colors"
          >
            {template ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Template Key *</label>
            <input
              type="text"
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              placeholder="enrollment_confirmation"
              disabled={!!template}
              required
            />
            <p className="text-xs text-slate-500 mt-1">Unique identifier for this template</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              placeholder="Enrollment Confirmation"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
            placeholder="Welcome to Techno Terminal!"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">HTML Body *</label>
          <textarea
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent h-32 font-mono text-sm"
            placeholder="<h1>Hello {{name}}</h1>..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Plain Text Body (Optional)</label>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent h-24 font-mono text-sm"
            placeholder="Hello {{name}}..."
          />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-secondary rounded focus:ring-secondary"
            />
            <span className="text-sm text-slate-600">Template is active</span>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">Variables</label>
            <button
              type="button"
              onClick={addVariable}
              className="text-xs px-3 py-1 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
            >
              + Add Variable
            </button>
          </div>
          <div className="space-y-2">
            {variables.map((variable, index) => (
              <div key={index} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={variable.name}
                  onChange={(e) => updateVariable(index, 'name', e.target.value)}
                  placeholder="variable_name"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={variable.description}
                  onChange={(e) => updateVariable(index, 'description', e.target.value)}
                  placeholder="Description"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <label className="flex items-center gap-1 cursor-pointer px-2">
                  <input
                    type="checkbox"
                    checked={variable.required}
                    onChange={(e) => updateVariable(index, 'required', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs">Required</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeVariable(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}

// Test Modal Component
interface TestModalProps {
  isOpen: boolean
  onClose: () => void
  templateId: number | null
  onTest: (email: string, variables: Record<string, string>) => void
}

function TestModal({ isOpen, onClose, onTest }: TestModalProps) {
  const [email, setEmail] = useState('')
  const [variables] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onTest(email, variables)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Test Template"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!email}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark disabled:opacity-50 transition-colors"
          >
            Send Test
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
            placeholder="test@example.com"
            required
          />
        </div>

        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-sm text-slate-600">
            A test email will be sent to the specified address using this template.
          </p>
        </div>
      </form>
    </Modal>
  )
}
