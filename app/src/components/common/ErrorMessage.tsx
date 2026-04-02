interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="error-message">
      <span className="material-symbols-outlined">error</span>
      <span>{message}</span>
      <style>{`
        .error-message {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4);
          background-color: #ffdad6;
          color: #93000a;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
        }
        .error-message .material-symbols-outlined {
          font-size: 1.25rem;
        }
      `}</style>
    </div>
  )
}
