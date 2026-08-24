import { Component, type ErrorInfo, type ReactNode } from 'react'
import { withTranslation, type WithTranslation } from 'react-i18next'

type ErrorBoundaryProps = WithTranslation & {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundaryBase extends Component<ErrorBoundaryProps, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      const { t } = this.props
      return this.props.fallback || (
        <div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
          <h2 className="text-xl font-bold text-red-800 mb-2">{t('errors.somethingWentWrong')}</h2>
          <p className="text-red-600 mb-4">{this.state.error?.message || t('errors.unexpectedError')}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('errors.tryAgain')}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export const ErrorBoundary = withTranslation('common')(ErrorBoundaryBase)
