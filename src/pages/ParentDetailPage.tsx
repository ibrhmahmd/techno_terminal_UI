import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { ParentForm } from '../components/crm/ParentForm'
import { getParent, updateParent, deleteParent, type Parent, searchStudents } from '../api/crm'
import type { StudentListItem } from '../api/crm'

export function ParentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('common')
  const parentId = Number(id) || 1

  const [parent, setParent] = useState<Parent | null>(null)
  const [linkedStudents, setLinkedStudents] = useState<StudentListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    async function loadParent() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getParent(parentId)
        setParent(data)
      } catch (err) {
        console.error('API Error:', err)
        setError(t('parentDetail.load_failed'))
        setParent(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadParent()
  }, [parentId])

  // Load linked students separately
  useEffect(() => {
    async function loadLinkedStudents() {
      if (!parentId) return
      setIsLoadingStudents(true)
      try {
        // Search for students with this parent
        // Note: This is a workaround if no direct endpoint exists
        const allStudents = await searchStudents('')
        // Filter students that have this parent linked
        // This is approximate - ideally we'd have GET /crm/parents/{id}/students
        const studentsWithParent = allStudents.filter(s => 
          s.full_name.toLowerCase().includes(parent?.full_name?.toLowerCase() || '')
        )
        setLinkedStudents(studentsWithParent)
      } catch (err) {
        console.error('Failed to load linked students:', err)
      } finally {
        setIsLoadingStudents(false)
      }
    }
    if (parent) {
      loadLinkedStudents()
    }
  }, [parentId, parent])

  const handleUpdateParent = async (data: Partial<Omit<Parent, 'id'>>) => {
    setIsProcessing(true)
    try {
      const updated = await updateParent(parentId, data)
      setParent(updated)
      setIsEditModalOpen(false)
      setError(null)
    } catch (error: any) {
      console.error('Failed to update parent:', error);
      setError(t('parentDetail.update_failed'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteParent = async () => {
    setIsProcessing(true)
    try {
      await deleteParent(parentId)
      navigate('/directory')
    } catch (error: any) {
      console.error('Failed to delete parent:', error);
      setError(t('parentDetail.delete_failed'))
      setIsDeleteModalOpen(false)
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Directory" />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Directory" />
        <div className="p-8 text-center text-slate-500">
          <p>{t('parentDetail.not_found')}</p>
          <button
            onClick={() => navigate('/directory')}
            className="mt-4 px-4 py-2 text-sm text-secondary border border-secondary rounded hover:bg-secondary-container"
          >
            {t('parentDetail.back_to_directory')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Directory" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <button
            onClick={() => navigate('/directory')}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-on-surface mb-2"
          >
            <span className="material-symbols-outlined text-sm icon-flip-rtl">arrow_back</span>
            {t('parentDetail.back_to_directory')}
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">{parent.full_name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-colors"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                {t('parentDetail.edit')}
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                {t('parentDetail.delete')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="p-8 max-w-[1400px] mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Contact Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">{t('parentDetail.contact_information')}</h2>
            <div className="space-y-4">
              {parent.phone_primary && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">phone</span>
                  <div>
                    <p className="text-sm text-slate-500">{t('parentDetail.phone')}</p>
                    <p className="text-on-surface">{parent.phone_primary}</p>
                  </div>
                </div>
              )}
              {parent.phone_secondary && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">phone_iphone</span>
                  <div>
                    <p className="text-sm text-slate-500">{t('parentDetail.secondary_phone')}</p>
                    <p className="text-on-surface">{parent.phone_secondary}</p>
                  </div>
                </div>
              )}
              {parent.email && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">email</span>
                  <div>
                    <p className="text-sm text-slate-500">{t('parentDetail.email')}</p>
                    <p className="text-on-surface">{parent.email}</p>
                  </div>
                </div>
              )}
              {parent.relation && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">group</span>
                  <div>
                    <p className="text-sm text-slate-500">{t('parentDetail.relation')}</p>
                    <p className="text-on-surface capitalize">{parent.relation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Students */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">{t('parentDetail.children')}</h2>
            {isLoadingStudents ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : linkedStudents.length === 0 ? (
              <p className="text-slate-500 text-sm">{t('parentDetail.no_students_linked')}</p>
            ) : (
              <div className="space-y-3">
                {linkedStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => navigate(`/students/${student.id}`)}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400">school</span>
                      <p className="font-medium text-on-surface">{student.full_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      student.status === 'active' ? 'bg-green-100 text-green-700' : 
                      student.status === 'waiting' ? 'bg-amber-100 text-amber-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                    {student.status === 'active' ? t('parentDetail.status_active') : 
                     student.status === 'waiting' ? t('parentDetail.status_waiting') : 
                     t('parentDetail.status_inactive')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Edit Parent Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('parentDetail.edit_title')}
      >
        <ParentForm
          initialData={parent}
          onSubmit={handleUpdateParent}
          onCancel={() => setIsEditModalOpen(false)}
          mode="edit"
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('parentDetail.delete_title')}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {t('common:buttons.cancel')}
            </button>
            <button
              onClick={handleDeleteParent}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isProcessing && <LoadingSpinner size="sm" />}
              {t('parentDetail.delete')}
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          {t('parentDetail.delete_confirm', { name: parent.full_name })}
        </p>
      </Modal>
    </div>
  )
}
