export function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <style>{`
        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
        }
        .spinner {
          width: 2rem;
          height: 2rem;
          border: 2px solid var(--outline-variant);
          border-top-color: var(--secondary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
