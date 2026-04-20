import { FileText, Calendar, User, Download } from 'lucide-react'
import type { ReactNode } from 'react'
import { Modal } from '../Modal'
import { LoadingSpinner } from '../LoadingSpinner'

interface SectionItem {
  label: string
  value: string | number
  icon?: ReactNode
  highlight?: boolean
}

interface Section {
  id: string
  title?: string
  items: SectionItem[]
}

interface DocumentInfo {
  type: 'receipt' | 'invoice' | 'certificate' | 'other'
  id: string | number
  number?: string
  date?: string
  issuer?: string
  onDownload?: () => void
  isDownloading?: boolean
}

interface ItemDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  sections: Section[]
  document?: DocumentInfo
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function ItemDetailDialog({
  isOpen,
  onClose,
  title,
  sections,
  document,
  footer,
  size = 'md',
  isLoading,
}: ItemDetailDialogProps) {
  const documentTypeLabels = {
    receipt: 'Receipt',
    invoice: 'Invoice',
    certificate: 'Certificate',
    other: 'Document',
  }

  const customFooter = (
    <div className="flex gap-3 w-full">
      {document?.onDownload && (
        <button
          onClick={document.onDownload}
          disabled={document.isDownloading}
          className="flex-1 flex items-center justify-center gap-2 bg-secondary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50"
        >
          {document.isDownloading ? (
            <>
              <LoadingSpinner size="sm" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </button>
      )}
      <button
        onClick={onClose}
        className="px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition-colors"
      >
        Close
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={footer || (document?.onDownload ? customFooter : undefined)}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id}>
              {section.title && (
                <h4 className="font-medium text-slate-700 mb-3">{section.title}</h4>
              )}
              <div className={`${section.title ? 'bg-slate-50 rounded-lg p-4' : ''}`}>
                <div className={`grid gap-4 ${section.items.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {section.items.map((item, index) => (
                    <div key={index}>
                      <label className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                        {item.icon}
                        {item.label}
                      </label>
                      <p className={`${item.highlight ? 'font-semibold text-on-surface' : 'font-medium text-on-surface'}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {document && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-slate-700 mb-3">
                {documentTypeLabels[document.type]}
              </h4>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {document.number && (
                    <div>
                      <label className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                        <FileText className="w-3 h-3" />
                        Number
                      </label>
                      <p className="font-semibold text-on-surface">{document.number}</p>
                    </div>
                  )}
                  {document.date && (
                    <div>
                      <label className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" />
                        Date
                      </label>
                      <p className="font-semibold text-on-surface">{document.date}</p>
                    </div>
                  )}
                  {document.issuer && (
                    <div>
                      <label className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                        <User className="w-3 h-3" />
                        Issuer
                      </label>
                      <p className="font-semibold text-on-surface">{document.issuer}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

export default ItemDetailDialog
