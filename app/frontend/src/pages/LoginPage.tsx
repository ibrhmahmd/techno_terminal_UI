import { useState, FormEvent } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { login } from '../api/auth'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export function LoginPage() {
  const navigate = useNavigate()
  const { token, login: storeLogin } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await login({ email, password })
      if (response.success) {
        storeLogin(response.data.access_token, response.data.user)
        navigate('/dashboard')
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('Invalid email or password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Techno Terminal</h1>
          <p>CRM Sign In</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@techno.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? <LoadingSpinner /> : 'Sign In'}
          </button>
        </form>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--surface);
          padding: var(--space-4);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          background-color: var(--surface-container-lowest);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .login-header {
          text-align: center;
          margin-bottom: var(--space-6);
        }
        .login-header h1 {
          font-family: var(--font-headline);
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--primary);
          margin-bottom: var(--space-1);
        }
        .login-header p {
          font-size: var(--text-sm);
          color: var(--on-surface-variant);
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .login-error {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background-color: #ffdad6;
          color: #93000a;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
        }
        .login-error .material-symbols-outlined {
          font-size: 1.25rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .form-group label {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--on-surface);
        }
        .form-group input {
          padding: var(--space-3) var(--space-4);
          font-size: var(--text-base);
          border: 1px solid var(--outline-variant);
          border-radius: var(--radius-md);
          background-color: var(--surface-container-lowest);
          color: var(--on-surface);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(0, 106, 97, 0.1);
        }
        .form-group input:disabled {
          background-color: var(--surface-container-low);
          cursor: not-allowed;
        }
        .login-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--on-secondary);
          background-color: var(--secondary);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-top: var(--space-2);
        }
        .login-button:hover:not(:disabled) {
          background-color: #005049;
        }
        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .login-button .loading-spinner {
          padding: 0;
        }
        .login-button .spinner {
          width: 1.25rem;
          height: 1.25rem;
          border-color: rgba(255, 255, 255, 0.3);
          border-top-color: white;
        }
      `}</style>
    </div>
  )
}
